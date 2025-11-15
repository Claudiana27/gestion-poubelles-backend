import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { matricule, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM admins WHERE matricule = ?", [matricule]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Matricule incorrect" });
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: admin.id, matricule: admin.matricule, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Connexion réussie", token, admin });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
