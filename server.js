const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./meo_lazy.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  balance INTEGER DEFAULT 0
)`);
db.run(`CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_code TEXT UNIQUE,
  duration TEXT,
  price INTEGER,
  used INTEGER DEFAULT 0,
  owner_id INTEGER DEFAULT NULL
)`);

db.get("SELECT COUNT(*) AS cnt FROM keys", (err, row) => {
  if (row.cnt === 0) {
    const durations = ['1h','1d','7d','30d'];
    const prices = [10000, 50000, 150000, 450000];
    const stmt = db.prepare("INSERT INTO keys (key_code, duration, price) VALUES (?, ?, ?)");
    for (let i = 0; i < 50; i++) {
      const d = durations[i % 4];
      const p = prices[i % 4];
      const code = 'ML' + Date.now().toString(36) + Math.random().toString(36).substr(2,6) + i;
      stmt.run(code, d, p);
    }
    stmt.finalize();
  }
});

app.use(session({ secret: 'meolazyhack2026', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (user) { req.session.user = user; res.redirect('/'); } 
    else res.send('Sai tai khoan hoac mat khau');
  });
});
app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
    if (err) res.send('Ten da ton tai');
    else res.redirect('/login');
  });
});

app.get('/recharge', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('recharge', { user: req.session.user });
});
app.post('/recharge', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { amount } = req.body;
  const amt = parseInt(amount);
  if (isNaN(amt) || amt <= 0) return res.send('So tien khong hop le');
  db.run("UPDATE users SET balance = balance + ? WHERE id = ?", [amt, req.session.user.id], function(err) {
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
      req.session.user = user;
      res.redirect('/');
    });
  });
});

app.get('/account', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('account', { user: req.session.user });
});

app.get('/buy_key', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { duration } = req.query;
  const prices = { '1h':10000, '1d':50000, '7d':150000, '30d':450000 };
  const price = prices[duration];
  if (!price) return res.send('Loai key khong hop le');
  db.get("SELECT * FROM keys WHERE duration = ? AND used = 0 LIMIT 1", [duration], (err, key) => {
    if (!key) return res.send('Het key, lien he admin');
    if (req.session.user.balance < price) return res.send('Khong du tien, vui long nap them');
    db.run("UPDATE users SET balance = balance - ? WHERE id = ?", [price, req.session.user.id]);
    db.run("UPDATE keys SET used = 1, owner_id = ? WHERE id = ?", [req.session.user.id, key.id]);
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
      req.session.user = user;
      res.send(`Da mua key ${duration} thanh cong. Ma key: ${key.key_code}`);
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(port, () => console.log(`Meo Lazy Hack running on port ${port}`));
