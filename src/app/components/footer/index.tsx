import React, { useEffect, useId, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Language, setLanguage } from "../../../i18n";
import { isValidEmail, subscribeToNewsletter } from "../../../lib/newsletter";
import "../../../css/footer.css";

// TODO: replace with your name and real profile links.
const CREDIT = {
  name: "[YOUR NAME]",
  github: "#",
  portfolio: "#",
};

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, inherit currentColor)                            */
/* ------------------------------------------------------------------ */

const svgProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

const strokeProps = {
  ...svgProps,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const SOCIALS = [
  {
    name: "Instagram",
    href: "#", // TODO: Instagram profile URL
    icon: (
      <svg {...strokeProps}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#", // TODO: TikTok profile URL
    icon: (
      <svg {...svgProps} fill="currentColor">
        <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7.3 7.3 0 0 1-3.8-1.2v6.2c0 3.6-2.6 6.2-6.1 6.2a6 6 0 0 1-6.1-6c0-3.6 3-6.3 6.9-5.9v3.2c-1.9-.4-3.6.8-3.6 2.7a2.8 2.8 0 0 0 2.9 2.8c1.6 0 2.8-1.1 2.8-3.2V3h3.1Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#", // TODO: YouTube channel URL
    icon: (
      <svg {...strokeProps}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10.2 9.2 4.6 2.8-4.6 2.8V9.2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "#", // TODO: Telegram channel URL
    icon: (
      <svg {...strokeProps}>
        <path d="M20.6 4.2 3.4 10.9c-.9.4-.9 1.1 0 1.4l4.3 1.4 1.7 5.2c.2.6.8.7 1.2.3l2.4-2.2 4.5 3.3c.6.4 1.3.1 1.4-.6l2.9-14.2c.2-1-.4-1.6-1.2-1.3Z" />
        <path d="m7.7 13.7 9.2-6" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type LinkGroup = { id: string; links: { key: string; to: string }[] };

// TODO: point "story" and "verify" at real pages once they exist.
const LINK_GROUPS: LinkGroup[] = [
  {
    id: "shop",
    links: [
      { key: "all", to: "/products" },
      { key: "newArrivals", to: "/products?order=createdAt" },
      { key: "retro", to: "/products?collection=RETRO" },
      { key: "teams", to: "/products" },
      { key: "sizeGuide", to: "/help" },
    ],
  },
  {
    id: "support",
    links: [
      { key: "shipping", to: "/help" },
      { key: "returns", to: "/help" },
      { key: "contact", to: "/help" },
    ],
  },
  {
    id: "about",
    links: [
      { key: "story", to: "/help" },
      { key: "verify", to: "/help" },
    ],
  },
];

const LANGUAGES: { lng: Language; label: string }[] = [
  { lng: "en", label: "EN" },
  { lng: "ko", label: "한국어" },
];

/* ------------------------------------------------------------------ */
/* Hooks / pieces                                                      */
/* ------------------------------------------------------------------ */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

type FormStatus = "idle" | "submitting" | "success";

function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const inputId = useId();
  const messageId = useId();
  const submitting = status === "submitting";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const value = email.trim();
    if (!value) return setError(t("footer.newsletter.errorEmpty"));
    if (!isValidEmail(value)) return setError(t("footer.newsletter.errorInvalid"));

    setError(null);
    setStatus("submitting");
    try {
      await subscribeToNewsletter(value);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("idle");
      setError(t("footer.newsletter.errorFailed"));
    }
  };

  return (
    <form className="jr-footer__form" onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className="jr-sr-only">
        {t("footer.newsletter.label")}
      </label>
      <div className="jr-footer__form-row">
        <input
          id={inputId}
          className="jr-footer__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("footer.newsletter.placeholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
            if (status === "success") setStatus("idle");
          }}
          disabled={submitting}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
        />
        <button type="submit" className="jr-footer__submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? t("footer.newsletter.submitting") : t("footer.newsletter.submit")}
        </button>
      </div>
      <p
        id={messageId}
        className={`jr-footer__form-message ${error ? "jr-footer__form-message--error" : ""}`}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {error ?? (status === "success" ? t("footer.newsletter.success") : "")}
      </p>
    </form>
  );
}

function LinkColumn({ group, collapsible }: { group: LinkGroup; collapsible: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const title = t(`footer.links.${group.id}.title`);

  return (
    <div className="jr-footer__col">
      <h2 className="jr-footer__col-title">
        {collapsible ? (
          <button
            type="button"
            className="jr-footer__col-toggle"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((o) => !o)}
          >
            {title}
            <svg {...strokeProps} width={20} height={20} className="jr-footer__chevron">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          title
        )}
      </h2>
      <ul id={listId} className="jr-footer__links" hidden={collapsible && !open}>
        {group.links.map((link) => (
          <li key={link.key}>
            <NavLink to={link.to} className="jr-footer__link">
              {t(`footer.links.${group.id}.${link.key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  // UI only for now: prices are still shown in USD everywhere.
  const [currency, setCurrency] = useState<"USD" | "KRW">("USD");
  const currencyId = useId();
  const currentLng = i18n.resolvedLanguage ?? i18n.language;
  const year = new Date().getFullYear();

  return (
    <footer className="jr-footer">
      <section className="jr-footer__band" aria-labelledby="jr-footer-newsletter-title">
        <div className="jr-footer__inner jr-footer__band-inner">
          <div>
            <h2 id="jr-footer-newsletter-title" className="jr-footer__headline">
              {t("footer.newsletter.title")}
            </h2>
            <p className="jr-footer__lead">{t("footer.newsletter.text")}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <div className="jr-footer__inner">
        <div className="jr-footer__main">
          <nav className="jr-footer__nav" aria-label={t("footer.links.label")}>
            {LINK_GROUPS.map((group) => (
              <LinkColumn key={group.id} group={group} collapsible={isMobile} />
            ))}
          </nav>
        </div>

        <div className="jr-footer__utility">
          <div className="jr-footer__prefs">
            <div className="jr-footer__lang" role="group" aria-label={t("footer.utility.language")}>
              {LANGUAGES.map(({ lng, label }) => (
                <button
                  key={lng}
                  type="button"
                  lang={lng}
                  className="jr-footer__lang-btn"
                  aria-pressed={currentLng === lng}
                  onClick={() => {
                    if (currentLng !== lng) void setLanguage(lng);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="jr-footer__currency">
              <label htmlFor={currencyId} className="jr-sr-only">
                {t("footer.utility.currency")}
              </label>
              <select
                id={currencyId}
                className="jr-footer__select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "KRW")}
              >
                <option value="USD">{t("footer.utility.usd")}</option>
                <option value="KRW">{t("footer.utility.krw")}</option>
              </select>
              <svg {...strokeProps} width={16} height={16} className="jr-footer__select-chevron">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <ul className="jr-footer__socials" aria-label={t("footer.utility.social")}>
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a
                  className="jr-footer__social"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.utility.socialLink", { name: s.name })}
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="jr-footer__bottom">
          <div className="jr-footer__bottom-row">
            <p className="jr-footer__copyright">{t("footer.bottom.copyright", { year })}</p>
            <ul className="jr-footer__legal">
              <li>
                <NavLink to="/help" className="jr-footer__link">
                  {t("footer.bottom.privacy")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/help" className="jr-footer__link">
                  {t("footer.bottom.terms")}
                </NavLink>
              </li>
            </ul>
          </div>
          <p className="jr-footer__credit">
            {t("footer.bottom.credit", { name: CREDIT.name })}
            <span aria-hidden> · </span>
            <a className="jr-footer__link" href={CREDIT.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span aria-hidden> · </span>
            <a className="jr-footer__link" href={CREDIT.portfolio} target="_blank" rel="noopener noreferrer">
              {t("footer.bottom.portfolio")}
            </a>
          </p>
          <p className="jr-footer__disclaimer">{t("footer.bottom.disclaimer")}</p>
        </div>
      </div>

      <div className="jr-footer__wordmark" aria-hidden="true">
        <span>JERSEY REPUBLIC</span>
      </div>
    </footer>
  );
}
