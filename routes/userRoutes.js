const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const { auth, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Route d'inscription
router.post("/register", userController.register);
// Route de connexion
router.post("/login", userController.login);
// Liste des utilisateurs (admin)

// Modifier son profil (utilisateur connecté, upload ou url)
router.put("/me", auth, upload.single("photoFile"), userController.updateMe);

router.get("/", auth, isAdmin, userController.getAll);

module.exports = router;
