const express = require("express");
const jsonParser = express.json();
const multer = require("multer");

const postImgRouter = express.Router();

// Определение хранилища для загруженных файлов
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "postUploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

// Фильтрация загружаемого файла по типу
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Передача хранилища и фильтрации в multer
const upload = multer({ storage: storageConfig, fileFilter: fileFilter });

//post img в /posstUploads
postImgRouter.post(
  "/postimg",
  upload.single("file"),
  jsonParser,
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) res.status(400).json("Нет файла");
      else res.status(200).json(file.path);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

module.exports = postImgRouter;
