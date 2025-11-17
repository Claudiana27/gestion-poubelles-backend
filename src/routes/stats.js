import express from "express";
import connection from "../db.js";

const router = express.Router();

/* ============================================================
   🔹 1. Statistiques : Répartition des états (donut)
   ============================================================ */
router.get("/etat", (req, res) => {
  const sql = `
    SELECT etat, COUNT(*) AS value
    FROM poubelles
    GROUP BY etat
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur stats état" });
    res.json(results);
  });
});

/* ============================================================
   🔹 2. Statistiques : Évolution des signalements (graphique courbe)
   ============================================================ */
router.get("/signalements", (req, res) => {
  const sql = `
    SELECT 
      DATE(date_signalement) AS date,
      COUNT(*) AS count
    FROM signalements
    GROUP BY DATE(date_signalement)
    ORDER BY DATE(date_signalement)
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur stats signalements" });
    res.json(results);
  });
});

export default router;
