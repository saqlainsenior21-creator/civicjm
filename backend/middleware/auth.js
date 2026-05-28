const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'civicjm-dev-secret';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token invalid or expired' }); }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { auth, requireRole };
