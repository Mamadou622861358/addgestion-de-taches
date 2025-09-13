const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Sécurité CSP avec Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.gstatic.com",
          "https://translate.googleapis.com",
        ],
        styleSrc: [
          "'self'",
          "https://www.gstatic.com",
          "https://fonts.googleapis.com",
          "https://translate.googleapis.com",
        ],
        styleSrcElem: [
          "'self'",
          "https://www.gstatic.com",
          "https://fonts.googleapis.com",
          "https://translate.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://www.gstatic.com"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Servir les images de profil uploadées
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Route racine pour vérifier l'état de l'API
app.get("/", (req, res) => {
  res.send("API Gestion de Tâches opérationnelle !");
});

// Import des routes
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connexion MongoDB réussie !");
    app.listen(PORT, () =>
      console.log(
        `Serveur backend démarré sur le port http://localhost:${PORT}`
      )
    );
  })
  .catch((err) => console.error("Erreur de connexion MongoDB:", err));
