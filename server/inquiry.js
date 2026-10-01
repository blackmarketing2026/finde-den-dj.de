import { z } from "zod";

export const email = z.email("Bitte eine gültige E-Mail-Adresse eingeben.");
export const txt = (min, max, label) =>
  z
    .string()
    .trim()
    .min(min, `${label} fehlt.`)
    .max(max, `${label} ist zu lang.`);
export const list = z
  .array(z.string().trim().min(1))
  .min(1, "Bitte mindestens eine Option auswählen.")
  .max(12);
export const inquirySchema = z.object({
  name: txt(2, 100, "Name"),
  email,
  phone: z
    .string()
    .trim()
    .max(40, "Telefonnummer ist zu lang.")
    .regex(/^[+\d\s()/.-]*$/,"Bitte eine gültige Telefonnummer eingeben.")
    .default(""),
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

export const isPastDate = (date) =>
  date < new Date().toISOString().slice(0, 10);

export const leadSubject = (d) =>
  `Neue DJ-Anfrage: ${d.event_type} am ${d.event_date} in ${d.city}`;

export const leadText = (d) =>
  [
    `Name: ${d.name}`,
    `E-Mail: ${d.email}`,
    `Telefon: ${d.phone || "-"}`,
    `Event: ${d.event_type}`,
    `Datum: ${d.event_date}`,
    `Ort: ${d.city}`,
    `Musik: ${d.genres.join(", ") || "-"}`,
    `Gäste: ${d.guests || "-"}`,
    `Zeit: ${d.start_time || "?"} – ${d.end_time || "?"}`,
    `Budget: ${d.budget ? `${d.budget} €` : "-"}`,
    `Wünsche: ${d.wishes || "-"}`,
  ].join("\n");

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const germanDate = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

// Internationale Ziffernfolge für tel:/wa.me, deutsche Nummern ohne Vorwahl erhalten 49.
export function phoneDigits(phone = "") {
  const p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) return p.slice(1).replace(/\D/g, "");
  if (p.startsWith("00")) return p.slice(2);
  if (p.startsWith("0")) return `49${p.slice(1)}`;
  return p;
}

const C = {
  ink: "#191D18",
  accent: "#E4FF5E",
  cream: "#F3F3ED",
  line: "#E2E3DB",
  muted: "#6B7166",
  whatsapp: "#25D366",
};
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const button = (href, label, bg, color) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 10px 0;padding:14px 22px;border-radius:999px;background:${bg};color:${color};font:700 15px/1 ${FONT};text-decoration:none;white-space:nowrap">${label}</a>`;

const row = (label, value) =>
  `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font:600 12px/1.4 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${C.muted};width:38%;vertical-align:top">${label}</td><td style="padding:12px 0;border-bottom:1px solid ${C.line};font:600 15px/1.4 ${FONT};color:${C.ink}">${value}</td></tr>`;

export function leadHtml(d, id) {
  const date = germanDate(d.event_date);
  const digits = phoneDigits(d.phone);
  const greeting = `Hallo ${d.name}, danke für deine DJ-Anfrage für ${d.event_type} am ${date} in ${d.city}. `;
  const mailto = `mailto:${d.email}?subject=${encodeURIComponent(`Deine DJ-Anfrage: ${d.event_type} am ${date}`)}&body=${encodeURIComponent(`Hallo ${d.name},\n\ndanke für deine Anfrage!\n\n`)}`;
  const buttons = [
    digits &&
      button(
        `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`,
        "WhatsApp",
        C.whatsapp,
        "#FFFFFF",
      ),
    digits && button(`tel:+${digits}`, "Anrufen", C.accent, C.ink),
    button(mailto, "E-Mail", C.ink, "#FFFFFF"),
  ]
    .filter(Boolean)
    .join("");
  const chips = d.genres
    .map(
      (g) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;background:${C.cream};border:1px solid ${C.line};font:600 13px/1 ${FONT};color:${C.ink}">${esc(g)}</span>`,
    )
    .join("");
  const time = [d.start_time, d.end_time].filter(Boolean).join(" – ");
  const received = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(leadSubject(d))}</title></head>
<body style="margin:0;padding:0;background:${C.cream}">
<div style="display:none;max-height:0;overflow:hidden">${esc(`${d.name} · ${date} · ${d.city}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden">
<tr><td style="background:${C.ink};padding:32px 32px 28px">
  <div style="font:700 12px/1 ${FONT};letter-spacing:.18em;color:${C.accent}">NEUE DJ-ANFRAGE</div>
  <div style="margin-top:14px;font:800 32px/1.1 ${FONT};color:#FFFFFF">${esc(d.event_type)}</div>
  <div style="margin-top:10px;font:500 16px/1.4 ${FONT};color:#C9CEC2">${esc(date)} · ${esc(d.city)}</div>
</td></tr>
<tr><td style="padding:28px 32px 18px">
  <div style="font:700 12px/1 ${FONT};letter-spacing:.12em;color:${C.muted}">KONTAKT</div>
  <div style="margin-top:10px;font:800 22px/1.2 ${FONT};color:${C.ink}">${esc(d.name)}</div>
  <div style="margin-top:6px;font:500 15px/1.5 ${FONT};color:${C.ink}">
    <a href="mailto:${esc(d.email)}" style="color:${C.ink}">${esc(d.email)}</a>${d.phone ? ` · <a href="tel:+${digits}" style="color:${C.ink}">${esc(d.phone)}</a>` : ""}
  </div>
  <div style="margin-top:20px">${buttons}</div>
</td></tr>
<tr><td style="padding:6px 32px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row("Datum", esc(date))}
    ${row("Ort", esc(d.city))}
    ${row("Uhrzeit", time ? `${esc(time)} Uhr` : "–")}
    ${row("Gäste", d.guests ? esc(d.guests) : "–")}
    ${row("Budget", d.budget ? `${esc(d.budget.toLocaleString("de-DE"))} €` : "–")}
  </table>
</td></tr>
<tr><td style="padding:20px 32px 8px">
  <div style="font:700 12px/1 ${FONT};letter-spacing:.12em;color:${C.muted}">MUSIK</div>
  <div style="margin-top:12px">${chips}</div>
</td></tr>
${
  d.wishes
    ? `<tr><td style="padding:14px 32px 8px">
  <div style="font:700 12px/1 ${FONT};letter-spacing:.12em;color:${C.muted}">WÜNSCHE</div>
  <div style="margin-top:12px;padding:16px 18px;border-left:4px solid ${C.accent};background:${C.cream};border-radius:0 12px 12px 0;font:500 15px/1.6 ${FONT};color:${C.ink};white-space:pre-line">${esc(d.wishes)}</div>
</td></tr>`
    : ""
}
<tr><td style="padding:24px 32px 28px;font:500 12px/1.5 ${FONT};color:${C.muted}">
  Eingegangen am ${esc(received)} über DJKompass${id ? ` · Anfrage-ID ${esc(id)}` : ""}.<br>Antworten auf diese E-Mail gehen direkt an ${esc(d.name)}.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
