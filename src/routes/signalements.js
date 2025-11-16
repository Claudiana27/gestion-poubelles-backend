import express from "express";
import connection from "../db.js";

const router = express.Router();

/* ============================================================
   🔹 RÉCUPÉRER TOUS LES SIGNALEMENTS (ADMIN)
   ============================================================ */
router.get("/", (req, res) => {
  const sql = `
    SELECT s.id, s.poubelle_id, s.capacite, s.date_signalement,
           p.nom, p.latitude, p.longitude, p.bloquee
    FROM signalements s
    JOIN poubelles p ON s.poubelle_id = p.id
    ORDER BY s.date_signalement DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération signalements:", err);
      return res.status(500).json({ error: "Erreur récupération signalements" });
    }
    res.json(results);
  });
});

/* ============================================================
   🔹 AJOUTER UN SIGNALEMENT (CITOYEN)
   - Refus si la poubelle est déjà bloquée
   - Si OK -> met bloquée = 1 + change l'état
   ============================================================ */
router.post("/", (req, res) => {
  const { poubelle_id, capacite } = req.body;

  if (!poubelle_id || !capacite) {
    return res.status(400).json({ error: "poubelle_id et capacite requis" });
  }

  // Vérifier si la poubelle est bloquée déjà
  connection.query(
    "SELECT bloquee FROM poubelles WHERE id = ?",
    [poubelle_id],
    (err, results) => {
      if (err) {
        console.error("Erreur MySQL:", err);
        return res.status(500).json({ error: "Erreur vérification poubelle" });
      }

      const poubelle = results[0];
      if (!poubelle) {
        return res.status(404).json({ error: "Poubelle introuvable" });
      }

      if (poubelle.bloquee === 1) {
        return res.json({
          status: "refuse",
          message: "Cette poubelle est déjà signalée et en attente d’intervention.",
        });
      }

      // OK -> enregistrer le signalement
      const sqlInsert = `
          INSERT INTO signalements (poubelle_id, capacite)
          VALUES (?, ?)
      `;

      connection.query(sqlInsert, [poubelle_id, capacite], (err, results2) => {
        if (err) {
          console.error("Erreur ajout signalement:", err);
          return res.status(500).json({ error: "Erreur ajout signalement" });
        }

        // Mise à jour de la poubelle
        const sqlUpdate = `
            UPDATE poubelles
            SET etat = ?, bloquee = 1
            WHERE id = ?
        `;

        connection.query(sqlUpdate, [capacite, poubelle_id]);

        res.json({
          status: "ok",
          message: "Signalement enregistré.",
          id: results2.insertId,
        });
      });
    }
  );
});

export default router;
