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
    `Event: ${d.event_type}`,
    `Datum: ${d.event_date}`,
    `Ort: ${d.city}`,
    `Musik: ${d.genres.join(", ") || "-"}`,
    `Gäste: ${d.guests || "-"}`,
    `Zeit: ${d.start_time || "?"} – ${d.end_time || "?"}`,
    `Budget: ${d.budget ? `${d.budget} €` : "-"}`,
    `Wünsche: ${d.wishes || "-"}`,
  ].join("\n");
