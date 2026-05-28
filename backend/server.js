require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const pino = require('pino');
const path = require('path');
const { auth, requireRole } = require('./middleware/auth');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://civicjm.com', 'https://www.civicjm.com', /\.railway\.app$/]
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(pinoHttp({ logger, autoLogging: { ignore: r => r.url === '/api/health' } }));
app.use(express.json({ limit: '5mb' })); // 5mb for photo uploads

app.use('/api/auth/login', rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: 'Too many attempts' } }));
app.use('/api/', rateLimit({ windowMs: 60*1000, max: 300, message: { error: 'Too many requests' } }));

// Public routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));

// Admin routes (protected)
app.use('/api/admin',  auth, requireRole('admin'), require('./routes/admin'));

// Gov dashboard
app.get('/api/gov/dashboard', auth, requireRole('gov_user','admin'), (req, res) => {
  const db = require('./db');
  const parish = req.user.parish;
  const base = parish && req.user.role === 'gov_user' ? `WHERE i.parish='${parish}'` : '';
  const issues = db.prepare(`SELECT i.*, u.name as reporter_name FROM issues i JOIN users u ON i.citizen_id=u.id ${base} ORDER BY CASE i.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, i.created_at DESC LIMIT 200`).all();
  const stats = {
    total: issues.length,
    submitted:   issues.filter(i => i.status==='submitted').length,
    acknowledged:issues.filter(i => i.status==='acknowledged').length,
    inProgress:  issues.filter(i => i.status==='in_progress').length,
    resolved:    issues.filter(i => i.status==='resolved').length,
    critical:    issues.filter(i => i.priority==='critical' && !['resolved','closed'].includes(i.status)).length,
  };
  res.json({ stats, issues, parish, agency: req.user.agency });
});

// Health
app.get('/api/health', (req, res) => {
  const db = require('./db');
  const total   = db.prepare("SELECT COUNT(*) as c FROM issues").get().c;
  const resolved= db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='resolved'").get().c;
  const citizens= db.prepare("SELECT COUNT(*) as c FROM users WHERE role='citizen'").get().c;
  res.json({ status: 'ok', total_issues: total, resolved, citizens, version: '1.0.0', ts: new Date().toISOString() });
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(dist, { maxAge: '1d' }));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => logger.info(`🏛️ CivicJM running on port ${PORT}`));
