require("dotenv").config();
const express = require("express");
const { uploadToDisk } = require("../multer");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const { isAscii } = require("buffer");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/",isAuthenticated, async (req, res) => {
  try {
    console.log("req.user:", req.user);

    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });

    folders.forEach((folder) => {
      folder.files.forEach((file) => {
        file.url = supabase.storage
          .from("uploads")
          .getPublicUrl(file.path).publicURL;
      });
    });

    res.render("dashboard", { user: req.user, folders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

router.post(
  "/:folderId/upload",
  uploadToDisk.single("file"),
  async (req, res) => {
    const folderId = req.params.folderId;
    console.log("Folder ID:", folderId);

    if (!req.file) {
      return res.status(400).send("No file uploaded or invalid file type");
    }
    try {
      const fileBuffer = fs.readFileSync(req.file.path);

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(
          `${req.user.id}/${folderId}/${req.file.originalname}`,
          fileBuffer,
          {
            contentType: req.file.mimetype,
          }
        );

      if (error) {
        throw new Error(error.message);
      }

      await prisma.file.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          userId: req.user.id,
          folderId: parseInt(folderId),
          path: data.path,
          size: req.file.size,
        },
      });

      fs.unlinkSync(req.file.path);

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Error uploading file");
    }
  }
);

router.post("/create-folder", async (req, res) => {
  const { folderName } = req.body;
  if (!folderName) {
    return res.status(400).send("Folder name is required");
  }
  try {
    await prisma.folder.create({
      data: { name: folderName, userId: req.user.id },
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating folder");
  }
});
module.exports = router;
