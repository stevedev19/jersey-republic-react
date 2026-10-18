import React from "react";
import { useTranslation } from "react-i18next";
import "../../css/trust-strip.css";

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

const ITEMS = [
  {
    key: "authenticity",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
        <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
      </svg>
    ),
  },
  {
    key: "shipping",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" />
      </svg>
    ),
  },
  {
    key: "returns",
    icon: (
      <svg {...iconProps}>
        <path d="M4 9h11.5a4.5 4.5 0 0 1 0 9H8" />
        <path d="M7.5 5.5 4 9l3.5 3.5" />
      </svg>
    ),
  },
  {
    key: "payment",
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="10.5" width="14" height="10" rx="2" />
        <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
        <path d="M12 14.5v2.5" />
      </svg>
    ),
  },
] as const;

/** Four reassurance items shown under the home hero. */
export default function TrustStrip() {
  const { t } = useTranslation();
  return (
    <section className="trust-strip" aria-label={t("trust.label")}>
      <ul className="trust-strip__list">
        {ITEMS.map((item) => (
          <li key={item.key} className="trust-strip__item">
            <span className="trust-strip__icon">{item.icon}</span>
            {t(`trust.${item.key}`)}
          </li>
        ))}
      </ul>
    </section>
  );
}
