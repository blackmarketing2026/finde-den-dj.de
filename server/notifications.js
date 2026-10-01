import nodemailer from "nodemailer";
import { db } from "./db.js";

const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;
const configured =
  ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].every(
    (key) => process.env[key],
  ) && SMTP_FROM;
const transport = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
  : null;

export function notify(recipient, subject, body, replyTo) {
  const event = db
    .prepare(
      "INSERT INTO notification_events(recipient,subject,body,status) VALUES(?,?,?,?)",
    )
    .run(recipient, subject, body, transport ? "queued" : "local");
  if (!transport) {
    console.log(`[Benachrichtigung lokal] ${recipient}: ${subject}\n${body}`);
    return;
  }
  transport
    .sendMail({
      from: SMTP_FROM,
      to: recipient,
      replyTo,
      subject,
      text: body,
    })
    .then(() =>
      db
        .prepare("UPDATE notification_events SET status='sent' WHERE id=?")
        .run(event.lastInsertRowid),
    )
    .catch((error) => {
      db.prepare(
        "UPDATE notification_events SET status='failed' WHERE id=?",
      ).run(event.lastInsertRowid);
      console.error("E-Mail-Versand fehlgeschlagen:", error.message);
    });
}
