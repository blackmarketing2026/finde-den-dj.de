# DJKompass

Responsiver MVP für DJ-Vermittlung mit React/Vite, Express und SQLite. Profile, Anfragen, Zuordnungen, Angebote und lokale Benachrichtigungsereignisse werden in `data/djkompass.sqlite` gespeichert.

## Lokal starten

```powershell
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

Frontend: http://localhost:5173 · API: http://localhost:3001

Für einen lokalen Produktionsbuild: `npm run build` und `npm start` (Port 3001). Vor öffentlichem Betrieb `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `APP_URL` und die Rechtstexte setzen. `npm run seed` legt Demo-Konten nur an, wenn sie noch fehlen.

## Rollen testen

- Veranstalter: Auf der Startseite ein Event eingeben, Anfrage abschicken und den privaten Zugangslink öffnen. Er wird auch in `notification_events` gespeichert und im Server-Terminal ausgegeben. Es gibt bewusst keine erfundenen Angebote.
- DJ: `maya@djkompass.local` / `demo12345` (auch `noah@djkompass.local` und `lina@djkompass.local`). Im Dashboard eine passende Anfrage öffnen und Angebot abgeben oder ablehnen. Ein neues DJ-Konto kann über „Als DJ registrieren“ erstellt werden.
- Admin: `admin@djkompass.local` / `change-this-before-deployment`. Profile freigeben, Zuordnungen prüfen, Anfragen als Spam markieren und Angebote sowie Benachrichtigungsereignisse ansehen.

## Seiten

Startseite, mehrstufige Anfrage, privater Anfragestatus mit passenden DJs und Angebotsvergleich, DJ-Registrierung/Anmeldung/Dashboard/Profil, Admin-Dashboard, Impressum und Datenschutz als deutlich gekennzeichnete Platzhalter.

## Konfiguration und Grenzen

Markenname und wichtige UI-Texte/Farben liegen in `src/config.js`. Das Design in Waldgrün, Elfenbein und Champagnergold wird über `src/theme.css` gestaltet; `src/style.css` enthält die Grundlayouts. Die Schallplatte mit Kompassnadel unter `public/logos/vinyl-compass.svg` ist als Logo und Favicon aktiv. Frühere Entwürfe bleiben unter `public/logos/` erhalten.

Animationen umfassen dezente Schallplattenrotation, bewegte Klangbalken, Einblendungen beim Scrollen und Hover-Effekte. Die Systemeinstellung `prefers-reduced-motion` schaltet diese Bewegungen ab. Schriften werden lokal mitgeliefert.

SMTP ist optional. Ohne `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` werden Ereignisse lokal in der Datenbank und im Server-Terminal dokumentiert. Mit diesen Variablen wird E-Mail-Versand aktiviert. Zahlungsabwicklung und Gebühren sind nicht aktiv.

Das lokale Standortmatching kann gleiche Ortsnamen sowie einige große deutsche Städte und PLZ-Bereiche mit hinterlegten Koordinaten abgleichen. Für bundesweit genaue PLZ-Radien wird später eine Geodatenquelle benötigt. Der Terminabgleich nutzt die von DJs als **belegt** eingetragenen Daten; ein nicht belegter Termin ist keine verbindliche Verfügbarkeitszusage.

## Prüfung

Nach `npm run seed` und bei laufender API: `node scripts/smoke.mjs`. Der Test legt eine echte lokale Testanfrage und ein Angebot an.
