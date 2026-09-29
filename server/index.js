import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { db, parseJson, publicProfile } from "./db.js";
import { notify } from "./notifications.js";
import { distanceKm } from "./locations.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const SECRET = process.env.SESSION_SECRET || "local-development-only-change-me";
if (
  process.env.NODE_ENV === "production" &&
  SECRET === "local-development-only-change-me"
)
  throw new Error("SESSION_SECRET setzen");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));
const inquiryLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
});
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Zu viele Anmeldeversuche. Bitte versuche es später erneut.",
  },
});
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const sign = (value) =>
  `${value}.${crypto.createHmac("sha256", SECRET).update(value).digest("hex")}`;
function auth(req) {
  const raw = req.cookies.dj_session;
  if (!raw) return null;
  const [v, mac] = raw.split(".");
  if (!v || !mac || sign(v).split(".")[1] !== mac) return null;
  try {
    const data = JSON.parse(Buffer.from(v, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return db
      .prepare("SELECT id,email,role FROM users WHERE id=?")
      .get(data.id);
  } catch {
    return null;
  }
}
function requireRole(role) {
  return (req, res, next) => {
    req.user = auth(req);
    if (!req.user || (role && req.user.role !== role))
      return res.status(401).json({ error: "Bitte anmelden." });
    next();
  };
}
const fail = (res, e) =>
  res.status(400).json({
    error: e.issues?.[0]?.message || e.message || "Ungültige Eingabe.",
  });
const email = z.email("Bitte eine gültige E-Mail-Adresse eingeben.");
const txt = (min, max, label) =>
  z
    .string()
    .trim()
    .min(min, `${label} fehlt.`)
    .max(max, `${label} ist zu lang.`);
const list = z
  .array(z.string().trim().min(1))
  .min(1, "Bitte mindestens eine Option auswählen.")
  .max(12);
const profileSchema = z.object({
  stage_name: txt(2, 80, "Künstlername"),
  bio: txt(20, 1500, "Beschreibung"),
  genres: list,
  events: list,
  city: txt(2, 100, "Einsatzort"),
  radius: z.coerce.number().int().min(0).max(500),
  equipment: z.string().max(1000).default(""),
  references_text: z.string().max(1000).default(""),
  price_from: z.coerce.number().int().min(0).max(100000),
  availability: z.array(z.iso.date()).max(365).default([]),
  image_url: z.string().max(500).default(""),
});
const inquirySchema = z.object({
  name: txt(2, 100, "Name"),
  email,
  event_type: txt(2, 60, "Eventart"),
  genres: list,
  city: txt(2, 100, "Ort"),
  event_date: z.iso.date(),
  guests: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(100000).optional(),
  ),
  start_time: z.string().max(5).optional(),
  end_time: z.string().max(5).optional(),
  budget: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).max(1000000).optional(),
  ),
  wishes: z.string().max(2000).default(""),
  consent: z.literal(true),
  website: z.string().max(0).default(""),
});
function matchProfile(inq, p) {
  const reasons = [];
  const pg = parseJson(p.genres),
    pe = parseJson(p.events),
    pa = parseJson(p.availability);
  const overlap = parseJson(inq.genres).filter((g) => pg.includes(g));
  if (!overlap.length || !pe.includes(inq.event_type)) return null;
  reasons.push(
    `${overlap.length} passende Musikrichtung${overlap.length > 1 ? "en" : ""}`,
    "Erfahrung mit " + inq.event_type,
  );
  const distance = distanceKm(p.city, inq.city);
  if (distance === null || distance > Number(p.radius)) return null;
  reasons.push(
    distance === 0
      ? "Direkt in " + p.city
      : `Etwa ${distance} km von ${p.city} · innerhalb von ${p.radius} km`,
  );
  if (pa.includes(inq.event_date)) return null;
  reasons.push("Termin nicht als belegt markiert");
  return {
    score:
      overlap.length * 20 +
      (distance === 0 ? 20 : Math.max(0, 20 - Math.round(distance / 10))) +
      20,
    reasons,
  };
}
function matchInquiry(inq, p) {
  const match = matchProfile(inq, p);
  if (!match) return;
  db.prepare(
    "INSERT OR IGNORE INTO matches(inquiry_id,dj_id,score,reasons) VALUES(?,?,?,?)",
  ).run(inq.id, p.user_id, match.score, JSON.stringify(match.reasons));
  return match;
}
function inquiryForToken(token) {
  if (!token || token.length < 20) return null;
  return db
    .prepare("SELECT * FROM inquiries WHERE access_hash=?")
    .get(hash(token));
}
function getMatches(id) {
  return db
    .prepare(
      `SELECT m.score,m.reasons,p.* FROM matches m JOIN profiles p ON p.user_id=m.dj_id WHERE m.inquiry_id=? AND p.status='approved' ORDER BY m.score DESC`,
    )
    .all(id)
    .map((p) => ({
      ...publicProfile(p),
      score: p.score,
      reasons: parseJson(p.reasons),
    }));
}
app.get("/api/health", (_q, r) => r.json({ ok: true }));
app.get("/api/profiles", (_q, r) =>
  r.json(
    db
      .prepare(
        "SELECT * FROM profiles WHERE status='approved' ORDER BY id DESC",
      )
      .all()
      .map(publicProfile),
  ),
);
app.post("/api/auth/register", (req, res) => {
  try {
    const d = z
      .object({
        email,
        password: z.string().min(8),
        stage_name: txt(2, 80, "Künstlername"),
      })
      .parse(req.body);
    const result = db
      .prepare("INSERT INTO users(email,password_hash,role) VALUES(?,?,'dj')")
      .run(d.email.toLowerCase(), bcrypt.hashSync(d.password, 10));
    db.prepare("INSERT INTO profiles(user_id,stage_name) VALUES(?,?)").run(
      result.lastInsertRowid,
      d.stage_name,
    );
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE")
      return res
        .status(409)
        .json({ error: "E-Mail-Adresse bereits registriert." });
    fail(res, e);
  }
});
app.post("/api/auth/login", loginLimit, (req, res) => {
  const user = db
    .prepare("SELECT * FROM users WHERE email=?")
    .get(String(req.body.email || "").toLowerCase());
  if (
    !user ||
    !bcrypt.compareSync(String(req.body.password || ""), user.password_hash)
  )
    return res
      .status(401)
      .json({ error: "E-Mail oder Passwort stimmt nicht." });
  const v = Buffer.from(
    JSON.stringify({ id: user.id, exp: Date.now() + 7 * 86400000 }),
  ).toString("base64url");
  res.cookie("dj_session", sign(v), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400000,
  });
  res.json({ id: user.id, email: user.email, role: user.role });
});
app.post("/api/auth/logout", (_q, r) => {
  r.clearCookie("dj_session");
  r.json({ ok: true });
});
app.get("/api/auth/me", (req, res) => res.json(auth(req) || null));
app.get("/api/dj/profile", requireRole("dj"), (req, res) =>
  res.json(
    publicProfile(
      db.prepare("SELECT * FROM profiles WHERE user_id=?").get(req.user.id),
    ),
  ),
);
app.put("/api/dj/profile", requireRole("dj"), (req, res) => {
  try {
    const d = profileSchema.parse(req.body);
    db.prepare(
      `UPDATE profiles SET stage_name=@stage_name,bio=@bio,genres=@genres,events=@events,city=@city,radius=@radius,equipment=@equipment,references_text=@references_text,price_from=@price_from,availability=@availability,image_url=@image_url,status='pending' WHERE user_id=@user_id`,
    ).run({
      ...d,
      genres: JSON.stringify(d.genres),
      events: JSON.stringify(d.events),
      availability: JSON.stringify(d.availability),
      user_id: req.user.id,
    });
    res.json({ ok: true, status: "pending" });
  } catch (e) {
    fail(res, e);
  }
});
app.post("/api/dj/image", requireRole("dj"), (req, res) => {
  try {
    const data = String(req.body.data || "");
    const m = data.match(
      /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/,
    );
    if (!m) throw Error("PNG, JPEG oder WebP wählen.");
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 2 * 1024 * 1024)
      throw Error("Bild darf höchstens 2 MB groß sein.");
    fs.mkdirSync("uploads", { recursive: true });
    const filename = `${req.user.id}-${Date.now()}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
    fs.writeFileSync(path.join("uploads", filename), buf);
    res.json({ url: "/uploads/" + filename });
  } catch (e) {
    fail(res, e);
  }
});
app.post("/api/inquiries", inquiryLimit, (req, res) => {
  try {
    const d = inquirySchema.parse(req.body);
    if (d.event_date < new Date().toISOString().slice(0, 10))
      throw Error("Bitte ein zukünftiges Datum wählen.");
    const recent = db
      .prepare(
        "SELECT id FROM inquiries WHERE email=? AND event_date=? AND event_type=? AND created_at>datetime('now','-10 minutes')",
      )
      .get(d.email.toLowerCase(), d.event_date, d.event_type);
    if (recent)
      return res.status(429).json({
        error:
          "Diese Anfrage wurde bereits gesendet. Bitte prüfe deine E-Mail oder warte kurz.",
      });
    const token = crypto.randomBytes(24).toString("base64url");
    const result = db
      .prepare(
        `INSERT INTO inquiries(access_hash,name,email,event_type,genres,city,event_date,guests,start_time,end_time,budget,wishes,consent_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        hash(token),
        d.name,
        d.email.toLowerCase(),
        d.event_type,
        JSON.stringify(d.genres),
        d.city,
        d.event_date,
        d.guests || null,
        d.start_time || null,
        d.end_time || null,
        d.budget || null,
        d.wishes,
        new Date().toISOString(),
      );
    const inq = { ...d, genres: JSON.stringify(d.genres) };
    const profiles = db
      .prepare("SELECT * FROM profiles WHERE status='approved'")
      .all();
    for (const p of profiles) {
      const m = matchProfile(inq, p);
      if (m) {
        db.prepare(
          "INSERT INTO matches(inquiry_id,dj_id,score,reasons) VALUES(?,?,?,?)",
        ).run(
          result.lastInsertRowid,
          p.user_id,
          m.score,
          JSON.stringify(m.reasons),
        );
        const u = db
          .prepare("SELECT email FROM users WHERE id=?")
          .get(p.user_id);
        notify(
          u.email,
          "Neue passende Anfrage",
          `${d.event_type} am ${d.event_date} in ${d.city}. Im DJ-Bereich ansehen.`,
        );
      }
    }
    const link = `${process.env.APP_URL || "http://localhost:5173"}/anfrage/${token}`;
    notify(
      d.email,
      "Deine Anfrage bei DJKompass",
      `Dein privater Zugangslink: ${link}`,
    );
    res.status(201).json({ id: result.lastInsertRowid, token, link });
  } catch (e) {
    fail(res, e);
  }
});
app.get("/api/inquiries/:token", (req, res) => {
  const inq = inquiryForToken(req.params.token);
  if (!inq || inq.status === "spam")
    return res.status(404).json({ error: "Anfrage nicht gefunden." });
  const offers = db
    .prepare(
      `SELECT o.*,p.stage_name,p.city,p.image_url,u.email AS dj_email FROM offers o JOIN profiles p ON p.user_id=o.dj_id JOIN users u ON u.id=o.dj_id WHERE o.inquiry_id=? AND o.status='sent' ORDER BY o.price`,
    )
    .all(inq.id);
  res.json({
    inquiry: { ...inq, access_hash: undefined, genres: parseJson(inq.genres) },
    matches: getMatches(inq.id),
    offers,
  });
});
app.get("/api/dj/inquiries", requireRole("dj"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT i.*,m.score,m.reasons,o.status AS response_status FROM matches m JOIN inquiries i ON i.id=m.inquiry_id LEFT JOIN offers o ON o.inquiry_id=i.id AND o.dj_id=m.dj_id WHERE m.dj_id=? AND i.status='open' ORDER BY i.created_at DESC`,
    )
    .all(req.user.id);
  res.json(
    rows.map((x) => ({
      ...x,
      access_hash: undefined,
      genres: parseJson(x.genres),
      reasons: parseJson(x.reasons),
      email: undefined,
    })),
  );
});
app.post("/api/dj/inquiries/:id/respond", requireRole("dj"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const match = db
      .prepare(
        `SELECT m.* FROM matches m JOIN inquiries i ON i.id=m.inquiry_id WHERE m.inquiry_id=? AND m.dj_id=? AND i.status='open'`,
      )
      .get(id, req.user.id);
    if (!match)
      return res.status(404).json({ error: "Anfrage nicht verfügbar." });
    const d = z
      .discriminatedUnion("status", [
        z.object({ status: z.literal("declined") }),
        z.object({
          status: z.literal("sent"),
          price: z.coerce.number().int().min(1).max(1000000),
          scope: txt(10, 1200, "Leistungsumfang"),
          message: txt(10, 1200, "Nachricht"),
        }),
      ])
      .parse(req.body);
    db.prepare(
      `INSERT INTO offers(inquiry_id,dj_id,price,scope,message,status) VALUES(?,?,?,?,?,?) ON CONFLICT(inquiry_id,dj_id) DO UPDATE SET price=excluded.price,scope=excluded.scope,message=excluded.message,status=excluded.status,updated_at=CURRENT_TIMESTAMP`,
    ).run(
      id,
      req.user.id,
      d.price || 0,
      d.scope || "",
      d.message || "",
      d.status,
    );
    const inq = db.prepare("SELECT email FROM inquiries WHERE id=?").get(id);
    if (d.status === "sent")
      notify(
        inq.email,
        "Neues DJ-Angebot",
        "Ein DJ hat auf deine Anfrage geantwortet. Öffne deinen privaten Zugangslink.",
      );
    res.json({ ok: true });
  } catch (e) {
    fail(res, e);
  }
});
app.get("/api/admin/overview", requireRole("admin"), (_q, res) => {
  res.json({
    profiles: db
      .prepare(
        "SELECT p.*,u.email FROM profiles p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC",
      )
      .all()
      .map(publicProfile),
    inquiries: db
      .prepare(
        "SELECT id,name,email,event_type,genres,city,event_date,status,created_at FROM inquiries ORDER BY created_at DESC",
      )
      .all()
      .map((x) => ({
        ...x,
        genres: parseJson(x.genres),
        matches: db
          .prepare("SELECT COUNT(*) n FROM matches WHERE inquiry_id=?")
          .get(x.id).n,
      })),
    offers: db
      .prepare(
        "SELECT o.*,p.stage_name FROM offers o JOIN profiles p ON p.user_id=o.dj_id ORDER BY o.created_at DESC",
      )
      .all(),
    notifications: db
      .prepare("SELECT * FROM notification_events ORDER BY id DESC LIMIT 30")
      .all(),
  });
});
app.patch("/api/admin/profiles/:id", requireRole("admin"), (req, res) => {
  if (!["approved", "rejected", "pending"].includes(req.body.status))
    return res.status(400).json({ error: "Ungültiger Status." });
  const id = Number(req.params.id);
  db.prepare("UPDATE profiles SET status=? WHERE id=?").run(
    req.body.status,
    id,
  );
  if (req.body.status === "approved") {
    const p = db.prepare("SELECT * FROM profiles WHERE id=?").get(id);
    for (const inq of db
      .prepare(
        "SELECT * FROM inquiries WHERE status='open' AND event_date>=date('now')",
      )
      .all()) {
      if (matchInquiry(inq, p)) {
        const u = db
          .prepare("SELECT email FROM users WHERE id=?")
          .get(p.user_id);
        notify(
          u.email,
          "Neue passende Anfrage",
          `${inq.event_type} am ${inq.event_date} in ${inq.city}. Im DJ-Bereich ansehen.`,
        );
      }
    }
  }
  res.json({ ok: true });
});
app.patch("/api/admin/inquiries/:id", requireRole("admin"), (req, res) => {
  if (!["open", "spam", "closed"].includes(req.body.status))
    return res.status(400).json({ error: "Ungültiger Status." });
  db.prepare("UPDATE inquiries SET status=? WHERE id=?").run(
    req.body.status,
    Number(req.params.id),
  );
  res.json({ ok: true });
});
app.get("/api/admin/inquiries/:id/matches", requireRole("admin"), (req, res) =>
  res.json(
    db
      .prepare(
        `SELECT m.*,p.stage_name FROM matches m JOIN profiles p ON p.user_id=m.dj_id WHERE m.inquiry_id=?`,
      )
      .all(Number(req.params.id))
      .map((m) => ({ ...m, reasons: parseJson(m.reasons) })),
  ),
);
if (fs.existsSync("dist")) {
  app.use(express.static(path.resolve("dist")));
  app.get("/{*path}", (_q, r) => r.sendFile(path.resolve("dist/index.html")));
}
app.listen(PORT, () =>
  console.log(`DJKompass API auf http://localhost:${PORT}`),
);
