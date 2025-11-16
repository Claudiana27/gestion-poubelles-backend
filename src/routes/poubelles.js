import express from "express";
import connection from "../db.js";

const router = express.Router();

/* ============================================================
   🔹 RÉCUPÉRER TOUTES LES POUBELLES
   ============================================================ */
router.get("/", (req, res) => {
  connection.query("SELECT * FROM poubelles", (err, results) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: "Erreur de récupération des poubelles" });
    }
    res.json(results);
  });
});

/* ============================================================
   🔹 AJOUTER UNE NOUVELLE POUBELLE
   - État initial = moyenne
   - bloquée = 0
   ============================================================ */
router.post("/", (req, res) => {
  const { nom, latitude, longitude, capacite } = req.body;

  if (!nom || !latitude || !longitude || !capacite) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
      INSERT INTO poubelles (nom, latitude, longitude, capacite, etat, bloquee)
      VALUES (?, ?, ?, ?, 'moyenne', 0)
  `;

  connection.query(sql, [nom, latitude, longitude, capacite], (err, result) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: "Erreur d’insertion" });
    }

    res.json({ message: "Poubelle ajoutée", id: result.insertId });
  });
});

/* ============================================================
   🔹 ADMIN : DÉBLOQUER UNE POUBELLE APRÈS INTERVENTION
   ============================================================ */
router.put("/debloquer/:id", (req, res) => {
  const poubelleId = req.params.id;

  const sql = `
      UPDATE poubelles
      SET bloquee = 0,
          etat = 'moyenne'
      WHERE id = ?
  `;

  connection.query(sql, [poubelleId], (err, result) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: "Erreur lors du déblocage" });
    }

    res.json({ message: "Poubelle débloquée" });
  });
});

export default router;
