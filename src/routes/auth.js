// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import connection from "../db.js"; // ton pool mysql2/promise
import jwt from "jsonwebtoken";

const router = express.Router();

// Route POST /api/login
router.post("/login", async (req, res) => {
  const { matricule, password } = req.body;

  if (!matricule || !password) {
    return res.status(400).json({ message: "Matricule et mot de passe requis" });
  }

  try {
    // Exécution de la requête
    const [rows] = await connection.execute(
      "SELECT * FROM admins WHERE matricule = ?",
      [matricule]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Matricule incorrect" });
    }

    const admin = rows[0];

    // Comparaison du mot de passe avec bcrypt
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: admin.id, matricule: admin.matricule, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Réponse JSON
    res.json({ message: "Connexion réussie", token, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
