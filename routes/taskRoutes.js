const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/taskController");
const { auth, isAdmin } = require("../middleware/auth");
// Modifier un commentaire
router.patch("/:id/comments/:commentId", auth, taskCtrl.editComment);

// Toutes les routes nécessitent d'être connecté
router.get("/", auth, taskCtrl.getTasks);
// Seul l'admin peut créer une tâche
router.post("/", auth, taskCtrl.addTask);
router.put("/:id", auth, taskCtrl.editTask);
router.patch("/:id/toggle", auth, taskCtrl.toggleTask);
router.delete("/:id", auth, taskCtrl.removeTask);
// Ajouter un commentaire
router.post("/:id/comments", auth, taskCtrl.addComment);
// Supprimer un commentaire
router.delete("/:id/comments/:commentId", auth, taskCtrl.deleteComment);

module.exports = router;
