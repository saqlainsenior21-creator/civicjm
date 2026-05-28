const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// GET /api/admin/stats — analytics dashboard
router.get('/stats', (req, res) => {
  const total      = db.prepare("SELECT COUNT(*) as c FROM issues").get().c;
  const submitted  = db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='submitted'").get().c;
  const acknowledged=db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='acknowledged'").get().c;
  const inProgress = db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='in_progress'").get().c;
  const resolved   = db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='resolved'").get().c;
  const closed     = db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='closed'").get().c;
  const critical   = db.prepare("SELECT COUNT(*) as c FROM issues WHERE priority='critical'").get().c;
  const byCategory = db.prepare("SELECT category, COUNT(*) as count FROM issues GROUP BY category ORDER BY count DESC").all();
  const byParish   = db.prepare("SELECT parish, COUNT(*) as count FROM issues GROUP BY parish ORDER BY count DESC").all();
  const byStatus   = db.prepare("SELECT status, COUNT(*) as count FROM issues GROUP BY status").all();
  const citizens   = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='citizen'").get().c;
  const govUsers   = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='gov_user'").get().c;
  const recent7    = db.prepare("SELECT DATE(created_at) as day, COUNT(*) as count FROM issues WHERE created_at >= datetime('now','-7 days') GROUP BY day ORDER BY day").all();
  res.json({ total, submitted, acknowledged, inProgress, resolved, closed, critical, byCategory, byParish, byStatus, citizens, govUsers, recent7 });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json(db.prepare('SELECT id,name,email,role,parish,agency,phone,active,created_at FROM users ORDER BY created_at DESC').all());
});

// POST /api/admin/users — create gov_user
router.post('/users', (req, res) => {
  const { name, email, password, role, parish, agency, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
  if (!['gov_user','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id,name,email,password,role,parish,agency,phone) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, name, email.toLowerCase(), hash, role, parish||null, agency||null, phone||null);
  res.status(201).json({ id });
});

// PATCH /api/admin/users/:id/toggle — activate/deactivate
router.patch('/users/:id/toggle', (req, res) => {
  db.prepare('UPDATE users SET active=((active+1)%2) WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/admin/issues — all issues (admin view)
router.get('/issues', (req, res) => {
  const { parish, category, status, priority } = req.query;
  let q = `SELECT i.*, u.name as reporter_name FROM issues i JOIN users u ON i.citizen_id=u.id WHERE 1=1`;
  const params = [];
  if (parish)   { q += ' AND i.parish=?';   params.push(parish); }
  if (category) { q += ' AND i.category=?'; params.push(category); }
  if (status)   { q += ' AND i.status=?';   params.push(status); }
  if (priority) { q += ' AND i.priority=?'; params.push(priority); }
  q += ' ORDER BY CASE i.priority WHEN \'critical\' THEN 0 WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 ELSE 3 END, i.created_at DESC';
  res.json(db.prepare(q).all(...params));
});

module.exports = router;
