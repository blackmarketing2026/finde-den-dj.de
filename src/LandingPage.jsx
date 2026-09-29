import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventTypes, genres, copy } from "./config";
import "./landing.css";

const Arrow = ({ diagonal = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"} />
  </svg>
);
const Check = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    aria-hidden="true"
  >
    <path d="m4 10 4 4 8-8" />
  </svg>
);

export default function LandingPage({ draft, setDraft }) {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const leadRef = useRef(null);
  const [dock, setDock] = useState(false);
  const [paused, setPaused] = useState(false);
  const [picked, setPicked] = useState(null);
  const update = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) =>
        setDock(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    if (leadRef.current) observer.observe(leadRef.current);
    return () => observer.disconnect();
  }, []);
  const onPointer = (e) => {
    if (
      !window.matchMedia(
        "(hover: hover) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const box = e.currentTarget.getBoundingClientRect();
    stageRef.current.style.setProperty(
      "--pointer-x",
      `${((e.clientX - box.left) / box.width - 0.5) * 14}px`,
    );
    stageRef.current.style.setProperty(
      "--pointer-y",
      `${((e.clientY - box.top) / box.height - 0.5) * 10}px`,
    );
  };
  const chooseGenre = (genre) => {
    update(
      "genres",
      draft.genres.includes(genre)
        ? draft.genres.filter((g) => g !== genre)
        : [...draft.genres, genre],
    );
    setPicked(genre);
  };
  return (
    <div className={"next-home" + (paused ? " motion-paused" : "")}>
      <section
        className="event-stage"
        ref={stageRef}
        onPointerMove={onPointer}
        aria-labelledby="stage-title"
      >
        <img
          className="stage-photo"
          src="/images/dj-session.webp"
          alt=""
          fetchPriority="high"
        />
        <div className="stage-shade" />
        <div className="stage-grain" aria-hidden="true" />
        <div className="container stage-inner">
          <div className="stage-eyebrow">
            <span className="status-dot" /> {copy.home.eyebrow}
          </div>
          <h1 id="stage-title">
            <span>DEIN EVENT.</span>
            <span>DEIN SOUND.</span>
            <span className="title-outline">
              DEIN DJ.<i>↗</i>
            </span>
          </h1>
          <div className="stage-bottom">
            <p>{copy.home.subtitle}</p>
            <a
              href="#event-brief"
              className="round-arrow"
              aria-label="Zur DJ-Anfrage"
            >
              <Arrow />
            </a>
          </div>
          <div className="stage-stamp" aria-hidden="true">
            <span>GUTE MUSIK.</span>
            <b>
              GUTE
              <br />
              LEUTE.
            </b>
            <span>GUTE NACHT.</span>
          </div>
        </div>
        <div className="stage-meta container">
          <span>DEIN ABEND BEGINNT HIER</span>
          <button
            type="button"
            className="motion-toggle"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "▶ Animationen starten" : "Ⅱ Animationen pausieren"}
          </button>
        </div>
      </section>

      <section
        className="lead-zone"
        id="event-brief"
        ref={leadRef}
        aria-labelledby="lead-heading"
      >
        <div className="container">
          <div className="lead-heading">
            <h2 id="lead-heading">
              Einmal anfragen. <span>Mehrere DJs erreichen.</span>
            </h2>
            <span className="lead-note">KOSTENLOS & UNVERBINDLICH</span>
          </div>
          <form
            className="lead-strip"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/anfrage");
            }}
          >
            <label>
              <span>01 / DEIN EVENT</span>
              <select
                required
                value={draft.event_type}
                onChange={(e) => update("event_type", e.target.value)}
              >
                <option value="">Was feierst du?</option>
                {eventTypes.map((event) => (
                  <option key={event}>{event}</option>
                ))}
              </select>
            </label>
            <label>
              <span>02 / DEIN ORT</span>
              <input
                required
                placeholder="Ort oder Postleitzahl"
                autoComplete="postal-code"
                value={draft.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </label>
            <label>
              <span>03 / DEIN DATUM</span>
              <input
                required
                aria-label="Datum deines Events"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={draft.event_date}
                onChange={(e) => update("event_date", e.target.value)}
              />
            </label>
            <button className="acid-button" type="submit">
              DJs anfragen <Arrow />
            </button>
          </form>
          <div className="lead-reassurance">
            <span>
              <Check /> Eine Anfrage für passende DJs
            </span>
            <span>
              <Check /> Persönliche Angebote erhalten
            </span>
            <span>
              <Check /> Du entscheidest in Ruhe
            </span>
          </div>
        </div>
      </section>

      <div className="genre-ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((n) => (
            <span key={n}>
              HOCHZEIT <i>✳</i> GEBURTSTAG <i>✳</i> FIRMENFEIER <i>✳</i> DEIN
              MOMENT <i>✳</i>
            </span>
          ))}
        </div>
      </div>

      <section className="reach-section" id="ablauf">
        <div className="container reach-top">
          <div data-reveal>
            <div className="editorial-label">
              01 — EINE ANFRAGE. EIN GANZES NETZWERK.
            </div>
            <h2>
              MEHR DJS.
              <br />
              <span>MEHR MÖGLICH.</span>
            </h2>
            <p>
              Du beschreibst deinen Abend. Wir leiten deine Anfrage an die
              passenden DJs weiter. Jeder DJ kann dir ein eigenes Angebot machen
              — mit Preis, Leistungen und persönlicher Nachricht.
            </p>
          </div>
          <div className="dispatch" data-reveal>
            <div className="dispatch-label">
              SO VERTEILT SICH DEINE ANFRAGE <span>↗</span>
            </div>
            <div className="dispatch-source">
              <span className="dispatch-icon">↗</span>
              <div>
                <strong>Dein Event</strong>
                <small>Ein Briefing. Deine Wünsche.</small>
              </div>
            </div>
            <svg
              className="dispatch-lines"
              viewBox="0 0 500 90"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M250 0V30H80V90M250 30V90M250 30H420V90"
                className="wire-base"
              />
              <path
                d="M250 0V30H80V90M250 30V90M250 30H420V90"
                className="wire-signal"
              />
            </svg>
            <div className="dispatch-targets">
              {["Musikstil", "Eventerfahrung", "Einsatzgebiet"].map(
                (label, i) => (
                  <div
                    className="dispatch-target"
                    style={{ "--node": i }}
                    key={label}
                  >
                    <div className="headphone-icon" aria-hidden="true">
                      ♫
                    </div>
                    <strong>Passender DJ</strong>
                    <small>{label}</small>
                    <span>Individuelles Angebot</span>
                  </div>
                ),
              )}
            </div>
            <p className="dispatch-caption">
              Beispielhafter Ablauf. Wie viele Angebote du erhältst, hängt von
              passenden DJs und ihren Rückmeldungen ab.
            </p>
          </div>
        </div>
        <div className="container editorial-steps">
          {[
            [
              "01",
              "Dein Briefing.",
              "Anlass, Musik, Ort und Termin. Einmal ausfüllen und deine Wünsche angeben.",
            ],
            [
              "02",
              "Mehrere Möglichkeiten.",
              "Passende DJs bekommen deine Anfrage und können individuell antworten.",
            ],
            [
              "03",
              "Deine Entscheidung.",
              "Eingehende Angebote vergleichen. Den DJ auswählen, der sich richtig anfühlt.",
            ],
          ].map(([n, title, text]) => (
            <div data-reveal key={n}>
              <span>/{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sound-section" id="sound">
        <div className="container">
          <div className="sound-heading" data-reveal>
            <div>
              <div className="editorial-label">
                02 — GESCHMACK KANN MAN MATCHEN.
              </div>
              <h2>
                WIE KLINGT
                <br />
                DEIN ABEND<span>?</span>
              </h2>
            </div>
            <p>
              Von „das ist unser Song“ bis „noch einen letzten Track“: Wähle
              deinen Mix. Mehrfachauswahl erwünscht.
            </p>
          </div>
          <div className="sound-console">
            <div
              className="sound-choices"
              role="group"
              aria-label="Musikrichtungen auswählen"
            >
              {genres.map((g) => (
                <button
                  type="button"
                  key={g}
                  className={draft.genres.includes(g) ? "active" : ""}
                  aria-pressed={draft.genres.includes(g)}
                  onClick={() => chooseGenre(g)}
                >
                  {g}
                  <span>{draft.genres.includes(g) ? "−" : "+"}</span>
                </button>
              ))}
            </div>
            <div className="sound-meter" aria-hidden="true">
              <div className="meter-bars">
                {Array.from({ length: 26 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      "--h": `${22 + ((i * 17 + 13) % 73)}%`,
                      "--delay": `${i * -93}ms`,
                      "--speed": `${0.65 + (i % 5) * 0.17}s`,
                    }}
                  />
                ))}
              </div>
              <div className="meter-caption">
                <span>DEIN MIX</span>
                <b key={picked}>
                  {draft.genres.length
                    ? draft.genres.length + " STYLES AUSGEWÄHLT"
                    : "DU GIBST DEN TON AN"}
                </b>
              </div>
            </div>
          </div>
          <div className="sound-footer">
            <span aria-live="polite">
              {draft.genres.length
                ? draft.genres.join(" / ")
                : "Dein Musikgeschmack wird in die Anfrage übernommen."}
            </span>
            <Link className="text-link" to="/anfrage">
              Mit diesem Sound weiter <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container trust-grid">
          <div data-reveal>
            <div className="editorial-label">
              03 — KLARE ANSAGEN. GUTES GEFÜHL.
            </div>
            <h2>
              VERTRAUEN
              <br />
              GEHÖRT
              <br />
              <span>ZUM GUTEN TON.</span>
            </h2>
            <a href="#event-brief" className="text-link">
              Dein Event anfragen <Arrow />
            </a>
          </div>
          <div className="trust-points">
            {[
              [
                "Kein Suchmarathon.",
                "Eine Anfrage erreicht die DJs, deren Profil zu Musik, Anlass, Ort und Termin passt. Du musst dein Event nicht jedem einzeln erklären.",
              ],
              [
                "Angebote mit Substanz.",
                "Preis, Leistungsumfang und persönliche Nachricht stehen nebeneinander. Du siehst ausschließlich Antworten, die DJs tatsächlich abgegeben haben.",
              ],
              [
                "Deine Daten. Dein Okay.",
                "Vor dem Absenden siehst du deine Angaben und stimmst der Weitergabe an passende DJs zu. Deine Anfrage ist über einen privaten Link abrufbar.",
              ],
              [
                "Dein Event. Deine Wahl.",
                "Die Anfrage ist kostenlos und unverbindlich. Es entsteht keine automatische Buchung. Du entscheidest, mit wem du deinen Abend planst.",
              ],
            ].map(([title, text], i) => (
              <article data-reveal key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <Check />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="new-faq">
        <div className="container new-faq-grid">
          <div>
            <div className="editorial-label">NOCH EIN FRAGEZEICHEN?</div>
            <h2>KURZ GEKLÄRT.</h2>
          </div>
          <div>
            {copy.home.faq.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-call">
        <div className="container">
          <div className="editorial-label">
            DEIN NÄCHSTER GUTER ABEND BEGINNT MIT EINER ANFRAGE.
          </div>
          <div className="final-call-row">
            <h2>
              DIE TANZFLÄCHE
              <br />
              <span>WARTET.</span>
            </h2>
            <a
              href="#event-brief"
              className="final-arrow"
              aria-label="Jetzt DJs anfragen"
            >
              <Arrow diagonal />
            </a>
          </div>
          <div className="final-call-foot">
            <span>Ein Briefing. Passende DJs. Individuelle Angebote.</span>
            <a href="#event-brief">Jetzt kostenlos anfragen ↗</a>
          </div>
        </div>
      </section>
      <div className="dj-recruit container">
        <span>DU BIST DER MENSCH HINTER DEM PULT?</span>
        <Link to="/dj">
          Werde Teil von DJKompass <Arrow />
        </Link>
      </div>
      <div
        className={"mobile-lead-dock " + (dock ? "shown" : "")}
        aria-hidden={!dock}
      >
        <span>
          Einmal anfragen.
          <br />
          <strong>Mehrere DJs erreichen.</strong>
        </span>
        <a href="#event-brief" tabIndex={dock ? 0 : -1}>
          DJs anfragen <Arrow />
        </a>
      </div>
    </div>
  );
}
