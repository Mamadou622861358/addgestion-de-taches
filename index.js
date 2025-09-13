const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Servir les images de profil uploadées
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
