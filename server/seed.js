import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const upsertUser = (email, password, role) => {
  db.prepare(
    "INSERT OR IGNORE INTO users(email,password_hash,role) VALUES(?,?,?)",
  ).run(email, bcrypt.hashSync(password, 10), role);
  return db.prepare("SELECT id FROM users WHERE email=?").get(email).id;
};
const adminEmail = process.env.ADMIN_EMAIL || "admin@djkompass.local";
const adminPassword =
  process.env.ADMIN_PASSWORD || "change-this-before-deployment";
upsertUser(adminEmail, adminPassword, "admin");
const demoPassword = process.env.DJ_DEMO_PASSWORD || "demo12345";
const samples = [
  [
    "Maya Sol",
    "maya@djkompass.local",
    "Berlin",
    ["House", "Disco", "Pop", "Charts"],
    ["Hochzeit", "Firmenfeier", "Geburtstag"],
    120,
    950,
    "Warme Grooves, volle Tanzflächen und ein Gespür für den richtigen Moment.",
    "DJ-Controller, Funkmikrofon, Lichtsetup",
    "Über 120 Hochzeiten und Firmenfeiern",
  ],
  [
    "Noah Beat",
    "noah@djkompass.local",
    "Hamburg",
    ["Hip-Hop", "R&B", "Pop", "80er & 90er"],
    ["Geburtstag", "Firmenfeier", "Vereinsfest"],
    90,
    700,
    "Von Old School bis heute – ein offener Mix, der Generationen verbindet.",
    "PA-Anlage, Mikrofon, Ambientelicht",
    "Stadtfest Hamburg, private Events",
  ],
  [
    "Lina Waves",
    "lina@djkompass.local",
    "München",
    ["House", "Lounge", "Latin", "Disco"],
    ["Hochzeit", "Firmenfeier", "Anderes Event"],
    100,
    850,
    "Eleganter Empfang, energiegeladene Party und alles dazwischen.",
    "Controller, kompakte PA, Uplights",
    "Hotel- und Eventveranstaltungen",
  ],
];
for (const [
  stage,
  email,
  city,
  genres,
  events,
  radius,
  price,
  bio,
  equipment,
  refs,
] of samples) {
  const id = upsertUser(email, demoPassword, "dj");
  db.prepare(
    `INSERT OR IGNORE INTO profiles(user_id,stage_name,city,genres,events,radius,price_from,bio,equipment,references_text,status) VALUES(?,?,?,?,?,?,?,?,?,?,'approved')`,
  ).run(
    id,
    stage,
    city,
    JSON.stringify(genres),
    JSON.stringify(events),
    radius,
    price,
    bio,
    equipment,
    refs,
  );
}
console.log(
  "Demo-Daten bereit. Admin:",
  adminEmail,
  "DJs:",
  samples.map((s) => s[1]).join(", "),
);
