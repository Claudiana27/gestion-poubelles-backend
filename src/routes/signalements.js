import express from "express";
import connection from "../db.js";

const router = express.Router();

// Récupérer tous les signalements (pour admin)
router.get("/", (req, res) => {
  const sql = `
    SELECT s.id, s.poubelle_id, s.capacite, s.date_signalement, p.nom, p.latitude, p.longitude
    FROM signalements s
    JOIN poubelles p ON s.poubelle_id = p.id
    ORDER BY s.date_signalement DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur récupération signalements" });
    res.json(results);
  });
});

// Ajouter un signalement
router.post("/", (req, res) => {
  const { poubelle_id, capacite } = req.body;
  if (!poubelle_id || !capacite) {
    return res.status(400).json({ error: "poubelle_id et capacite requis" });
  }

  const sql = "INSERT INTO signalements (poubelle_id, capacite) VALUES (?, ?)";
  connection.query(sql, [poubelle_id, capacite], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur ajout signalement" });
    res.json({ message: "Signalement ajouté", id: results.insertId });
  });
});

export default router;
