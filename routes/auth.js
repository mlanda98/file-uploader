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

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
