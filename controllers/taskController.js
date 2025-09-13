// Modifier un commentaire d’une tâche
exports.editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ error: "Texte requis" });
    const task = await Task.findById(id);
    if (!task) {
      console.error("Tâche non trouvée pour l’édition de commentaire", id);
      return res.status(404).json({ error: "Tâche non trouvée" });
    }
    const comment = task.comments.id(commentId);
    if (!comment) {
      console.error(
        "Commentaire non trouvé pour édition",
        commentId,
        "dans",
        task.comments.map((c) => c._id)
      );
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }
    // Seul l’auteur du commentaire ou l’admin peut modifier
    if (String(comment.by) !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    comment.text = text.trim();
    await task.save();
    res.json({ comments: task.comments });
  } catch (err) {
    console.error("Erreur serveur lors de l’édition de commentaire", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};
// Supprimer un commentaire d’une tâche
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    console.log(
      "[Suppression commentaire] Tâche:",
      id,
      "Commentaire:",
      commentId,
      "User:",
      req.user.userId,
      "Role:",
      req.user.role
    );
    const task = await Task.findById(id);
    if (!task) {
      console.error("Tâche non trouvée pour suppression de commentaire", id);
      return res.status(404).json({ error: "Tâche non trouvée" });
    }
    console.log(
      "Commentaires existants:",
      task.comments.map((c) => c._id.toString())
    );
    const comment = task.comments.id(commentId);
    if (!comment) {
      console.error(
        "Commentaire non trouvé pour suppression",
        commentId,
        "dans",
        task.comments.map((c) => c._id)
      );
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }
    // Seul l’auteur du commentaire ou l’admin peut supprimer
    if (String(comment.by) !== req.user.userId && req.user.role !== "admin") {
      console.warn(
        "Suppression refusée: utilisateur non autorisé",
        req.user.userId,
        "pour",
        commentId
      );
      return res.status(403).json({ error: "Non autorisé" });
    }
    task.comments.pull(commentId);
    await task.save();
    console.log("Suppression réussie du commentaire", commentId);
    res.json({ comments: task.comments });
  } catch (err) {
    console.error("Erreur serveur lors de la suppression de commentaire", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};
// Ajouter un commentaire à une tâche
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ error: "Commentaire requis" });
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    // Seul l’admin ou l’assigné peut commenter
    if (req.user.role !== "admin" && String(task.user) !== req.user.userId)
      return res.status(403).json({ error: "Non autorisé" });
    task.comments.push({
      text: text.trim(),
      by: req.user.userId,
      date: new Date(),
    });
    await task.save();
    res.json(task.comments);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
const Task = require("../models/Task");

// Obtenir toutes les tâches (admin : toutes, user : ses tâches)
exports.getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "admin") {
      filter = { user: req.user.userId };
    }
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("createdBy", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Ajouter une tâche (admin : doit fournir user assigné)
exports.addTask = async (req, res) => {
  try {
    const {
      title,
      user,
      description = "",
      priority = "moyenne",
      deadline,
    } = req.body;
    if (!title || !title.trim() || !user)
      return res
        .status(400)
        .json({ error: "Titre et utilisateur assigné requis" });
    const task = new Task({
      title: title.trim(),
      user,
      createdBy: req.user.userId,
      description,
      priority,
      deadline: deadline ? new Date(deadline) : undefined,
      history: [
        {
          action: "création",
          by: req.user.userId,
          date: new Date(),
          details: `Tâche créée et assignée à l'utilisateur ${user}`,
        },
      ],
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Modifier une tâche (titre, description, priorité, deadline)
exports.editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, deadline } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ error: "Titre requis" });
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    if (req.user.role !== "admin" && String(task.user) !== req.user.userId)
      return res.status(403).json({ error: "Non autorisé" });
    const before = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline,
    };
    task.title = title.trim();
    if (typeof description === "string") task.description = description;
    if (priority) task.priority = priority;
    if (deadline !== undefined)
      task.deadline = deadline ? new Date(deadline) : undefined;
    task.history.push({
      action: "modification",
      by: req.user.userId,
      date: new Date(),
      details: `Avant: ${JSON.stringify(before)}, Après: ${JSON.stringify({
        title,
        description,
        priority,
        deadline,
      })}`,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Basculer l’état fait/non fait (seul l’assigné ou l’admin)
exports.toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    if (req.user.role !== "admin" && String(task.user) !== req.user.userId)
      return res.status(403).json({ error: "Non autorisé" });
    task.done = !task.done;
    task.history.push({
      action: "changement état",
      by: req.user.userId,
      date: new Date(),
      details: `Tâche marquée comme ${task.done ? "faite" : "à faire"}`,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer une tâche (seul l’assigné ou l’admin)
exports.removeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Tâche non trouvée" });
    if (req.user.role !== "admin" && String(task.user) !== req.user.userId)
      return res.status(403).json({ error: "Non autorisé" });
    task.history.push({
      action: "suppression",
      by: req.user.userId,
      date: new Date(),
      details: "Tâche supprimée",
    });
    await task.save();
    await task.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
