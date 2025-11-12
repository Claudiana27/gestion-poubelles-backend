// src/routes/poubelles.js
import express from "express";
import connection from "../db.js";

const router = express.Router();

// 🔹 Récupérer toutes les poubelles
router.get("/", (req, res) => {
  connection.query("SELECT * FROM poubelles", (err, results) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      res.status(500).json({ error: "Erreur de récupération des poubelles" });
    } else {
      res.json(results);
    }
  });
});

// 🔹 Ajouter une nouvelle poubelle
router.post("/", (req, res) => {
  const { nom, latitude, longitude, capacite, etat } = req.body;
  if (!nom || !latitude || !longitude || !capacite || !etat) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  connection.query(
    "INSERT INTO poubelles (nom, latitude, longitude, capacite, etat) VALUES (?, ?, ?, ?, ?)",
    [nom, latitude, longitude, capacite, etat],
    (err, result) => {
      if (err) {
        console.error("Erreur MySQL:", err);
        res.status(500).json({ error: "Erreur d’insertion" });
      } else {
        res.json({ message: "Poubelle ajoutée", id: result.insertId });
      }
    }
  );
});

export default router;
