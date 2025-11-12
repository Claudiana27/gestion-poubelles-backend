import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import connection from "./src/db.js";
import poubellesRoutes from "./src/routes/poubelles.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/poubelles", poubellesRoutes);

app.use(
  session({
    secret: "gestionpoubelles",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// =============================
// 1️⃣ Configuration Google OAuth
// =============================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      // Vérifie si l'utilisateur existe déjà
      connection.query(
        "SELECT * FROM users WHERE google_id = ?",
        [id],
        (err, results) => {
          if (err) return done(err);
          if (results.length > 0) {
            return done(null, results[0]);
          } else {
            // Sinon, l’insérer
            const user = { google_id: id, display_name: displayName, email };
            connection.query("INSERT INTO users SET ?", user, (err, res) => {
              if (err) return done(err);
              user.id = res.insertId;
              return done(null, user);
            });
          }
        }
      );
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// =============================
// 2️⃣ Routes d’authentification
// =============================
app.get("/", (req, res) => res.send("Backend gestion poubelles ✅"));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const redirectUrl = `${process.env.FRONTEND_URL}?user=${encodeURIComponent(
      JSON.stringify(req.user)
    )}`;
    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend sur le port ${PORT}`));
