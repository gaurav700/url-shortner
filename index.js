import express from 'express';
import sqlite3pkg from 'sqlite3';
import crypto from 'crypto';
import baseX from 'base-x';


const sqlite3 = sqlite3pkg.verbose();
const db = new sqlite3.Database(':memory:');
const app = express();



// Use Base62 (characters: 0-9, a-z, A-Z)
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);


//creating database for the user and shorturls
db.serialize(() => {
  db.run(`
    CREATE TABLE shorturls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_url TEXT NOT NULL,
      long_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT
    )
  `);
});

app.use(express.json());

// 🧠 Function to hash long_url → short_url
function generateShortUrl(longUrl) {
  const hash = crypto.createHash('sha256').update(longUrl).digest();
  return base62.encode(hash).substring(0, 7); // Use first 8 chars of base62 hash
}


app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});



app.post('/generate', async (req, res) => {
  const long_url = req.body.url;

  if (!long_url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  const short_url = await generateShortUrl(long_url);
  const now = new Date();
  const created_at = now.toISOString();
  const expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const query = `
    INSERT INTO shorturls (short_url, long_url, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `;
  const values = [short_url, long_url, created_at, expires_at];

  db.run(query, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({short_url, created_at, expires_at, long_url });
  });
});



app.get('/:shortUrl', (req, res) => {
  const short_url = req.params.shortUrl;
  const query = 'SELECT long_url FROM shorturls WHERE short_url = ?';

  db.get(query, [short_url], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(row.long_url);
  });
});


app.get('/health', (req, res) => {
  res.send('OK');
});


const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});