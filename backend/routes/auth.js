const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'civicjm-dev-secret';

router.post('/register', (req, res) => {
  const { name, email, password, role, parish, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  if (role && !['citizen','gov_user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  const userRole = role || 'citizen';
  db.prepare('INSERT INTO users (id,name,email,password,role,parish,phone) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, email.toLowerCase(), hash, userRole, parish || null, phone || null);
  const token = jwt.sign({ id, name, email: email.toLowerCase(), role: userRole, parish }, SECRET, { expiresIn: '8h' });
  res.status(201).json({ token, user: { id, name, email, role: userRole, parish } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, parish: user.parish, agency: user.agency }, SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, parish: user.parish, agency: user.agency, phone: user.phone } });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,parish,agency,phone,created_at FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});

module.exports = router;
