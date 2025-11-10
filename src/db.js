import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    // ✅ Ignore les certificats auto-signés de Railway
    rejectUnauthorized: false
  }
});

connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion MySQL :', err);
  } else {
    console.log('Connexion réussie à la base Railway ✅');
  }
});

export default connection;
