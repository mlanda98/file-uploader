require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await prisma.folder.create({
      data: { name, userId: req.user.id },
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: "Error creating folder" });
  }
});

router.get("/", async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching folders" });
  }
});

router.put("/folder/:id/update", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await prisma.folder.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.redirect(`/dashboard`);
  } catch (error) {
    res.status(500).json({ error: "Error updating folder" });
  }
});

router.delete("/folder/:id/delete", async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
      include: { files: true },
    });
    console.log("Folder details:", folder);

    if (!folder) {
      console.log("Folder not found");
      return res.status(404).json({ error: "folder not found" });
    }

    const filePaths = folder.files.map((file) => file.path);
    const { error } = await supabase.storage.from("uploads").remove(filePaths);

    await prisma.file.deleteMany({
      where: { folderId: parseInt(id) },
    });
    console.log("Files deleted");

    await prisma.folder.delete({
      where: { id: parseInt(id) },
    });
    console.log("Redirecting to /dashboard");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting folder" });
  }
});

module.exports = router;
