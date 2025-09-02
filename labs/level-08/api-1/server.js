const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'vault-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE secrets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  db.run(`INSERT INTO users (username, email, password) VALUES 
    ('admin', 'admin@vault.com', ?),
    ('user', 'user@vault.com', ?)`, [adminHash, userHash]);

  db.run(`INSERT INTO secrets (user_id, title, value) VALUES 
    (1, 'Admin Key', 'flag{api_idor_vulnerability_exposed}'),
    (1, 'Database Password', 'db_p@ssw0rd_2024'),
    (2, 'User Key', 'my_personal_key_123')`);
});

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
    [username, email, hashedPassword], function(err) {
    if (err) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    req.session.userId = this.lastID;
    req.session.username = username;
    res.json({ success: true, userId: this.lastID, username });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ success: true, userId: user.id, username: user.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/secrets', requireAuth, (req, res) => {
  db.all('SELECT id, title, created_at FROM secrets WHERE user_id = ?', 
    [req.session.userId], (err, secrets) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ secrets });
  });
});

app.get('/api/secrets/:id', requireAuth, (req, res) => {
  const secretId = parseInt(req.params.id);
  
  db.get('SELECT id, title, value, created_at FROM secrets WHERE id = ?', 
    [secretId], (err, secret) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    
    res.json(secret);
  });
});

app.post('/api/secrets', requireAuth, (req, res) => {
  const { title, value } = req.body;
  
  if (!title || !value) {
    return res.status(400).json({ error: 'Title and value are required' });
  }

  db.run('INSERT INTO secrets (user_id, title, value) VALUES (?, ?, ?)', 
    [req.session.userId, title, value], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      success: true, 
      secretId: this.lastID,
      title,
      value
    });
  });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json({ 
    userId: req.session.userId, 
    username: req.session.username 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vault platform running on port ${PORT}`);
});