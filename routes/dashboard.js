const express = require("express");
const upload = require("../multer");
const router = express.Router();
const ensureAuthenticated = require("./auth")
const { PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", ensureAuthenticated, async (req, res) => {
  try{
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    console.log(folders);

    const filesWithoutFolder = await prisma.file.findMany({
      where: { userId: req.user.id, folderId: null },
    });
    console.log(filesWithoutFolder);

    res.render("dashboard", { user: req.user, folders, filesWithoutFolder });
  } catch(err){
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

router.post("/:folderId/upload", ensureAuthenticated, upload.single("file"), async (req,res) => {
  const folderId = req.params.folderId;
  console.log("Folder ID:", folderId);

  if (!req.file){
    return res.status(400).send("No file uploaded or invalid file type");
  }
  try{
    await prisma.file.create({
      data: {
        filename: req.file.filename, 
        originalName: req.file.originalname,
        userId: req.user.id,
        folderId: folderId ? parseInt(folderId) : null,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
      },
    });
    res.redirect("/dashboard");
  } catch(err){
    console.error(err);
    res.status(500).send("Error uploading file");
  }
});

router.post("/create-folder", ensureAuthenticated, async (req, res) => {
  const { folderName } = req.body;
  if (!folderName){
    return res.status(400).send("Folder name is required");
  }
  try{
    await prisma.folder.create({
      data: { name: folderName, userId: req.user.id }
    });
    res.redirect("/dashboard");
  } catch (err){
    console.error(err);
    res.status(500).send("Error creating folder");
  }
})
module.exports = router;

