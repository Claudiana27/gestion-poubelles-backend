import express from "express";
import connection from "../db.js";

const router = express.Router();

// 🔹 Récupérer toutes les poubelles (admin + mobile) avec dernier signalement
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*,
      (
        SELECT s.capacite
        FROM signalements s
        WHERE s.poubelle_id = p.id
        ORDER BY s.date_signalement DESC
        LIMIT 1
      ) AS capacite_signalement
    FROM poubelles p
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur récupération" });
    res.json(results);
  });
});

// 🔹 Ajouter une nouvelle poubelle
router.post("/", (req, res) => {
  const { nom, latitude, longitude, capacite, etat } = req.body;

  if (!nom || !latitude || !longitude || !capacite || !etat) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
    INSERT INTO poubelles (nom, latitude, longitude, capacite, etat, bloquee)
    VALUES (?, ?, ?, ?, ?, 0)
  `;

  connection.query(sql, [nom, latitude, longitude, capacite, etat], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur insertion" });
    res.json({ message: "Poubelle ajoutée", id: result.insertId });
  });
});

// 🔹 Changer l'état d'une poubelle (couleur icône)
router.put("/etat/:id", (req, res) => {
  const { id } = req.params;
  const { etat } = req.body;

  connection.query("UPDATE poubelles SET etat = ? WHERE id = ?", [etat, id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur MAJ état" });
    res.json({ message: "État mis à jour" });
  });
});

// 🔹 Bloquer une poubelle (après signalement)
router.put("/bloquer/:id", (req, res) => {
  const { id } = req.params;

  connection.query("UPDATE poubelles SET bloquee = 1 WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur blocage" });
    res.json({ message: "Poubelle bloquée" });
  });
});

// 🔹 Débloquer une poubelle (après intervention)
router.put("/debloquer/:id", (req, res) => {
  const { id } = req.params;

  connection.query("UPDATE poubelles SET bloquee = 0 WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur déblocage" });
    res.json({ message: "Poubelle débloquée" });
  });
});

export default router;
