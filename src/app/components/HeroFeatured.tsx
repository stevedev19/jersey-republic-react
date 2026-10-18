import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "../../lib/types/product";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import { collectionLabel } from "./product/archiveCardUtils";
import "../../css/hero-featured.css";

const MAX_ITEMS = 3;
const ROTATE_MS = 6000;

function imageFor(product: Product): string {
  const imgs = normalizeProductImages(product.productImages);
  return (imgs[0] && getImageUrl(imgs[0])) || "/img/noimage-list.svg";
}

function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

interface HeroFeaturedProps {
  /** Up to the first three are shown. */
  products: Product[];
  /** Show the "NEW DROP" tag (true when the products come from the newest-arrivals list). */
  isNewDrop: boolean;
}

/**
 * Featured shirt card(s) in the home hero. With 2-3 products it becomes a small carousel:
 * arrows, dots, ←/→ keys, rotation every 6s that pauses on hover/focus or via the pause button,
 * and never auto-rotates when the visitor prefers reduced motion.
 */
export default function HeroFeatured({ products, isNewDrop }: HeroFeaturedProps) {
  const { t } = useTranslation();
  const items = products.slice(0, MAX_ITEMS);
  const count = items.length;
  const reducedMotion = usePrefersReducedMotion();

  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false); // pointer over it or focus inside it
  const [userPaused, setUserPaused] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  const canRotate = count > 1 && !reducedMotion;
  const rotating = canRotate && !userPaused && !interacting;

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [rotating, count]);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  if (count === 0) {
    return <div className="hero-featured hero-featured__placeholder" aria-hidden="true" />;
  }

  const product = items[Math.min(index, count - 1)];

  return (
    <section
      ref={rootRef}
      className="hero-featured"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={t("home.hero.featured.label")}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setInteracting(false);
      }}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      {/* announce slide changes only when they are user-driven */}
      <div aria-live={rotating ? "off" : "polite"}>
        <div
          key={product._id}
          className="hero-featured__slide"
          role={count > 1 ? "group" : undefined}
          aria-roledescription={count > 1 ? "slide" : undefined}
          aria-label={
            count > 1 ? t("home.hero.featured.slide", { current: index + 1, total: count }) : undefined
          }
        >
          <NavLink to={`/products/${product._id}`} className="hero-featured__card">
            <div className="hero-featured__media">
              {isNewDrop ? <span className="hero-featured__tag">{t("home.hero.featured.newDrop")}</span> : null}
              <img src={imageFor(product)} alt={product.productName} decoding="async" />
              <span className="hero-featured__cta" aria-hidden="true">
                {t("home.hero.featured.viewShirt")}
              </span>
            </div>
            <div className="hero-featured__meta">
              <p className="hero-featured__name">{product.productName}</p>
              <p className="hero-featured__price">${Number(product.productPrice).toFixed(2)}</p>
            </div>
            <p className="hero-featured__category">{collectionLabel(product.productCollection)}</p>
          </NavLink>
        </div>
      </div>

      {count > 1 ? (
        <div className="hero-featured__controls">
          <button
            type="button"
            className="hero-featured__btn"
            aria-label={t("home.hero.featured.prev")}
            onClick={() => go(-1)}
          >
            <svg {...iconProps}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="hero-featured__dots">
            {items.map((p, i) => (
              <button
                key={p._id}
                type="button"
                className="hero-featured__dot"
                aria-label={t("home.hero.featured.goTo", { number: i + 1 })}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hero-featured__btn"
            aria-label={t("home.hero.featured.next")}
            onClick={() => go(1)}
          >
            <svg {...iconProps}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {canRotate ? (
            <button
              type="button"
              className="hero-featured__btn hero-featured__btn--pause"
              aria-label={userPaused ? t("home.hero.featured.play") : t("home.hero.featured.pause")}
              onClick={() => setUserPaused((p) => !p)}
            >
              {userPaused ? (
                <svg {...iconProps}>
                  <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                </svg>
              ) : (
                <svg {...iconProps}>
                  <path d="M9 5v14M15 5v14" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
