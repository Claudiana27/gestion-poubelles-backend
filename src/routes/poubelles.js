import express from "express";
import connection from "../db.js";

const router = express.Router();

// 🔹 Récupérer toutes les poubelles + dernier signalement
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

// 🔹 Ajouter une poubelle
router.post("/", (req, res) => {
  const { nom, latitude, longitude, capacite } = req.body;

  if (!nom || !latitude || !longitude || !capacite) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
    INSERT INTO poubelles (nom, latitude, longitude, capacite, etat, bloquee)
    VALUES (?, ?, ?, ?, 'vide', 0)
  `;

  connection.query(sql, [nom, latitude, longitude, capacite], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur insertion" });
    res.json({ message: "Poubelle ajoutée", id: result.insertId });
  });
});

// 🔹 Mettre à jour l'état manuellement
router.put("/etat/:id", (req, res) => {
  const { id } = req.params;
  const { etat } = req.body;

  connection.query("UPDATE poubelles SET etat = ? WHERE id = ?", [etat, id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur MAJ état" });
    res.json({ message: "État mis à jour" });
  });
});

// 🔹 Bloquer une poubelle
router.put("/bloquer/:id", (req, res) => {
  const { id } = req.params;
  const { capacite } = req.body;

  connection.query(
    "UPDATE poubelles SET bloquee = 1, etat = ? WHERE id = ?",
    [capacite, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur blocage" });
      res.json({ message: "Poubelle bloquée !" });
    }
  );
});

// 🔹 Débloquer une poubelle
router.put("/debloquer/:id", (req, res) => {
  const { id } = req.params;

  // 1️⃣ Débloquer et remettre état = vide (triangle bleu)
  connection.query(
    "UPDATE poubelles SET bloquee = 0, etat = 'vide' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur déblocage" });

      // 2️⃣ Supprimer tous les signalements
      connection.query("DELETE FROM signalements WHERE poubelle_id = ?", [id], (err2) => {
        if (err2) console.error(err2);
        res.json({ message: "Poubelle débloquée et remise à vide !" });
      });
    }
  );
});

// 🔹 Modifier une poubelle
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom, latitude, longitude, capacite } = req.body;

  if (!nom || !latitude || !longitude || !capacite) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
    UPDATE poubelles 
    SET nom = ?, latitude = ?, longitude = ?, capacite = ?
    WHERE id = ?
  `;

  connection.query(sql, [nom, latitude, longitude, capacite, id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur modification" });
    res.json({ message: "Poubelle modifiée" });
  });
});

// 🔹 Supprimer une poubelle
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Supprimer d'abord ses signalements
  connection.query("DELETE FROM signalements WHERE poubelle_id = ?", [id], (err1) => {
    if (err1) return res.status(500).json({ error: "Erreur suppression signalements" });

    // Puis la poubelle
    connection.query("DELETE FROM poubelles WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Erreur suppression poubelle" });
      res.json({ message: "Poubelle supprimée" });
    });
  });
});


export default router;
