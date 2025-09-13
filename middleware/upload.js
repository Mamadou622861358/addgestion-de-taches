const multer = require("multer");
const path = require("path");

// Configurer le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name =
      req.user && req.user.userId
        ? req.user.userId + "-" + Date.now() + ext
        : Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images JPEG et PNG sont autorisées"));
    }
  },
});

module.exports = upload;
