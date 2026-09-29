import React, { useEffect, useState } from "react";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { brand, copy, eventTypes, genres } from "./config";
import "./style.css";

async function api(url, options = {}) {
  const res = await fetch("/api" + url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(data.error || "Etwas ist schiefgelaufen.");
  return data;
}
const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    spark: (
      <>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 10h18" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
};
const initial = {
  event_type: "",
  genres: [],
  city: "",
  event_date: "",
  guests: "",
  start_time: "",
  end_time: "",
  budget: "",
  wishes: "",
  name: "",
  email: "",
  consent: false,
  website: "",
};
function useDraft() {
  const [draft, setDraft] = useState(() => {
    try {
      return {
        ...initial,
        ...JSON.parse(sessionStorage.getItem("dj_draft") || "{}"),
      };
    } catch {
      return initial;
    }
  });
  useEffect(
    () => sessionStorage.setItem("dj_draft", JSON.stringify(draft)),
    [draft],
  );
  return [draft, setDraft];
}
function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function GenrePicker({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Musikrichtungen">
      {genres.map((g) => (
        <button
          type="button"
          key={g}
          className={"chip " + (value.includes(g) ? "selected" : "")}
          aria-pressed={value.includes(g)}
          onClick={() =>
            onChange(
              value.includes(g) ? value.filter((x) => x !== g) : [...value, g],
            )
          }
        >
          {g}
        </button>
      ))}
    </div>
  );
}
function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => {});
  }, []);
  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="logo" to="/">
          <img src="/logos/djkompass-mark.svg" alt="" />
          <span>{brand.name}</span>
        </Link>
        <nav aria-label="Hauptnavigation">
          <NavLink to="/#ablauf">So funktioniert's</NavLink>
          <NavLink to="/dj">Für DJs</NavLink>
          <Link
            className="nav-login"
            to={
              user?.role === "admin"
                ? "/admin"
                : user?.role === "dj"
                  ? "/dj/dashboard"
                  : "/login"
            }
          >
            {user ? "Dashboard" : "Anmelden"}
          </Link>
          <Link className="button button-small" to="/anfrage">
            DJ finden <Icon name="arrow" size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" to="/">
            <img src="/logos/djkompass-mark.svg" alt="" />
            {brand.name}
          </Link>
          <p>{brand.tagline}</p>
        </div>
        <div>
          <strong>Plattform</strong>
          <Link to="/anfrage">DJ finden</Link>
          <Link to="/dj">Für DJs</Link>
          <Link to="/login">Anmelden</Link>
        </div>
        <div>
          <strong>Informationen</strong>
          <Link to="/impressum">Impressum</Link>
          <Link to="/datenschutz">Datenschutz</Link>
        </div>
        <div className="footer-end">
          © {new Date().getFullYear()} {brand.name}
          <br />
          Mit Musik wird mehr daraus.
        </div>
      </div>
    </footer>
  );
}
function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
function Home() {
  const navigate = useNavigate();
  const [draft, setDraft] = useDraft();
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    api("/profiles")
      .then(setProfiles)
      .catch(() => {});
  }, []);
  const update = (key, val) => setDraft((d) => ({ ...d, [key]: val }));
  return (
    <Layout>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> {copy.home.eyebrow}
            </div>
            <h1>
              {copy.home.headlineStart} <em>{copy.home.headlineAccent}</em>
            </h1>
            <p className="hero-sub">{copy.home.subtitle}</p>
            <div className="hero-proof">
              <div className="proof-avatars">
                <span>M</span>
                <span>N</span>
                <span>L</span>
              </div>
              <span>Persönlich. Passend. Unvergesslich.</span>
            </div>
          </div>
          <form
            className="hero-form card"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/anfrage");
            }}
          >
            <div className="form-header">
              <span className="badge">IN 2 MINUTEN STARTEN</span>
              <h2>{copy.home.formTitle}</h2>
              <p>{copy.home.formIntro}</p>
            </div>
            <Field label="Was feierst du?">
              <select
                required
                value={draft.event_type}
                onChange={(e) => update("event_type", e.target.value)}
              >
                <option value="">Event auswählen</option>
                {eventTypes.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Welche Musik soll laufen?">
              <GenrePicker
                value={draft.genres}
                onChange={(x) => update("genres", x)}
              />
            </Field>
            <div className="form-row">
              <Field label="Wo findet das Event statt?">
                <input
                  required
                  placeholder="Ort oder PLZ"
                  value={draft.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
              <Field label="Wann findet es statt?">
                <input
                  required
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={draft.event_date}
                  onChange={(e) => update("event_date", e.target.value)}
                />
              </Field>
            </div>
            <button
              className="button button-full"
              disabled={!draft.genres.length}
            >
              {copy.home.findButton} <Icon name="arrow" />
            </button>
            <p className="form-foot">
              <Icon name="shield" size={15} /> Kostenlos & unverbindlich
              anfragen
            </p>
          </form>
        </div>
        <div className="container stat-line">
          <span>Für Momente, die bleiben.</span>
          <div>
            <strong>01</strong> Wunschmusik angeben
          </div>
          <div>
            <strong>02</strong> DJs entdecken
          </div>
          <div>
            <strong>03</strong> Angebote vergleichen
          </div>
        </div>
      </section>
      <section className="section light" id="ablauf">
        <div className="container">
          <div className="section-top">
            <div>
              <div className="kicker">SO EINFACH GEHT'S</div>
              <h2>
                {copy.home.stepsTitle} <span>{copy.home.stepsAccent}</span>
              </h2>
            </div>
            <p>
              Weniger Suchen. Mehr Vorfreude. Wir bringen deine Vorstellungen
              mit den richtigen Menschen zusammen.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-number">01</span>
              <div className="step-icon">
                <Icon name="music" size={29} />
              </div>
              <h3>Erzähl uns von deinem Event</h3>
              <p>
                Was du feierst, welche Musik du liebst und wo die Party steigt.
              </p>
            </div>
            <div className="step">
              <span className="step-number">02</span>
              <div className="step-icon">
                <Icon name="spark" size={29} />
              </div>
              <h3>Entdecke passende DJs</h3>
              <p>
                Sieh auf einen Blick, welche DJs zu deinem Event passen – und
                warum.
              </p>
            </div>
            <div className="step">
              <span className="step-number">03</span>
              <div className="step-icon">
                <Icon name="heart" size={29} />
              </div>
              <h3>Vergleiche echte Angebote</h3>
              <p>
                Erhalte individuelle Antworten und entscheide in deinem Tempo.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="container benefit-grid">
          <div>
            <div className="kicker">DEIN EVENT. DEINE ENTSCHEIDUNG.</div>
            <h2>
              {copy.home.benefitsTitle} <span>{copy.home.benefitsAccent}</span>
            </h2>
            <p>
              Ein guter DJ spielt nicht einfach Songs. Er versteht den Anlass,
              liest die Stimmung und macht aus einem Abend eine Erinnerung.
            </p>
            <Link className="button" to="/anfrage">
              Jetzt DJ finden <Icon name="arrow" />
            </Link>
          </div>
          <div className="benefit-list">
            <div>
              <Icon name="check" />
              <span>
                <strong>Passende Vorschläge</strong> nach Stil, Event und
                Einsatzgebiet
              </span>
            </div>
            <div>
              <Icon name="check" />
              <span>
                <strong>Klare Gründe</strong> für jeden Vorschlag
              </span>
            </div>
            <div>
              <Icon name="check" />
              <span>
                <strong>Individuelle Angebote</strong> direkt von DJs
              </span>
            </div>
            <div>
              <Icon name="check" />
              <span>
                <strong>Ohne Buchungsdruck</strong> und derzeit ohne Gebühren
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section light" id="djs">
        <div className="container">
          <div className="section-top">
            <div>
              <div className="kicker">MENSCHEN HINTER DEM PULT</div>
              <h2>
                {copy.home.profilesTitle}{" "}
                <span>{copy.home.profilesAccent}</span>
              </h2>
            </div>
            <p>
              Ein erster Blick auf Künstlerinnen und Künstler aus unserer
              Community.
            </p>
          </div>
          <div className="profile-grid">
            {profiles.slice(0, 3).map((p, i) => (
              <ProfileCard key={p.id} p={p} index={i} />
            ))}
            {!profiles.length && (
              <p>Noch keine freigegebenen Profile vorhanden.</p>
            )}
          </div>
        </div>
      </section>
      <section className="section dj-banner">
        <div className="container banner-inner">
          <div>
            <div className="kicker">DU STEHST HINTER DEN DECKS?</div>
            <h2>
              Die richtigen Anfragen.
              <br />
              <em>Dein nächster Gig.</em>
            </h2>
            <p>
              Zeig, was dich ausmacht, und antworte auf Events, die zu dir
              passen.
            </p>
          </div>
          <Link className="button button-coral" to="/dj">
            {copy.home.djButton} <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section className="section light faq">
        <div className="container faq-grid">
          <div>
            <div className="kicker">GUT ZU WISSEN</div>
            <h2>
              Häufige <span>Fragen.</span>
            </h2>
            <p>Alles Wichtige für deinen Start.</p>
          </div>
          <div>
            {copy.home.faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
function ProfileCard({ p, index = 0 }) {
  return (
    <article className="profile-card">
      <div className={"profile-art art-" + index}>
        {p.image_url ? (
          <img src={p.image_url} alt={`Profilbild von ${p.stage_name}`} />
        ) : (
          <span>
            {p.stage_name
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}
        <div className="art-wave">♪</div>
      </div>
      <div className="profile-content">
        <div className="profile-meta">
          <Icon name="pin" size={16} />
          {p.city} <span>·</span> ab{" "}
          {p.price_from ? `${p.price_from} €` : "auf Anfrage"}
        </div>
        <h3>{p.stage_name}</h3>
        <p>{p.bio}</p>
        <div className="mini-chips">
          {p.genres.slice(0, 3).map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
function Request() {
  const [d, setD] = useDraft();
  const [step, setStep] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const set = (k, v) => setD((o) => ({ ...o, [k]: v }));
  function next(e) {
    e.preventDefault();
    setError("");
    if (
      step === 1 &&
      (!d.event_type || !d.genres.length || !d.city.trim() || !d.event_date)
    ) {
      setError("Bitte fülle alle Angaben zum Event aus.");
      return;
    }
    if (step === 2 && (!d.name.trim() || !d.email.includes("@"))) {
      setError("Bitte Name und gültige E-Mail-Adresse eingeben.");
      return;
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  }
  async function submit(e) {
    e.preventDefault();
    if (!d.consent) {
      setError("Bitte stimme der Datenschutzeinwilligung zu.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api("/inquiries", { method: "POST", body: d });
      sessionStorage.removeItem("dj_draft");
      nav("/anfrage/" + r.token);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <section className="page-section">
        <div className="container narrow">
          <Link className="back-link" to="/">
            ← Zur Startseite
          </Link>
          <div className="page-heading">
            <div className="kicker">DEINE ANFRAGE</div>
            <h1>
              Ein paar Details. <span>Viele Möglichkeiten.</span>
            </h1>
            <p>
              Je genauer deine Angaben, desto besser können DJs auf dein Event
              eingehen.
            </p>
          </div>
          <div className="progress">
            <div className={step >= 1 ? "active" : ""}>
              1 <span>Event</span>
            </div>
            <div className={step >= 2 ? "active" : ""}>
              2 <span>Details</span>
            </div>
            <div className={step >= 3 ? "active" : ""}>
              3 <span>Prüfen</span>
            </div>
          </div>
          <form
            className="request-card card"
            onSubmit={step === 3 ? submit : next}
          >
            {step === 1 ? (
              <>
                <h2>Was planst du?</h2>
                <Field label="Eventart *">
                  <select
                    required
                    value={d.event_type}
                    onChange={(e) => set("event_type", e.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    {eventTypes.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Musikrichtungen *">
                  <GenrePicker
                    value={d.genres}
                    onChange={(x) => set("genres", x)}
                  />
                </Field>
                <div className="form-row">
                  <Field label="Ort oder Postleitzahl *">
                    <input
                      required
                      value={d.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="z. B. Berlin"
                    />
                  </Field>
                  <Field label="Datum *">
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={d.event_date}
                      onChange={(e) => set("event_date", e.target.value)}
                    />
                  </Field>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <h2>Mach dein Event greifbar.</h2>
                <div className="form-row">
                  <Field label="Gästezahl">
                    <input
                      type="number"
                      min="1"
                      value={d.guests}
                      onChange={(e) => set("guests", e.target.value)}
                      placeholder="z. B. 80"
                    />
                  </Field>
                  <Field label="Budget ungefähr (€)">
                    <input
                      type="number"
                      min="0"
                      value={d.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      placeholder="Optional"
                    />
                  </Field>
                </div>
                <div className="form-row">
                  <Field label="Beginn">
                    <input
                      type="time"
                      value={d.start_time}
                      onChange={(e) => set("start_time", e.target.value)}
                    />
                  </Field>
                  <Field label="Ende">
                    <input
                      type="time"
                      value={d.end_time}
                      onChange={(e) => set("end_time", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Besondere Wünsche">
                  <textarea
                    rows="4"
                    value={d.wishes}
                    onChange={(e) => set("wishes", e.target.value)}
                    placeholder="Musik, Technik, Ablauf oder alles, was dir wichtig ist"
                  />
                </Field>
                <div className="form-row">
                  <Field label="Dein Name *">
                    <input
                      required
                      value={d.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>
                  <Field label="E-Mail-Adresse *">
                    <input
                      required
                      type="email"
                      value={d.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <>
                <h2>Alles richtig?</h2>
                <div className="summary">
                  {[
                    ["Event", d.event_type],
                    ["Musik", d.genres.join(", ")],
                    ["Ort", d.city],
                    ["Datum", d.event_date],
                    ["Gäste", d.guests || "–"],
                    [
                      "Zeitrahmen",
                      [d.start_time, d.end_time].filter(Boolean).join(" – ") ||
                        "–",
                    ],
                    ["Budget", d.budget ? `${d.budget} €` : "–"],
                    ["Wünsche", d.wishes || "–"],
                    ["Kontakt", `${d.name} · ${d.email}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={d.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                  />
                  <span>
                    Ich stimme zu, dass meine Angaben zur Vermittlung an
                    passende DJs verarbeitet und für deren individuelle Angebote
                    weitergegeben werden. Die{" "}
                    <Link to="/datenschutz" target="_blank">
                      Datenschutzhinweise
                    </Link>{" "}
                    habe ich gelesen. *
                  </span>
                </label>
                <input
                  className="honeypot"
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                  value={d.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </>
            )}
            {error && (
              <div className="alert" role="alert">
                {error}
              </div>
            )}
            <div className="form-actions">
              {step > 1 && (
                <button
                  type="button"
                  className="button-ghost"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                >
                  Zurück
                </button>
              )}
              <button className="button" disabled={busy}>
                {busy
                  ? "Wird gesendet …"
                  : step === 3
                    ? "Anfrage absenden"
                    : "Weiter"}{" "}
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
function Inquiry() {
  const { token } = useParams(),
    [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("/inquiries/" + token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);
  return (
    <Layout>
      <section className="page-section">
        <div className="container">
          <div className="page-heading">
            <div className="kicker">DEIN PRIVATER BEREICH</div>
            <h1>
              Deine Anfrage ist <span>unterwegs.</span>
            </h1>
            <p>
              Bewahre diesen Link auf. Hier erscheinen die Antworten der DJs.
            </p>
          </div>
          {error ? (
            <div className="alert">{error}</div>
          ) : !data ? (
            <p>Lade Anfrage …</p>
          ) : (
            <>
              <div className="status-card">
                <Icon name="check" />
                <div>
                  <strong>Anfrage #{data.inquiry.id} gesendet</strong>
                  <p>
                    {data.inquiry.event_type} am {data.inquiry.event_date} in{" "}
                    {data.inquiry.city}
                  </p>
                </div>
                <button
                  className="button-ghost"
                  onClick={() => navigator.clipboard.writeText(location.href)}
                >
                  Link kopieren
                </button>
              </div>
              <div className="section-heading">
                <h2>
                  Passende DJs <span>für dich</span>
                </h2>
                <p>
                  Diese Auswahl basiert auf deinen Angaben. Die Anfahrt und
                  tatsächliche Verfügbarkeit bitte direkt abstimmen.
                </p>
              </div>
              <div className="profile-grid">
                {data.matches.map((p, i) => (
                  <div key={p.id}>
                    <ProfileCard p={p} index={i % 3} />
                    <div className="match-reasons">
                      <strong>Warum vorgeschlagen?</strong>
                      {p.reasons.map((x) => (
                        <span key={x}>
                          <Icon name="check" size={15} />
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!data.matches.length && (
                  <div className="empty">
                    Aktuell gibt es keine passenden freigegebenen DJs. Deine
                    Anfrage bleibt gespeichert.
                  </div>
                )}
              </div>
              <div className="section-heading offers-heading">
                <h2>
                  Angebote <span>vergleichen</span>
                </h2>
                <p>
                  {data.offers.length
                    ? `${data.offers.length} individuelle Antwort${data.offers.length > 1 ? "en" : ""} eingegangen.`
                    : "Noch keine Antworten eingegangen. Schau später mit diesem Link erneut vorbei."}
                </p>
              </div>
              {data.offers.length ? (
                <div className="offers-grid">
                  {data.offers.map((o) => (
                    <article className="offer-card card" key={o.id}>
                      <div className="offer-top">
                        <h3>{o.stage_name}</h3>
                        <strong>{o.price.toLocaleString("de-DE")} €</strong>
                      </div>
                      <div className="offer-label">Leistungsumfang</div>
                      <p>{o.scope}</p>
                      <div className="offer-label">Persönliche Nachricht</div>
                      <p>{o.message}</p>
                      <a
                        className="button button-small offer-contact"
                        href={`mailto:${o.dj_email}?subject=${encodeURIComponent("DJKompass Anfrage #" + data.inquiry.id)}`}
                      >
                        DJ kontaktieren <Icon name="arrow" size={16} />
                      </a>
                      <small>
                        Abgegeben am{" "}
                        {new Date(o.created_at + "Z").toLocaleDateString(
                          "de-DE",
                        )}
                      </small>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Icon name="music" size={32} />
                  <h3>Die Bühne ist bereit.</h3>
                  <p>
                    Sobald ein DJ ein Angebot abgibt, siehst du es hier. Es
                    werden keine Beispielangebote angezeigt.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      nav(u.role === "admin" ? "/admin" : "/dj/dashboard");
      location.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <section className="page-section">
        <div className="container auth-wrap">
          <div className="page-heading">
            <div className="kicker">WILLKOMMEN ZURÜCK</div>
            <h1>
              Dein nächster <span>Auftritt wartet.</span>
            </h1>
            <p>Melde dich in deinem DJ- oder Admin-Konto an.</p>
          </div>
          <form className="card auth-card" onSubmit={submit}>
            <Field label="E-Mail-Adresse">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Passwort">
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <div className="alert">{error}</div>}
            <button className="button button-full" disabled={busy}>
              {busy ? "Anmeldung läuft …" : "Anmelden"} <Icon name="arrow" />
            </button>
            <p>
              Noch kein DJ-Konto? <Link to="/dj">Jetzt registrieren</Link>
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
}
function DJLanding() {
  const [d, setD] = useState({ stage_name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/register", { method: "POST", body: d });
      nav("/login");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <section className="page-section">
        <div className="container dj-landing">
          <div>
            <div className="kicker">FÜR DJS</div>
            <h1>
              Dein Sound.
              <br />
              <span>Die passenden Events.</span>
            </h1>
            <p className="lead">
              Erstelle dein Profil, werde nach Freigabe gefunden und antworte
              auf Anfragen, die zu dir passen.
            </p>
            <div className="feature-points">
              <div>
                <Icon name="check" /> Dein Profil zeigt, was dich ausmacht.
              </div>
              <div>
                <Icon name="check" /> Passende Anfragen landen in deinem
                Dashboard.
              </div>
              <div>
                <Icon name="check" /> Du bestimmst Preis und Leistungsumfang.
              </div>
            </div>
          </div>
          <form className="card auth-card" onSubmit={submit}>
            <span className="badge">KOSTENLOS STARTEN</span>
            <h2>Als DJ registrieren</h2>
            <Field label="Künstlername">
              <input
                required
                minLength="2"
                value={d.stage_name}
                onChange={(e) => setD({ ...d, stage_name: e.target.value })}
              />
            </Field>
            <Field label="E-Mail-Adresse">
              <input
                required
                type="email"
                value={d.email}
                onChange={(e) => setD({ ...d, email: e.target.value })}
              />
            </Field>
            <Field label="Passwort">
              <input
                required
                type="password"
                minLength="8"
                value={d.password}
                onChange={(e) => setD({ ...d, password: e.target.value })}
              />
              <small>Mindestens 8 Zeichen</small>
            </Field>
            {error && <div className="alert">{error}</div>}
            <button className="button button-full" disabled={busy}>
              {busy ? "Konto wird erstellt …" : "Konto erstellen"}{" "}
              <Icon name="arrow" />
            </button>
            <p>
              Schon registriert? <Link to="/login">Anmelden</Link>
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
}
function useUser(role) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  return user?.role === role ? user : user === undefined ? undefined : null;
}
function DJDashboard() {
  const user = useUser("dj"),
    [profile, setProfile] = useState(null),
    [requests, setRequests] = useState([]),
    [tab, setTab] = useState("requests"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [offer, setOffer] = useState({});
  const nav = useNavigate();
  const refresh = () => {
    api("/dj/profile")
      .then(setProfile)
      .catch((e) => setError(e.message));
    api("/dj/inquiries")
      .then(setRequests)
      .catch((e) => setError(e.message));
  };
  useEffect(() => {
    if (user) refresh();
  }, [user]);
  if (user === undefined)
    return (
      <Layout>
        <section className="page-section container">Lade Dashboard …</section>
      </Layout>
    );
  if (!user)
    return (
      <Layout>
        <section className="page-section container">
          <h1>Bitte anmelden</h1>
          <Link className="button" to="/login">
            Zur Anmeldung
          </Link>
        </section>
      </Layout>
    );
  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/dj/profile", { method: "PUT", body: profile });
      setNotice("Profil gespeichert. Es wartet auf erneute Freigabe.");
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function respond(id, status) {
    setBusy(true);
    setError("");
    try {
      await api(`/dj/inquiries/${id}/respond`, {
        method: "POST",
        body: { status, ...(status === "sent" ? offer[id] : {}) },
      });
      setNotice(status === "sent" ? "Angebot gesendet." : "Anfrage abgelehnt.");
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function imageUpload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await api("/dj/image", { method: "POST", body: { data } });
      update("image_url", r.url);
      setNotice("Bild geladen. Bitte Profil speichern.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout>
      <section className="page-section">
        <div className="container">
          <div className="dashboard-head">
            <div>
              <div className="kicker">DJ STUDIO</div>
              <h1>
                Hallo, {profile?.stage_name || "DJ"}
                <span>.</span>
              </h1>
              <p>
                Dein Ort für passende Anfragen und dein öffentliches Profil.
              </p>
            </div>
            <button
              className="button-ghost"
              onClick={async () => {
                await api("/auth/logout", { method: "POST" });
                nav("/");
                location.reload();
              }}
            >
              Abmelden
            </button>
          </div>
          <div className="tabs">
            <button
              className={tab === "requests" ? "active" : ""}
              onClick={() => setTab("requests")}
            >
              Anfragen <span>{requests.length}</span>
            </button>
            <button
              className={tab === "profile" ? "active" : ""}
              onClick={() => setTab("profile")}
            >
              Mein Profil
            </button>
          </div>
          {error && <div className="alert">{error}</div>}
          {notice && <div className="success">{notice}</div>}
          {tab === "requests" ? (
            <div className="dashboard-list">
              {requests.length ? (
                requests.map((r) => (
                  <article className="card request-item" key={r.id}>
                    <div className="request-item-head">
                      <div>
                        <span className="badge">{r.event_type}</span>
                        <h2>
                          {r.city} ·{" "}
                          {new Date(
                            r.event_date + "T12:00:00",
                          ).toLocaleDateString("de-DE")}
                        </h2>
                      </div>
                      <span className="status">
                        {r.response_status === "sent"
                          ? "Angebot gesendet"
                          : r.response_status === "declined"
                            ? "Abgelehnt"
                            : "Offen"}
                      </span>
                    </div>
                    <div className="request-facts">
                      <span>
                        <Icon name="music" size={17} />
                        {r.genres.join(", ")}
                      </span>
                      <span>
                        <Icon name="pin" size={17} />
                        {r.city}
                      </span>
                      <span>
                        <Icon name="calendar" size={17} />
                        {r.guests ? `${r.guests} Gäste` : r.event_date}
                      </span>
                    </div>
                    <p>{r.wishes || "Keine besonderen Wünsche angegeben."}</p>
                    <div className="match-reasons inline">
                      <strong>Passend, weil:</strong>
                      {r.reasons.map((x) => (
                        <span key={x}>
                          <Icon name="check" size={14} />
                          {x}
                        </span>
                      ))}
                    </div>
                    {!r.response_status && (
                      <div className="offer-form">
                        <div className="form-row">
                          <Field label="Dein Preis (€)">
                            <input
                              type="number"
                              min="1"
                              value={offer[r.id]?.price || ""}
                              onChange={(e) =>
                                setOffer({
                                  ...offer,
                                  [r.id]: {
                                    ...offer[r.id],
                                    price: e.target.value,
                                  },
                                })
                              }
                            />
                          </Field>
                        </div>
                        <Field label="Leistungsumfang">
                          <textarea
                            rows="2"
                            value={offer[r.id]?.scope || ""}
                            onChange={(e) =>
                              setOffer({
                                ...offer,
                                [r.id]: {
                                  ...offer[r.id],
                                  scope: e.target.value,
                                },
                              })
                            }
                            placeholder="Was ist im Preis enthalten?"
                          />
                        </Field>
                        <Field label="Persönliche Nachricht">
                          <textarea
                            rows="2"
                            value={offer[r.id]?.message || ""}
                            onChange={(e) =>
                              setOffer({
                                ...offer,
                                [r.id]: {
                                  ...offer[r.id],
                                  message: e.target.value,
                                },
                              })
                            }
                            placeholder="Stell dich und deine Idee kurz vor."
                          />
                        </Field>
                        <div className="form-actions">
                          <button
                            disabled={busy}
                            className="button-ghost"
                            onClick={() => respond(r.id, "declined")}
                          >
                            Ablehnen
                          </button>
                          <button
                            disabled={busy}
                            className="button"
                            onClick={() => respond(r.id, "sent")}
                          >
                            Angebot senden <Icon name="arrow" size={17} />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="empty">
                  <Icon name="music" size={32} />
                  <h3>Noch keine passenden Anfragen.</h3>
                  <p>
                    Vervollständige dein Profil, damit passende Events hier
                    erscheinen können.
                  </p>
                </div>
              )}
            </div>
          ) : (
            profile && (
              <form className="card profile-form" onSubmit={save}>
                <div className="profile-status">
                  Profilstatus:{" "}
                  <strong>
                    {profile.status === "approved"
                      ? "Freigegeben"
                      : profile.status === "pending"
                        ? "Wartet auf Freigabe"
                        : "Nicht freigegeben"}
                  </strong>
                </div>
                <div className="form-row">
                  <Field label="Künstlername *">
                    <input
                      required
                      value={profile.stage_name || ""}
                      onChange={(e) => update("stage_name", e.target.value)}
                    />
                  </Field>
                  <Field label="Profilbild">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => imageUpload(e.target.files[0])}
                    />
                  </Field>
                </div>
                {profile.image_url && (
                  <img
                    className="image-preview"
                    src={profile.image_url}
                    alt="Profilvorschau"
                  />
                )}
                <Field label="Beschreibung *">
                  <textarea
                    required
                    minLength="20"
                    rows="4"
                    value={profile.bio || ""}
                    onChange={(e) => update("bio", e.target.value)}
                  />
                </Field>
                <Field label="Musikrichtungen *">
                  <GenrePicker
                    value={profile.genres || []}
                    onChange={(v) => update("genres", v)}
                  />
                </Field>
                <Field label="Eventarten *">
                  <div className="chips">
                    {eventTypes.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={
                          "chip " +
                          (profile.events?.includes(t) ? "selected" : "")
                        }
                        onClick={() =>
                          update(
                            "events",
                            profile.events?.includes(t)
                              ? profile.events.filter((x) => x !== t)
                              : [...(profile.events || []), t],
                          )
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="form-row">
                  <Field label="Einsatzort *">
                    <input
                      required
                      value={profile.city || ""}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </Field>
                  <Field label="Radius (km)">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={profile.radius ?? 50}
                      onChange={(e) => update("radius", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="form-row">
                  <Field label="Preisorientierung ab (€)">
                    <input
                      type="number"
                      min="0"
                      value={profile.price_from ?? 0}
                      onChange={(e) => update("price_from", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Belegte Termine"
                    hint="Kommagetrennt als JJJJ-MM-TT"
                  >
                    <input
                      value={(profile.availability || []).join(", ")}
                      onChange={(e) =>
                        update(
                          "availability",
                          e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </Field>
                </div>
                <Field label="Ausstattung">
                  <textarea
                    rows="3"
                    value={profile.equipment || ""}
                    onChange={(e) => update("equipment", e.target.value)}
                  />
                </Field>
                <Field label="Referenzen">
                  <textarea
                    rows="3"
                    value={profile.references_text || ""}
                    onChange={(e) => update("references_text", e.target.value)}
                  />
                </Field>
                <button className="button" disabled={busy}>
                  Profil speichern <Icon name="arrow" />
                </button>
              </form>
            )
          )}
        </div>
      </section>
    </Layout>
  );
}
function Admin() {
  const user = useUser("admin"),
    [data, setData] = useState(null),
    [tab, setTab] = useState("profiles"),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(null);
  const nav = useNavigate();
  const refresh = () =>
    api("/admin/overview")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    if (user) refresh();
  }, [user]);
  async function change(type, id, status) {
    try {
      await api(`/admin/${type}/${id}`, { method: "PATCH", body: { status } });
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  async function showMatches(id) {
    setSelected({ id, matches: await api(`/admin/inquiries/${id}/matches`) });
  }
  if (user === undefined)
    return (
      <Layout>
        <section className="page-section container">
          Lade Admin-Bereich …
        </section>
      </Layout>
    );
  if (!user)
    return (
      <Layout>
        <section className="page-section container">
          <h1>Admin-Anmeldung erforderlich</h1>
          <Link className="button" to="/login">
            Anmelden
          </Link>
        </section>
      </Layout>
    );
  return (
    <Layout>
      <section className="page-section">
        <div className="container">
          <div className="dashboard-head">
            <div>
              <div className="kicker">ADMINISTRATION</div>
              <h1>
                Plattform <span>im Blick.</span>
              </h1>
              <p>
                Profile prüfen, Anfragen verwalten und Aktivitäten
                nachvollziehen.
              </p>
            </div>
            <button
              className="button-ghost"
              onClick={async () => {
                await api("/auth/logout", { method: "POST" });
                nav("/");
                location.reload();
              }}
            >
              Abmelden
            </button>
          </div>
          <div className="tabs">
            {[
              ["profiles", "Profile"],
              ["inquiries", "Anfragen"],
              ["offers", "Angebote"],
              ["notifications", "Benachrichtigungen"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                {label} <span>{data?.[key]?.length || 0}</span>
              </button>
            ))}
          </div>
          {error && <div className="alert">{error}</div>}
          {!data ? (
            <p>Lade Daten …</p>
          ) : (
            <div className="admin-list">
              {tab === "profiles" &&
                data.profiles.map((p) => (
                  <article className="card admin-item" key={p.id}>
                    <div>
                      <span className="badge">{p.status}</span>
                      <h3>{p.stage_name}</h3>
                      <p>
                        {p.email} · {p.city || "Kein Ort"} ·{" "}
                        {p.genres.join(", ") || "Keine Genres"}
                      </p>
                      <p>{p.bio}</p>
                      <small>
                        Ausstattung: {p.equipment || "–"} · Referenzen:{" "}
                        {p.references_text || "–"}
                      </small>
                    </div>
                    <div className="admin-actions">
                      <button
                        onClick={() => change("profiles", p.id, "approved")}
                      >
                        Freigeben
                      </button>
                      <button
                        onClick={() => change("profiles", p.id, "rejected")}
                      >
                        Ablehnen
                      </button>
                    </div>
                  </article>
                ))}
              {tab === "inquiries" &&
                data.inquiries.map((i) => (
                  <article className="card admin-item" key={i.id}>
                    <div>
                      <span className="badge">{i.status}</span>
                      <h3>
                        #{i.id} · {i.event_type} in {i.city}
                      </h3>
                      <p>
                        {i.name} · {i.email} · {i.event_date}
                      </p>
                      <p>
                        {i.genres.join(", ")} · {i.matches} Zuordnungen
                      </p>
                      {selected?.id === i.id && (
                        <div className="match-reasons">
                          <strong>Zuordnung</strong>
                          {selected.matches.map((m) => (
                            <span key={m.dj_id}>
                              {m.stage_name}: {m.reasons.join(" · ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="admin-actions">
                      <button onClick={() => showMatches(i.id)}>
                        Zuordnung ansehen
                      </button>
                      <button onClick={() => change("inquiries", i.id, "spam")}>
                        Spam
                      </button>
                      <button onClick={() => change("inquiries", i.id, "open")}>
                        Öffnen
                      </button>
                      <button
                        onClick={() => change("inquiries", i.id, "closed")}
                      >
                        Schließen
                      </button>
                    </div>
                  </article>
                ))}
              {tab === "offers" &&
                data.offers.map((o) => (
                  <article className="card admin-item" key={o.id}>
                    <div>
                      <span className="badge">{o.status}</span>
                      <h3>
                        {o.stage_name} · Anfrage #{o.inquiry_id}
                      </h3>
                      <p>
                        {o.price} € · {o.scope}
                      </p>
                      <p>{o.message}</p>
                    </div>
                  </article>
                ))}
              {tab === "notifications" &&
                data.notifications.map((n) => (
                  <article className="card admin-item" key={n.id}>
                    <div>
                      <span className="badge">{n.status}</span>
                      <h3>{n.subject}</h3>
                      <p>
                        {n.recipient} · {n.created_at}
                      </p>
                      <small>{n.body}</small>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
function Legal({ type }) {
  const imprint = type === "impressum";
  return (
    <Layout>
      <section className="page-section">
        <div className="container narrow legal">
          <div className="kicker">RECHTLICHES · PLATZHALTER</div>
          <h1>{imprint ? "Impressum" : "Datenschutzerklärung"}</h1>
          <div className="alert">
            Diese Seite ist ein Platzhalter. Vor einem öffentlichen Start müssen
            echte Betreiberangaben und rechtlich geprüfte Texte eingesetzt
            werden.
          </div>
          {imprint ? (
            <>
              <h2>Angaben zum Betreiber</h2>
              <p>
                [Name/Firma, Rechtsform, ladungsfähige Anschrift,
                vertretungsberechtigte Person]
              </p>
              <h2>Kontakt</h2>
              <p>[E-Mail-Adresse, Telefonnummer]</p>
              <h2>Weitere Angaben</h2>
              <p>
                [Register, Umsatzsteuer-ID, verantwortliche Person, soweit
                einschlägig]
              </p>
            </>
          ) : (
            <>
              <h2>Verantwortliche Stelle</h2>
              <p>[Name und Kontaktdaten des Betreibers]</p>
              <h2>Verarbeitete Daten</h2>
              <p>
                Für DJ-Konten und Anfragen werden Kontaktangaben, Eventdaten,
                Profile und Angebote gespeichert. Passende DJs erhalten die für
                ein Angebot erforderlichen Angaben. Der private Zugangslink
                ermöglicht Veranstaltern den Abruf ihrer Anfrage und Angebote.
              </p>
              <h2>Technische Speicherung</h2>
              <p>
                Eine technisch erforderliche Sitzung wird für angemeldete DJs
                und Administratoren als HTTP-only-Cookie gespeichert.
                Bilddateien und Benachrichtigungsereignisse werden auf dem
                Server gespeichert.
              </p>
              <h2>Rechte und Aufbewahrung</h2>
              <p>
                [Rechtsgrundlagen, Speicherdauer, Betroffenenrechte, Kontakt für
                Auskunft/Löschung sowie externe Dienstleister ergänzen und
                rechtlich prüfen.]
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anfrage" element={<Request />} />
        <Route path="/anfrage/:token" element={<Inquiry />} />
        <Route path="/dj" element={<DJLanding />} />
        <Route path="/dj/dashboard" element={<DJDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/impressum" element={<Legal type="impressum" />} />
        <Route path="/datenschutz" element={<Legal type="datenschutz" />} />
        <Route
          path="*"
          element={
            <Layout>
              <section className="page-section container">
                <h1>Seite nicht gefunden</h1>
                <Link to="/">Zur Startseite</Link>
              </section>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

document.documentElement.style.setProperty("--brand-navy", brand.colors.navy);
document.documentElement.style.setProperty(
  "--brand-violet",
  brand.colors.violet,
);
document.documentElement.style.setProperty("--brand-coral", brand.colors.coral);
createRoot(document.getElementById("root")).render(<App />);
