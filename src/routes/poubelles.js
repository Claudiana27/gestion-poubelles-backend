import express from "express";
import connection from "../db.js";

const router = express.Router();

// 🔹 Récupérer toutes les poubelles avec dernier signalement
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, s.capacite AS capacite_signalement, s.id AS signalement_id
    FROM poubelles p
    LEFT JOIN (
      SELECT s1.*
      FROM signalements s1
      JOIN (
        SELECT poubelle_id, MAX(date_signalement) AS max_date
        FROM signalements
        GROUP BY poubelle_id
      ) s2 ON s1.poubelle_id = s2.poubelle_id AND s1.date_signalement = s2.max_date
    ) s ON p.id = s.poubelle_id
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur récupération poubelles" });
    res.json(results);
  });
});

// 🔹 Ajouter une nouvelle poubelle
router.post("/", (req, res) => {
  const { nom, latitude, longitude, capacite, etat_initial } = req.body;

  if (!nom || !latitude || !longitude || !capacite || !etat_initial) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
    INSERT INTO poubelles (nom, latitude, longitude, capacite, etat, etat_initial, bloquee)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `;

  connection.query(
    sql,
    [nom, latitude, longitude, capacite, etat_initial, etat_initial],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur insertion" });
      res.json({ message: "Poubelle ajoutée", id: result.insertId });
    }
  );
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
  const { etat_signalement } = req.body; // nouvelle valeur pour le signalement

  connection.query(
    "UPDATE poubelles SET bloquee = 1, etat = ? WHERE id = ?",
    [etat_signalement, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur blocage" });
      res.json({ message: "Poubelle bloquée et état mis à jour !" });
    }
  );
});

// 🔹 Débloquer une poubelle (après intervention)
router.put("/debloquer/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "UPDATE poubelles SET bloquee = 0, etat = etat_initial WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur déblocage" });
      res.json({ message: "Poubelle débloquée et réinitialisée à l'état initial !" });
    }
  );
});

export default router;
