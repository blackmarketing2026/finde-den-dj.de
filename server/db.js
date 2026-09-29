import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

fs.mkdirSync("data", { recursive: true });
export const db = new Database(path.resolve("data/djkompass.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('dj','admin')), created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id), stage_name TEXT NOT NULL, image_url TEXT DEFAULT '', bio TEXT DEFAULT '', genres TEXT DEFAULT '[]', events TEXT DEFAULT '[]', city TEXT DEFAULT '', radius INTEGER DEFAULT 50, equipment TEXT DEFAULT '', references_text TEXT DEFAULT '', price_from INTEGER DEFAULT 0, availability TEXT DEFAULT '[]', status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY, access_hash TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, event_type TEXT NOT NULL, genres TEXT NOT NULL, city TEXT NOT NULL, event_date TEXT NOT NULL, guests INTEGER, start_time TEXT, end_time TEXT, budget INTEGER, wishes TEXT DEFAULT '', consent_at TEXT NOT NULL, status TEXT DEFAULT 'open' CHECK(status IN ('open','spam','closed')), created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS matches (inquiry_id INTEGER REFERENCES inquiries(id), dj_id INTEGER REFERENCES users(id), score INTEGER NOT NULL, reasons TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(inquiry_id,dj_id));
CREATE TABLE IF NOT EXISTS offers (id INTEGER PRIMARY KEY, inquiry_id INTEGER NOT NULL REFERENCES inquiries(id), dj_id INTEGER NOT NULL REFERENCES users(id), price INTEGER NOT NULL, scope TEXT NOT NULL, message TEXT NOT NULL, status TEXT DEFAULT 'sent' CHECK(status IN ('sent','declined')), created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(inquiry_id,dj_id));
CREATE TABLE IF NOT EXISTS notification_events (id INTEGER PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT DEFAULT 'local', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_inquiries_date ON inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_matches_dj ON matches(dj_id);
`);
export const parseJson = (value) => {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
};
export const publicProfile = (p) => ({
  ...p,
  genres: parseJson(p.genres),
  events: parseJson(p.events),
  availability: parseJson(p.availability),
  user_id: undefined,
});
