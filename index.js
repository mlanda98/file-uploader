const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store")

const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({extended: true}));
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


app.use(session)({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdFunction: true,
      dbRecordIdFunction: undefined,
    }
  ),
  cookie: {secret: false}
})
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});