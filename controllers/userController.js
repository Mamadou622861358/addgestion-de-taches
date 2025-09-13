exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, password, photo } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    // Gestion de la photo : upload ou URL
    if (req.file) {
      // Si un fichier a été uploadé, construire l’URL
      const url = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      update.photo = url;
    } else if (typeof photo === "string") {
      update.photo = photo;
    }
    if (password && password.trim()) {
      update.password = await bcrypt.hash(password, 10);
    }
    // Vérifier l’unicité de l’email si modifié
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }
    }
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      select: "_id name email role photo",
    });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
};
// Récupérer tous les utilisateurs (admin seulement)
exports.getAll = async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role");
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Inscription
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({
      message: "Utilisateur créé",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET manquant dans .env");
      return res
        .status(500)
        .json({ message: "JWT_SECRET manquant sur le serveur" });
    }
    try {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo || "",
        },
      });
    } catch (err) {
      console.error("Erreur lors de la génération du token:", err);
      return res.status(500).json({
        message: "Erreur lors de la génération du token",
        error: err.message,
      });
    }
  } catch (e) {
    console.error("Erreur login:", e);
    res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
};
