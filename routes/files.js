const express = require("express");
const multer = require("../multer");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

router.post("/:folderId/files", multer.single("file"), async (req, res) => {
  const { folderId } = req.params;
  console.log("Folder ID:", folderId); // Check folderId
  console.log("Uploaded file:", req.file); // Check uploaded file

  if (!req.file) {
    return res
      .status(400)
      .send({ error: "No file uploaded or invalid file type" });
  }
  try {
    const filePath = `/uploads/${req.file.filename}`;
    console.log("File path:", filePath);
    const file = await prisma.file.create({
      data: {
        name: req.body.name || "Untitled File",
        path: filePath,
        size: req.file.size,
        folderId: parseInt(folderId),
        filename: req.file.filename,
      },
    });
    res.status(201).json(file);
  } catch (error) {
    console.error("Error saving file details:", error);
    res.status(500).json({ error: "Error fetching file details" });
  }
});

router.get("/:folderId/files", async (req, res) => {
  const { folderId } = req.params;
  try {
    const files = await prisma.file.findMany({
      where: { folderId: parseInt(folderId) },
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error fetching files" });
  }
});

router.delete("/file/:fileId/delete", async (req, res) => {
  const { fileId } = req.params;
  console.log(`Delete request received for file ID: ${fileId}`);
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!file) {
      console.log("File not found");
      return res.status(404).json({ error: "file not found" });
    }
    const filePath = path.join(
      __dirname,
      `../uploads/${file.folderId}/${file.filename}`
    );
    console.log(`File path for deletion: ${filePath}`);

    await new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file from filesystem:", err);
          reject(err);
        } else {
          console.log("File deleted from filesystem");
          resolve();
        }
      });
    });

    await prisma.file.delete({
      where: { id: parseInt(fileId) },
    });
    console.log("File deleted from database");
    res.redirect(`/dashboard`);
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file: ${error.message" });
  }
});

router.get("/file/:fileId/details", async (req, res) => {
  console.log("accessing file details route");
  const { fileId } = req.params;
  console.log(fileId);

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    res.render("fileDetails", { file });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching file details");
  }
});

module.exports = router;
