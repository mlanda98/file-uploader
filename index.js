require("dotenv").config();
const methodOverride = require("method-override");
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const path = require("path");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");
const app = express();
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"))
const flash = require("connect-flash");
const { nextTick } = require("process");
const prisma = new PrismaClient();

app.use((req, res, next) => {
  if (req.originalUrl === "/favicon.ico") {
    return res.status(204).end();
  }
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
console.log("session secret:", process.env.SESSION_SECRET);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false, { message: "Incorrect username." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.set("trust proxy", 1); // Trust the first proxy

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: false,
      fields: {
        id: "sid",
        data: "data",
        expires: "expiresAt",
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.use("/folders", folderRoutes);
app.use("/files", fileRoutes);
app.get("/home", (req, res) => {
  res.render("home"); // This assumes your home.ejs is in the "views" folder
});

app.set("view engine", "ejs");
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(middleware.route.path, middleware.route.methods);
  }
});

app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
