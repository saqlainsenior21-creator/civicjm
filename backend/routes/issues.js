const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { notifyStatusChange, notifyGovNewIssue } = require('../sms');
const { autoRoute } = require('../routing');

// GET /api/issues — public list, filterable
router.get('/', (req, res) => {
  const { parish, category, status, priority, limit = 100, offset = 0 } = req.query;
  let q = `SELECT i.*, u.name as reporter_name FROM issues i JOIN users u ON i.citizen_id=u.id WHERE 1=1`;
  const params = [];
  if (parish)    { q += ' AND i.parish=?';    params.push(parish); }
  if (category)  { q += ' AND i.category=?';  params.push(category); }
  if (status)    { q += ' AND i.status=?';    params.push(status); }
  if (priority)  { q += ' AND i.priority=?';  params.push(priority); }
  q += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  res.json(db.prepare(q).all(...params));
});

// GET /api/issues/stats — public stats
router.get('/stats', (req, res) => {
  const total     = db.prepare("SELECT COUNT(*) as c FROM issues").get().c;
  const resolved  = db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='resolved'").get().c;
  const inProgress= db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='in_progress'").get().c;
  const critical  = db.prepare("SELECT COUNT(*) as c FROM issues WHERE priority='critical' AND status NOT IN ('resolved','closed')").get().c;
  const byCategory= db.prepare("SELECT category, COUNT(*) as count FROM issues GROUP BY category ORDER BY count DESC").all();
  const byParish  = db.prepare("SELECT parish, COUNT(*) as count FROM issues GROUP BY parish ORDER BY count DESC").all();
  const recent    = db.prepare("SELECT id,title,category,parish,status,priority,created_at FROM issues ORDER BY created_at DESC LIMIT 5").all();
  res.json({ total, resolved, inProgress, critical, byCategory, byParish, recent });
});

// GET /api/issues/my — citizen's own issues
router.get('/my', auth, (req, res) => {
  res.json(db.prepare(`SELECT i.*, (SELECT COUNT(*) FROM issue_updates WHERE issue_id=i.id) as update_count
    FROM issues i WHERE i.citizen_id=? ORDER BY i.created_at DESC`).all(req.user.id));
});

// GET /api/issues/:id — full detail + updates
router.get('/:id', (req, res) => {
  const issue = db.prepare(`SELECT i.*, u.name as reporter_name, u.phone as reporter_phone
    FROM issues i JOIN users u ON i.citizen_id=u.id WHERE i.id=?`).get(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  const updates = db.prepare(`SELECT iu.*, u.name as updated_by_name, u.role as updated_by_role
    FROM issue_updates iu JOIN users u ON iu.updated_by=u.id WHERE iu.issue_id=? ORDER BY iu.created_at ASC`).all(req.params.id);
  res.json({ ...issue, updates });
});

// POST /api/issues — submit new issue (auth optional — citizens encouraged to register)
router.post('/', auth, (req, res) => {
  const { title, category, description, parish, address, lat, lng, priority, photo_data } = req.body;
  if (!title || !category || !parish) return res.status(400).json({ error: 'title, category, parish required' });
  const validCats = ['broken_road','garbage','water_outage','streetlight','illegal_dumping','flooding','other'];
  if (!validCats.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  const id = uuidv4();
  const assigned_agency = autoRoute(category, parish);

  db.prepare(`INSERT INTO issues (id,citizen_id,title,category,description,parish,address,lat,lng,priority,photo_data,assigned_agency)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, title, category, description||null, parish, address||null, lat||null, lng||null, priority||'medium', photo_data||null, assigned_agency||null);

  // Notify gov users of the assigned agency for high/critical issues (non-blocking)
  const newIssue = { id, title, category, parish, address, priority, assigned_agency };
  const govPhones = assigned_agency
    ? db.prepare("SELECT phone FROM users WHERE role='gov_user' AND agency=? AND phone IS NOT NULL AND active=1").all(assigned_agency).map(u => u.phone)
    : db.prepare("SELECT phone FROM users WHERE role='gov_user' AND parish=? AND phone IS NOT NULL AND active=1").all(parish).map(u => u.phone);
  notifyGovNewIssue(newIssue, govPhones).catch(() => {});

  res.status(201).json({ id, assigned_agency });
});

// PATCH /api/issues/:id/status — gov/admin update status
router.patch('/:id/status', auth, requireRole('gov_user','admin'), (req, res) => {
  const { status, note, assigned_agency } = req.body;
  const validStatuses = ['submitted','acknowledged','in_progress','resolved','closed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const issue = db.prepare('SELECT * FROM issues WHERE id=?').get(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  db.prepare("UPDATE issues SET status=?,assigned_agency=?,updated_at=datetime('now') WHERE id=?")
    .run(status, assigned_agency||issue.assigned_agency, req.params.id);
  db.prepare('INSERT INTO issue_updates (id,issue_id,updated_by,old_status,new_status,note) VALUES (?,?,?,?,?,?)')
    .run(uuidv4(), req.params.id, req.user.id, issue.status, status, note||null);

  // SMS citizen about status change (non-blocking)
  const reporter = db.prepare('SELECT phone FROM users WHERE id=?').get(issue.citizen_id);
  const issueWithPhone = { ...issue, reporter_phone: reporter?.phone };
  notifyStatusChange(issueWithPhone, status, note).catch(() => {});

  res.json({ success: true });
});

// POST /api/issues/:id/upvote — citizen upvotes an issue
router.post('/:id/upvote', auth, (req, res) => {
  try {
    db.prepare('INSERT INTO upvotes (issue_id,user_id) VALUES (?,?)').run(req.params.id, req.user.id);
    db.prepare('UPDATE issues SET upvotes=upvotes+1 WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(409).json({ error: 'Already upvoted' }); }
});

module.exports = router;
