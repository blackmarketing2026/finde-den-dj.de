import React, { useEffect, useState, useRef } from "react";
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
  useLocation,
} from "react-router-dom";
import { brand, copy, eventTypes, genres } from "./config";
import "./style.css";
import "./theme.css";
import LandingPage from "./LandingPage";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";

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
  phone: "",
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
          <img src="/logos/vinyl-compass.svg" alt="" />
          <span>{brand.name}</span>
        </Link>
        <nav aria-label="Hauptnavigation">
          <a href="/#ablauf">So funktioniert's</a>
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
            DJs anfragen <Icon name="arrow" size={16} />
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
            <img src="/logos/vinyl-compass.svg" alt="" />
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
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !("IntersectionObserver" in window)) return;
    const elements = mainRef.current.querySelectorAll(
      "[data-reveal], .section-top, .step, .benefit-grid, .banner-inner, .faq-grid",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("reveal");
        observer.observe(element);
      }
    });
    const showAll = () => {
      if (media.matches)
        elements.forEach((element) => element.classList.add("is-visible"));
    };
    media.addEventListener("change", showAll);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", showAll);
    };
  }, [pathname]);
  return (
    <>
      <Header />
      <main ref={mainRef}>{children}</main>
      <Footer />
    </>
  );
}
function Home() {
  const [draft, setDraft] = useDraft();
  return (
    <Layout>
      <LandingPage draft={draft} setDraft={setDraft} />
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
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false);
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
      if (r.token) nav("/anfrage/" + r.token);
      else {
        setSent(true);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <Layout>
        <section className="page-section">
          <div className="container narrow">
            <div className="page-heading">
              <div className="kicker">ANFRAGE GESENDET</div>
              <h1>
                Danke, {d.name}! <span>Wir melden uns bei dir.</span>
              </h1>
              <p>
                Deine Anfrage ist bei uns eingegangen. Eine Bestätigung haben
                wir an {d.email} geschickt.
              </p>
            </div>
            <Link className="back-link" to="/">
              ← Zur Startseite
            </Link>
          </div>
        </section>
      </Layout>
    );
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
              Ein Briefing. <span>Mehrere DJs anfragen.</span>
            </h1>
            <p>
              Erzähle uns von deinem Event. Passende DJs erhalten deine Anfrage
              und können dir individuelle Angebote schicken.
            </p>
          </div>
          <div className="progress">
            <div className={step >= 1 ? "active" : ""}>
              1 <span>Event</span>
            </div>
            <div className={step >= 2 ? "active" : ""}>
              2 <span>Kontakt</span>
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
                <h2>Wohin sollen deine Angebote?</h2>
                <p className="request-contact-note">
                  Du bekommst einen privaten Link zu deiner Anfrage und den
                  eingehenden Angeboten.
                </p>
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
                <Field label="Telefon / WhatsApp (optional)">
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="z. B. 0171 1234567"
                    value={d.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <details className="optional-details">
                  <summary>Weitere Eventdetails (optional)</summary>

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
                </details>
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
                    [
                      "Kontakt",
                      [d.name, d.email, d.phone].filter(Boolean).join(" · "),
                    ],
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
  const mail = (
    <a href="mailto:info@electroart-events.de">info@electroart-events.de</a>
  );
  return (
    <Layout>
      <section className="page-section">
        <div className="container narrow legal">
          <div className="kicker">RECHTLICHES</div>
          <h1>{imprint ? "Impressum" : "Datenschutzerklärung"}</h1>
          {imprint ? (
            <>
              <h2>Angaben gemäß § 5 DDG</h2>
              <address>
                Jens Naumann
                <br />
                ElectroArt – DJ &amp; Event-Service
                <br />
                Heldmanstr. 35
                <br />
                32756 Detmold
              </address>
              <h2>Kontakt</h2>
              <p>
                Telefon: 015158778666
                <br />
                Telefax: 052314524984
                <br />
                E-Mail: {mail}
              </p>
              <h2>Umsatzsteuer-Identifikationsnummer</h2>
              <p>[PLATZHALTER – USt-IdNr. einfügen, falls vorhanden]</p>
            </>
          ) : (
            <>
              <h2>1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <address>
                Jens Naumann
                <br />
                ElectroArt – DJ &amp; Event-Service
                <br />
                Heldmanstr. 35
                <br />
                32756 Detmold
                <br />
                Telefon: 015158778666
                <br />
                E-Mail: {mail}
              </address>
              <h2>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
              <p>
                Wir verarbeiten personenbezogene Daten unserer Nutzer
                grundsätzlich nur, soweit dies zur Bereitstellung einer
                funktionsfähigen Website sowie unserer Inhalte und Leistungen
                erforderlich ist oder eine Einwilligung der Nutzer vorliegt.
                Rechtsgrundlage ist jeweils Art. 6 Abs. 1 DSGVO.
              </p>
              <h2>3. Hosting</h2>
              <p>
                Diese Website wird bei einem externen Dienstleister gehostet:
              </p>
              <address>
                ALL-INKL.COM – Neue Medien Münnich, Inh. René Münnich
                <br />
                Hauptstraße 68
                <br />
                02742 Friedersdorf
              </address>
              <p>
                Personenbezogene Daten, die im Rahmen der Nutzung dieser Website
                erfasst werden, werden auf den Servern des Hosters gespeichert.
                Mit ALL-INKL.COM besteht ein Vertrag zur Auftragsverarbeitung
                (AVV) gemäß Art. 28 DSGVO, wonach der Hoster personenbezogene
                Daten nur nach unserer Weisung und zweckgebunden verarbeitet.
              </p>
              <h2>
                4. Quellcode-Verwaltung und Bereitstellung (GitHub, Vercel)
              </h2>
              <p>
                Der Quellcode dieser Website wird in einem privaten Repository
                bei GitHub verwaltet und automatisiert über Vercel
                bereitgestellt und ausgeliefert. Dabei können technische
                Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt des Aufrufs)
                verarbeitet werden.
              </p>
              <address>
                GitHub, Inc.
                <br />
                88 Colin P. Kelly Jr. St.
                <br />
                San Francisco, CA 94107
                <br />
                USA
              </address>
              <address>
                Vercel Inc.
                <br />
                340 S Lemon Ave #4133
                <br />
                Walnut, CA 91789
                <br />
                USA
              </address>
              <p>
                Beide Anbieter verarbeiten Daten teilweise in den USA. Die
                Verarbeitung erfolgt auf Grundlage von Standardvertragsklauseln
                der EU-Kommission sowie geschlossener
                Auftragsverarbeitungsverträge.
              </p>
              <h2>5. Server-Log-Dateien</h2>
              <p>
                Der Provider erhebt und speichert automatisch Informationen in
                sogenannten Server-Log-Dateien, die Ihr Browser automatisch an
                uns übermittelt. Dies sind: Browsertyp und -version, verwendetes
                Betriebssystem, Referrer-URL, Hostname des zugreifenden
                Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <h2>6. Cookies und Cookie-Banner</h2>
              <p>
                Diese Website verwendet Cookies. Beim ersten Besuch werden Sie
                über ein Cookie-Banner um Ihre Einwilligung zu nicht technisch
                notwendigen Cookies gebeten. Wir unterscheiden folgende
                Kategorien:
              </p>
              <ul>
                <li>
                  <strong>Notwendig:</strong> für den Betrieb der Website
                  zwingend erforderlich, kein Einwilligungserfordernis (Art. 6
                  Abs. 1 lit. f DSGVO).
                </li>
                <li>
                  <strong>Statistik:</strong> z. B. Google Analytics, Microsoft
                  Clarity – nur mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a
                  DSGVO).
                </li>
                <li>
                  <strong>Marketing:</strong> z. B. Meta-Pixel, Google Ads
                  Remarketing – nur mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a
                  DSGVO).
                </li>
              </ul>
              <p>
                Sie können Ihre Einwilligung jederzeit über die
                Cookie-Einstellungen im Banner anpassen oder widerrufen. Details
                zum Widerruf finden Sie in Abschnitt 11 dieser Erklärung.
              </p>
              <h2>7. Kontaktformular</h2>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen,
                werden Ihre Angaben aus dem Formular (u. a. Name, Telefonnummer,
                E-Mail-Adresse, Eventdaten, Nachricht) inklusive der von Ihnen
                dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und
                für den Fall von Anschlussfragen bei uns gespeichert und per
                E-Mail an uns weitergeleitet. Diese Daten geben wir nicht ohne
                Ihre Einwilligung weiter.
              </p>
              <p>
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6
                Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines
                Vertrags zusammenhängt oder zur Durchführung vorvertraglicher
                Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die
                Verarbeitung auf unserem berechtigten Interesse an der
                effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6
                Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1
                lit. a DSGVO), sofern diese abgefragt wurde.
              </p>
              <p>
                Ein Versand von Dateien oder Liedwunsch-Anhängen über das
                Formular ist derzeit nicht vorgesehen. Google Forms oder
                vergleichbare Drittanbieter-Formulare setzen wir nicht ein.
              </p>
              <h2>8. Google Tag Manager</h2>
              <p>
                Wir setzen den Google Tag Manager (Container-ID GTM-TJC9GX4D)
                der Google Ireland Limited, Gordon House, Barrow Street, Dublin
                4, Irland ein. Der Tag Manager ist ein Tool, mit dessen Hilfe
                wir Tracking- oder Statistik-Tools und andere Technologien auf
                unserer Website einbinden können. Der Google Tag Manager selbst
                erstellt keine Nutzerprofile, speichert keine Cookies und nimmt
                keine eigenständigen Analysen vor. Er sorgt lediglich für die
                Auslösung der über ihn eingebundenen Dienste, die ihrerseits
                personenbezogene Daten erfassen können.
              </p>
              <p>
                Technisch wird der Tag-Manager-Code erst nachgeladen, wenn Sie
                im Cookie-Banner der Kategorie „Statistik“ zustimmen (Opt-in).
                Ohne Ihre Einwilligung findet keine Verbindung zu Google-Servern
                statt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO.
              </p>
              <h2>9. Google Analytics</h2>
              <p>
                Diese Website nutzt – vorbehaltlich Ihrer Einwilligung – Google
                Analytics, einen Webanalysedienst der Google Ireland Limited,
                Gordon House, Barrow Street, Dublin 4, Irland. Google Analytics
                verwendet Cookies bzw. vergleichbare Technologien, die eine
                Analyse der Benutzung unserer Website ermöglichen. Die dabei
                erzeugten Informationen werden an einen Server von Google
                übertragen und dort gespeichert, dies kann auch außerhalb der
                EU/des EWR erfolgen. Rechtsgrundlage ist Ihre Einwilligung nach
                Art. 6 Abs. 1 lit. a DSGVO. Weitere Informationen:{" "}
                <a
                  href="https://policies.google.com/privacy?hl=de"
                  target="_blank"
                  rel="noopener"
                >
                  policies.google.com/privacy
                </a>
                .
              </p>
              <h2>10. Google Ads Remarketing</h2>
              <p>
                Vorbehaltlich Ihrer Einwilligung nutzen wir die
                Remarketing-Funktion von Google Ads (Google Ireland Limited,
                Gordon House, Barrow Street, Dublin 4, Irland). Damit können
                Besuchern unserer Website interessenbezogene Werbeanzeigen auf
                anderen Websites innerhalb des Google-Werbenetzwerks
                eingeblendet werden. Hierzu speichert der Browser ein Cookie,
                das eine wiedererkennbare, pseudonyme ID enthält.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO.
              </p>
              <h2>11. Microsoft Clarity</h2>
              <p>
                Vorbehaltlich Ihrer Einwilligung setzen wir Microsoft Clarity
                ein, einen Dienst der Microsoft Ireland Operations Limited, One
                Microsoft Place, South County Business Park, Leopardstown,
                Dublin 18, D18 P521, Irland. Microsoft Clarity ermöglicht die
                Analyse des Nutzerverhaltens (z. B. Mausbewegungen, Klicks,
                Scrollverhalten) mittels Cookies. Rechtsgrundlage ist Art. 6
                Abs. 1 lit. a DSGVO. Weitere Informationen:{" "}
                <a
                  href="https://privacy.microsoft.com/de-de/privacystatement"
                  target="_blank"
                  rel="noopener"
                >
                  privacy.microsoft.com
                </a>
                .
              </p>
              <h2>12. Meta-Ads und Meta-Pixel</h2>
              <p>
                Vorbehaltlich Ihrer Einwilligung binden wir Technologien der
                Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand
                Canal Harbour, Dublin 2, Irland (u. a. Meta-Pixel) zur
                Erfolgsmessung und Steuerung von Werbeanzeigen auf Facebook und
                Instagram ein. Dabei können Nutzungsdaten erhoben und mit Ihrem
                Meta-Konto verknüpft werden, sofern Sie dort angemeldet sind.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Weitere
                Informationen:{" "}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener"
                >
                  facebook.com/privacy/policy
                </a>
                .
              </p>
              <h2>13. Speicherdauer (Laufzeit)</h2>
              <p>
                Personenbezogene Daten aus dem Kontaktformular werden gelöscht,
                sobald sie für die Erreichung des Zwecks ihrer Erhebung nicht
                mehr erforderlich sind, spätestens jedoch nach Abschluss der
                Kommunikation bzw. Durchführung des angefragten Events, sofern
                keine gesetzlichen Aufbewahrungspflichten (z. B. handels- oder
                steuerrechtliche Fristen) entgegenstehen. Statistik- und
                Marketing-Cookies bleiben je nach Anbieter für einen Zeitraum
                von wenigen Tagen bis zu 24 Monaten gespeichert oder bis Sie
                Ihre Einwilligung widerrufen; die konkrete Laufzeit einzelner
                Cookies wird im Cookie-Banner ausgewiesen. Server-Log-Dateien
                werden aus Sicherheitsgründen für max. 7 Tage vorgehalten und
                danach automatisiert gelöscht.
              </p>
              <h2>14. Widerruf Ihrer Einwilligung</h2>
              <p>
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer
                ausdrücklichen Einwilligung möglich (z. B. Statistik- und
                Marketing-Cookies). Sie können eine bereits erteilte
                Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
                Sie haben dazu zwei Möglichkeiten:
              </p>
              <ul>
                <li>
                  Über die Cookie-Einstellungen, die Sie jederzeit über den Link
                  „Cookie-Einstellungen“ im Footer dieser Website erneut
                  aufrufen und anpassen können.
                </li>
                <li>
                  Formlos per E-Mail an {mail} unter Angabe, welche Einwilligung
                  Sie widerrufen möchten.
                </li>
              </ul>
              <p>
                Die Rechtmäßigkeit der bis zum Widerruf erfolgten
                Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>
              <h2>15. Ihre Rechte als betroffene Person</h2>
              <p>
                Sie haben jederzeit das Recht auf unentgeltliche Auskunft über
                Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
                Empfänger sowie den Zweck der Datenverarbeitung (Art. 15 DSGVO)
                und ggf. ein Recht auf Berichtigung (Art. 16 DSGVO), Löschung
                (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO),
                Datenübertragbarkeit (Art. 20 DSGVO) sowie ein Widerspruchsrecht
                gegen die Verarbeitung (Art. 21 DSGVO). Bitte wenden Sie sich
                hierzu an die im Impressum bzw. in Abschnitt 1 genannte Adresse.
              </p>
              <h2>16. Beschwerderecht bei der Aufsichtsbehörde</h2>
              <p>
                Im Falle von Verstößen gegen die DSGVO steht Ihnen ein
                Beschwerderecht bei einer Aufsichtsbehörde zu, insbesondere in
                dem Mitgliedstaat Ihres gewöhnlichen Aufenthalts, Ihres
                Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.
                Zuständig für Detmold ist die Landesbeauftragte für Datenschutz
                und Informationsfreiheit Nordrhein-Westfalen.
              </p>
              <h2>17. SSL-/TLS-Verschlüsselung</h2>
              <p>
                Diese Website nutzt aus Sicherheitsgründen eine
                SSL-/TLS-Verschlüsselung für die Übertragung vertraulicher
                Inhalte. Eine verschlüsselte Verbindung erkennen Sie an dem
                vorangestellten Protokollkürzel „https://“ sowie am
                Schloss-Symbol in Ihrer Browserzeile.
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

document.documentElement.style.setProperty("--brand-ink", brand.colors.ink);
document.documentElement.style.setProperty(
  "--brand-accent",
  brand.colors.accent,
);
document.documentElement.style.setProperty("--brand-muted", brand.colors.muted);
createRoot(document.getElementById("root")).render(<App />);
