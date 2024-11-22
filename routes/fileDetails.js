const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.get("/:fileid", async (req, res) => {
  const { fieldId } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fieldId)},
    })

    if (!file){
      return res.status(404).send("File not found");
    }
    
    res.render("fileDetails", {file});
  }
  catch (error){
    console.error(error);
    res.status(500).send("Error fetching file details");
  }
})

module.exports = router;