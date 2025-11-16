import express from "express";
import bcrypt from "bcrypt";
import connection from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /api/login
router.post("/login", (req, res) => {
  const { matricule, password } = req.body;

  if (!matricule || !password) {
    return res.status(400).json({ message: "Matricule et mot de passe requis" });
  }

  // Vérifier si l’admin existe
  connection.query(
    "SELECT * FROM admins WHERE matricule = ?",
    [matricule],
    async (err, results) => {
      if (err) {
        console.error("Erreur MySQL:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Matricule incorrect" });
      }

      const admin = results[0];

      // Vérifier le mot de passe
      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }

      // Générer le token
      const token = jwt.sign(
        {
          id: admin.id,
          matricule: admin.matricule,
          role: admin.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Connexion réussie",
        token,
        admin: {
          id: admin.id,
          matricule: admin.matricule,
          nom: admin.nom,
          role: admin.role,
        },
      });
    }
  );
});

export default router;
