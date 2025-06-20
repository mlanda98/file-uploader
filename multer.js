const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "..", "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const memoryStorage = multer.memoryStorage();

const uploadToDisk = multer({ storage });
const uploadToMemory = multer({ storage: memoryStorage });

module.exports = { uploadToDisk, uploadToMemory };
