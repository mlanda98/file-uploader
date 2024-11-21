const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = `./uploads/${req.params.folderId}`;
    if (!fs.existsSync(folderPath)){
      fs.mkdirSync(folderPath, {recursive: true});
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|docx|txt/;
  const extname = allowedTypes.text(path.extname(file.originalname).toLocaleLowerCase());
  const mineType = allowedTypes.test(file.mimetype);

  if (extname && mineType){
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
}
const upload = multer({ storage, fileFilter });

module.exports = upload;