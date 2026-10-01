import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 587);
const from = process.env.SMTP_FROM || process.env.SMTP_USER;

export const transport =
  ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].every(
    (key) => process.env[key],
  ) && from
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      })
    : null;

export const sendMail = (to, subject, text, replyTo) =>
  transport.sendMail({ from, to, replyTo, subject, text });
