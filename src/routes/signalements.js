import express from "express";
import connection from "../db.js";

const router = express.Router();

// 🔹 Récupérer tous les signalements
router.get("/", (req, res) => {
  const sql = `
    SELECT s.*, p.nom, p.latitude, p.longitude, p.bloquee
    FROM signalements s
    JOIN poubelles p ON s.poubelle_id = p.id
    ORDER BY s.date_signalement DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur récupération signalements" });
    res.json(results);
  });
});

// 🔹 Ajouter un signalement
router.post("/", (req, res) => {
  const { poubelle_id, capacite } = req.body;

  if (!poubelle_id || !capacite) {
    return res.status(400).json({ error: "poubelle_id et capacite requis" });
  }

  // Vérifier si la poubelle est déjà bloquée
  connection.query(
    "SELECT bloquee FROM poubelles WHERE id = ?",
    [poubelle_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!rows.length) return res.status(404).json({ error: "Poubelle introuvable" });

      if (rows[0].bloquee === 1) {
        return res.status(403).json({
          error: "Cette poubelle a déjà été signalée. Merci, en attente d'intervention."
        });
      }

      // Ajouter signalement
      connection.query(
        "INSERT INTO signalements (poubelle_id, capacite) VALUES (?, ?)",
        [poubelle_id, capacite],
        (err, results) => {
          if (err) return res.status(500).json({ error: "Signalement envoyé ! Merci !" });

          // Bloquer + mettre état = capacite
          connection.query(
            "UPDATE poubelles SET bloquee = 1, etat = ? WHERE id = ?",
            [capacite, poubelle_id],
            (err) => {
              if (err) return res.status(500).json({ error: "Signalement envoyé ! Merci !" });

              res.json({
                message: "Signalement ajouté",
                id: results.insertId
              });
            }
          );
        }
      );
    }
  );
});

export default router;
