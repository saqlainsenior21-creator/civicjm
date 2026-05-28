const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'civicjm.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('citizen','gov_user','admin')),
    parish TEXT,
    agency TEXT,
    phone TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    citizen_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('broken_road','garbage','water_outage','streetlight','illegal_dumping','flooding','other')),
    description TEXT,
    parish TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted','acknowledged','in_progress','resolved','closed')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
    photo_data TEXT,
    upvotes INTEGER DEFAULT 0,
    assigned_agency TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS issue_updates (
    id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL REFERENCES issues(id),
    updated_by TEXT NOT NULL REFERENCES users(id),
    old_status TEXT,
    new_status TEXT,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS upvotes (
    issue_id TEXT NOT NULL REFERENCES issues(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    PRIMARY KEY (issue_id, user_id)
  );
`);

function seed() {
  const existing = db.prepare("SELECT id FROM users WHERE role='admin'").get();
  if (existing) return;

  const adminHash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin2026!', 10);
  db.prepare("INSERT INTO users (id,name,email,password,role,parish) VALUES (?,?,?,?,?,?)")
    .run(uuidv4(), 'CivicJM Admin', process.env.SEED_ADMIN_EMAIL || 'admin@civicjm.com', adminHash, 'admin', 'Kingston');

  // Seed gov users per agency
  const govUsers = [
    { name: 'NWA Officer', email: 'nwa@civicjm.com', agency: 'National Works Agency', parish: 'Kingston' },
    { name: 'KSAC Officer', email: 'ksac@civicjm.com', agency: 'Kingston & St. Andrew Municipal Corporation', parish: 'Kingston' },
    { name: 'St. Elizabeth Council', email: 'se.council@civicjm.com', agency: 'St. Elizabeth Parish Council', parish: 'St. Elizabeth' },
  ];
  govUsers.forEach(u => {
    const hash = bcrypt.hashSync('GovUser2026!', 10);
    db.prepare("INSERT INTO users (id,name,email,password,role,parish,agency) VALUES (?,?,?,?,?,?,?)")
      .run(uuidv4(), u.name, u.email, hash, 'gov_user', u.parish, u.agency);
  });

  // Seed sample issues
  const adminId = db.prepare("SELECT id FROM users WHERE role='admin'").get().id;
  const sampleIssues = [
    { title: 'Pothole on Constant Spring Road', category: 'broken_road', parish: 'Kingston', address: 'Constant Spring Rd, Kingston 10', lat: 18.0179, lng: -76.7842, status: 'in_progress', priority: 'high', description: 'Large pothole causing traffic hazard near the intersection.' },
    { title: 'Garbage pileup at Papine Market', category: 'garbage', parish: 'St. Andrew', address: 'Papine Market, St. Andrew', lat: 18.0176, lng: -76.7455, status: 'acknowledged', priority: 'high', description: 'Uncollected garbage has been accumulating for over a week.' },
    { title: 'Streetlight out on Maxfield Ave', category: 'streetlight', parish: 'Kingston', address: 'Maxfield Ave, Kingston', lat: 17.9927, lng: -76.7966, status: 'submitted', priority: 'medium', description: 'Three consecutive streetlights are out creating a safety hazard at night.' },
    { title: 'Water outage — Washington Gardens', category: 'water_outage', parish: 'St. Andrew', address: 'Washington Gardens, St. Andrew', lat: 18.0052, lng: -76.7671, status: 'resolved', priority: 'critical', description: 'No water supply for 3 days. Affecting entire community.' },
    { title: 'Illegal dumping at Duhaney Park', category: 'illegal_dumping', parish: 'St. Andrew', address: 'Duhaney Park, St. Andrew', lat: 17.9984, lng: -76.7548, status: 'submitted', priority: 'medium', description: 'Old mattresses and construction waste dumped on vacant lot.' },
    { title: 'Flash flooding on Spanish Town Road', category: 'flooding', parish: 'Kingston', address: 'Spanish Town Rd, Kingston', lat: 17.9863, lng: -76.8152, status: 'acknowledged', priority: 'critical', description: 'Road becomes impassable after every rainfall. Drains are blocked.' },
  ];
  sampleIssues.forEach(i => {
    db.prepare(`INSERT INTO issues (id,citizen_id,title,category,description,parish,address,lat,lng,status,priority)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(uuidv4(), adminId, i.title, i.category, i.description, i.parish, i.address, i.lat, i.lng, i.status, i.priority);
  });

  console.log('✅ CivicJM seeded');
}

seed();
module.exports = db;
