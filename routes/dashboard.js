const express = require("express");
const upload = require("../multer");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("dashboard");
})
router.post("/upload", upload.single("file"), (req,res) => {
  if (!req.file){
    return res.status(400).send("No file uploaded or invalid file type");
  }
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

module.exports = router;

