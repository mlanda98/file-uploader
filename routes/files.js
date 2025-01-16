require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const { uploadToDisk } = require("../multer");
const path = require("path");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post(
  "/:folderId/files",
  uploadToDisk.single("file"),
  async (req, res) => {
    const { folderId } = req.params;
    console.log("Folder ID:", folderId); // Check folderId
    console.log("Uploaded file:", req.file); // Check uploaded file

    if (!req.file) {
      return res
        .status(400)
        .send({ error: "No file uploaded or invalid file type" });
    }

    const filePath = req.file.path;

    try {
      const fileBuffer = fs.readFileSync(filePath);

      const fileSupabasePath = `${req.user.id}/${folderId}/${req.file.filename}`;

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileSupabasePath, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("error uploading to supabase:", error.message);
        return res.status(500).send({ error: "Error uploading to Supabase" });
      }

      const file = await prisma.file.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: fileSupabasePath,
          userId: req.user.id,
          size: req.file.size,
          folderId: parseInt(folderId),
        },
      });

      fs.unlinkSync(filePath);

      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error saving file details:", error.message);
      res.status(500).json({ error: "Error fetching file details" });
    }
  }
);

router.get("/:folderId/files", async (req, res) => {
  const { folderId } = req.params;
  try {
    const files = await prisma.file.findMany({
      where: { folderId: parseInt(folderId) },
    });

    const filesWithUrls = files.map((file) => {
      const { data, error } = supabase.storage
        .from("uploads")
        .getPublicUrl(file.path);

      return {
        ...file,
        url: data.publicUrl,
      };
    });
    res.json(filesWithUrls);
  } catch (error) {
    res.status(500).json({ error: "Error fetching files" }, error.message);
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
    const { error } = await supabase.storage
      .from("uploads")
      .remove([`${req.user.id}/${file.folderId}/${file.filename}`]);

    if (error) {
      console.error("Error deleting file from supabase", error);
      return res
        .status(500)
        .json({ error: `Error deleting file from Supabase: ${error.message}` });
    }

    await prisma.file.delete({
      where: { id: parseInt(fileId) },
    });
    console.log("File deleted from database");
    res.redirect(`/dashboard`);
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ error: "Error deleting file: ${error.message}" });
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

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(file.path);

      const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      return res.status(500).send("Error generating url");
    }

    console.log("generated public url", publicUrl);

    res.render("fileDetails", { file, publicUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching file details");
  }
});

router.get("/file/:fileId/download", async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const { data: publicUrlData, error} = supabase.storage
      .from("uploads")
      .getPublicUrl(file.path);

    if (error) {
      console.log(error.message);
      return res.status(500).send("Error generating url");
    }

    const publicUrl = publicUrlData.publicUrl;

    console.log("generated public url", publicUrl);
    res.redirect(publicUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading file");
  }
});

module.exports = router;
