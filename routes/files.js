const express = require("express");
const multer = require("../multer");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

router.post("/:folderId/upload", multer.single("file"), async (req, res) => {
  const { folderId } = req.params;

  if (!req.file){
    return res.status(400).send("No file uploaded or invalid file type");
  }
 
  try {
    const file = await prisma.file.create({
      data: {
        name: req.file.filename,
        path: req.file.path,
        folderId: parseInt(folderId),
      }
    });
    res.json(file);
  } catch (error){
    res.status(500).json({ error: "Error uploading file" });
  }
})

router.get("/:folderId", async (req, res) => {
  const { folderId } = req.params;
  try{
    const files = await prisma.file.findMany({
      where: { folderId: parseInt(folderId) },
    });
    res.json(files);
  } catch (error){
    res.status(500).json({ error: "Error fetching files" });
  }
})

router.delete("/:fileId", async (req, res) => {
  const { fileId } = req.params;
  try {
    const file = await prisma.file.delete({
      where: { id: parseInt(fileId) },
    });
    res.json(file);
  } catch (error){
    res.status(500).json({ error: "Error deleting file"});
  }
})

module.exports = router;