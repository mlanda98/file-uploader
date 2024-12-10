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
const prisma = new PrismaClient();

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
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      fields: {
        id: "id",
        data: "data",
        expires: "expires",
      },
    }),
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/folders", folderRoutes);
app.use("/files", fileRoutes);

app.use("/", authRoutes);
app.set("view engine", "ejs");

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


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
