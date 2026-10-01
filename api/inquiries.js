import {
  inquirySchema,
  isPastDate,
  leadSubject,
  leadText,
} from "../server/inquiry.js";
import { sendMail, transport } from "../server/mailer.js";

// Vercel-Funktion: Ohne dauerhaften Server wird die Anfrage nur per E-Mail weitergeleitet.
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Methode nicht erlaubt." });
  let d;
  try {
    d = inquirySchema.parse(req.body || {});
    if (isPastDate(d.event_date))
      throw Error("Bitte ein zukünftiges Datum wählen.");
  } catch (e) {
    return res.status(400).json({
      error: e.issues?.[0]?.message || e.message || "Ungültige Eingabe.",
    });
  }
  if (!transport || !process.env.SMTP_RECIPIENTS) {
    console.error("SMTP oder SMTP_RECIPIENTS ist nicht konfiguriert.");
    return res
      .status(500)
      .json({ error: "Der Versand ist gerade nicht möglich." });
  }
  try {
    await sendMail(
      process.env.SMTP_RECIPIENTS,
      leadSubject(d),
      leadText(d),
      d.email,
    );
  } catch (e) {
    console.error("Lead-Mail fehlgeschlagen:", e.message);
    return res.status(502).json({
      error:
        "Deine Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.",
    });
  }
  try {
    await sendMail(
      d.email,
      "Deine Anfrage bei DJKompass",
      `Hallo ${d.name},\n\nvielen Dank für deine Anfrage. Wir melden uns in Kürze bei dir.\n\nDeine Angaben:\n${leadText(d)}\n\nDein DJKompass-Team`,
    );
  } catch (e) {
    console.error("Bestätigungsmail fehlgeschlagen:", e.message);
  }
  res.status(201).json({ sent: true });
}
