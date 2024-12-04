const expires = require("express");
const {PrismaClient} = require("@prisma/client");
const router = expires.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await prisma.folder.create({
      data: {name},
    });
    res.status(201).json(folder);
  } catch (error){
    res.status(500).json({error: "Error creating folder"});
  }
})

router.get("/", async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      include: {files: true},
    });
    res.json(folders);
  } catch (error){
    res.status(500).json({ error: "Error fetching folders"});
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try{
    const folder = await prisma.folder.update({
      where: { id: parseInt(id) },
      data: {name},
    });
    res.json(folder);
  } catch (error){
    res.status(500).json({ error: "Error updating folder" });
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try{
    await prisma.folder.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch(error){
    res.status(500).json({ error: "Error deleting folder"});
  }
})

module.exports = router;