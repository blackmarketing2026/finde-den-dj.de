import { db } from "./db.js";
import { sendMail, transport } from "./mailer.js";

export function notify(recipient, subject, body, extra = {}) {
  const event = db
    .prepare(
      "INSERT INTO notification_events(recipient,subject,body,status) VALUES(?,?,?,?)",
    )
    .run(recipient, subject, body, transport ? "queued" : "local");
  if (!transport) {
    console.log(`[Benachrichtigung lokal] ${recipient}: ${subject}\n${body}`);
    return;
  }
  sendMail({ to: recipient, subject, text: body, ...extra })
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
