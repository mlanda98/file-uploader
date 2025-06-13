require("dotenv").config();
const express = require("express");
const passport = require("passport");
const router = express.Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { resolveInclude } = require("ejs");

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.create({
      data: {
        username: username,
        password: hashPassword,
      },
    });
    res.status(201).redirect("/login");
    console.log(`new user: ${username}, password: ${password}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during registration");
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).send("An error occurred during login");
    }

    if (!user) {
      console.log("Login failed:", info.message);
      return res.status(401).send(info.message);
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log("logged in:", req.user);
      req.session.save(() => {
        res.redirect("/dashboard");
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
