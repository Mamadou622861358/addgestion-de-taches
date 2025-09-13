const jwt = require("jsonwebtoken");

// Middleware pour vérifier le token JWT
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: "Token invalide" });
  }
}

// Middleware pour vérifier le rôle admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Accès réservé à l’admin" });
}

module.exports = { auth, isAdmin };
