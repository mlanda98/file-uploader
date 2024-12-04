const express = require("express");
const multer = require("../multer");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

router.post("/:folderId/files", multer.single("file"), async (req, res) => {
const { folderId } = req.params;
console.log("Folder ID:", folderId); // Check folderId
console.log("Uploaded file:", req.file); // Check uploaded file

if (!req.file) {
  return res.status(400).send({ error: "No file uploaded or invalid file type" });
}
  try {
    const filePath = `/uploads/${file.folderId}/${req.file.filename}`;
    console.log('File path:', filePath); 
    const file = await prisma.file.create({
      data: {
        name: req.body.name || "Untitled File",
        path: filePath,
        size: req.file.size,
        folderId: parseInt(folderId),
        filename: req.file.filename,
      }
    });
     res.status(201).json(file);
  } catch (error){
    console.error("Error saving file details:", error)
    res.status(500).json({ error: "Error fetching file details"})
  }
})

router.get("/:folderId/files", async (req, res) => {
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

router.delete("/files/:fileId", async (req, res) => {
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

router.get("/files/:fileId/details", async (req, res) => {
  const { fileId } = req.params;

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