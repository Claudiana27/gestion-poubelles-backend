import express from 'express';
import cors from 'cors';
import connection from './src/db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Backend fonctionnel'));

app.listen(PORT, () => console.log(`Serveur Node.js démarré sur http://localhost:${PORT}`));
