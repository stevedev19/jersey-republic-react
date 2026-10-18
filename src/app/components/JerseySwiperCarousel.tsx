import React, { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslation } from "react-i18next";

// Sits on the light "New drops" section: navy & gold theme tokens from index.css.
// Gold is decorative only (progress bar, badge ring); the days-left label is navy because
// --gold-deep drops to 4.4:1 where the section's cream glow reaches it.
const INK = "var(--ink)";
const INK_MUTED = "var(--ink-soft)";
const NAVY = "var(--navy)";
const GOLD = "var(--gold)";
const CARD_BG = "radial-gradient(circle at 50% 38%, var(--white), var(--paper) 55%, var(--sand))";
const CARD_BORDER = "var(--sand)";
const CARD_SHADOW = "0 20px 50px -25px rgba(20, 27, 43, 0.35)";
const fontGrotesk = '"Archivo", "Pretendard", "Noto Sans KR", sans-serif';
const fontMonument = '"Monument Extended", "Monument", "Pretendard", "Noto Sans KR", sans-serif';

export interface JerseySwiperItem {
  id: string;
  name: string;
  league: string;
  year: string | number | null;
  price: number;
  imageUrl: string;
  isLatestDrop: boolean;
}

export interface JerseySwiperCarouselProps {
  jerseys: JerseySwiperItem[];
  /** When set, shows the orange countdown progress row at the top */
  daysRemaining?: number | null;
  /** 0–100; elapsed progress through the drop window (higher = closer to close) */
  progressPercent?: number;
  onAddToCart?: (id: string) => void;
}

function formatYear(y: string | number | null): string {
  if (y === null || y === undefined || y === "") return "—";
  return String(y);
}

function formatPrice(n: number): string {
  return `$${Number(n).toFixed(2)}`;
}

export function JerseySwiperCarousel({
  jerseys,
  daysRemaining,
  progressPercent = 0,
  onAddToCart,
}: JerseySwiperCarouselProps): React.ReactElement {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncEmbla = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    syncEmbla(emblaApi);
    emblaApi.on("select", syncEmbla);
    emblaApi.on("reInit", syncEmbla);
    return () => {
      emblaApi.off("select", syncEmbla);
      emblaApi.off("reInit", syncEmbla);
    };
  }, [emblaApi, syncEmbla]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const showCountdown =
    daysRemaining != null && Number.isFinite(daysRemaining) && daysRemaining >= 0;

  return (
    <div className="jersey-swiper-root">
      {showCountdown ? (
        <div className="jersey-swiper-countdown" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: fontGrotesk,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: INK_MUTED,
              }}
            >
              {t("carousel.dropWindow")}
            </span>
            <span
              style={{
                fontFamily: fontGrotesk,
                fontSize: 13,
                fontWeight: 700,
                color: NAVY,
                whiteSpace: "nowrap",
              }}
            >
              {t("carousel.daysLeft", { count: Math.floor(daysRemaining as number) })}
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: "var(--sand)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                background: GOLD,
                borderRadius: 999,
                transition: "width 0.45s ease",
              }}
            />
          </div>
        </div>
      ) : null}

      <div
        className="jersey-swiper-frame"
        style={{ position: "relative", marginLeft: -4, marginRight: -4 }}
      >
        <button
          type="button"
          className="jersey-swiper-arrow jersey-swiper-arrow--prev"
          aria-label={t("carousel.previous")}
          disabled={!canPrev}
          onClick={scrollPrev}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            chevron_left
          </span>
        </button>
        <button
          type="button"
          className="jersey-swiper-arrow jersey-swiper-arrow--next"
          aria-label={t("carousel.next")}
          disabled={!canNext}
          onClick={scrollNext}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            chevron_right
          </span>
        </button>

        <div className="jersey-embla" ref={emblaRef} style={{ overflow: "hidden" }}>
          <div
            className="jersey-embla__container"
            style={{
              display: "flex",
              touchAction: "pan-y pinch-zoom",
              marginLeft: -8,
            }}
          >
            {jerseys.map((j) => (
              <div
                key={j.id}
                className="jersey-embla__slide"
                style={{
                  flex: "0 0 clamp(260px, 82vw, 300px)",
                  minWidth: 0,
                  paddingLeft: 8,
                }}
              >
                <article
                  style={{
                    borderRadius: 16,
                    border: `1px solid ${CARD_BORDER}`,
                    overflow: "hidden",
                    background: CARD_BG,
                    boxShadow: CARD_SHADOW,
                    padding: 12,
                    boxSizing: "border-box",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link
                    to={`/products/${j.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                    aria-label={t("common.viewNamed", { name: j.name })}
                  >
                    {j.isLatestDrop ? (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 2,
                          background: NAVY,
                          color: "#ffffff",
                          boxShadow: `inset 0 0 0 1px ${GOLD}`,
                          fontFamily: fontGrotesk,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          padding: "5px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {t("carousel.latestDrop")}
                      </span>
                    ) : null}
                    <div style={{ aspectRatio: "4 / 5", padding: 8, boxSizing: "border-box" }}>
                      <img
                        src={j.imageUrl}
                        alt=""
                        decoding="async"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          mixBlendMode: "multiply",
                        }}
                      />
                    </div>
                  </Link>

                  <div
                    style={{
                      padding: "14px 4px 4px",
                      flex: "0 0 auto",
                    }}
                  >
                    <Link
                      to={`/products/${j.id}`}
                      style={{ textDecoration: "none", color: INK }}
                    >
                      <h3
                        style={{
                          fontFamily: fontMonument,
                          fontSize: 15,
                          fontWeight: 800,
                          lineHeight: 1.25,
                          margin: "0 0 6px 0",
                          color: INK,
                        }}
                      >
                        {j.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: fontGrotesk,
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: INK_MUTED,
                          margin: "0 0 4px 0",
                        }}
                      >
                        {j.league}
                      </p>
                      <p
                        style={{
                          fontFamily: fontGrotesk,
                          fontSize: 12,
                          color: INK_MUTED,
                          margin: "0 0 14px 0",
                        }}
                      >
                        {formatYear(j.year)}
                      </p>
                    </Link>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fontMonument,
                          fontSize: 18,
                          fontWeight: 800,
                          color: INK,
                        }}
                      >
                        {formatPrice(j.price)}
                      </span>
                      {onAddToCart ? (
                        <button
                          type="button"
                          aria-label={t("common.addToCartNamed", { name: j.name })}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(j.id);
                          }}
                          style={{
                            flexShrink: 0,
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            border: "none",
                            fontSize: 24,
                            fontWeight: 300,
                            lineHeight: 1,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          className="jersey-swiper-add jr-btn-primary"
                        >
                          +
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>

      {snapCount > 1 ? (
        <div
          className="jersey-swiper-dots"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
          }}
          role="tablist"
          aria-label={t("carousel.slides")}
        >
          {Array.from({ length: snapCount }).map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={t("carousel.goToSlide", { number: i + 1 })}
                onClick={() => scrollTo(i)}
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: active ? NAVY : "var(--sand)",
                  transition: "width 0.25s ease, background 0.2s ease",
                }}
              />
            );
          })}
        </div>
      ) : null}

      <style>{`
        .jersey-swiper-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid ${CARD_BORDER};
          background: var(--white);
          color: ${NAVY};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .jersey-swiper-arrow:hover:not(:disabled) {
          border-color: ${NAVY};
          background: ${NAVY};
          color: #fff;
        }
        .jersey-swiper-arrow:focus-visible {
          outline: 3px solid var(--gold-deep);
          outline-offset: 3px;
        }
        .jersey-swiper-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .jersey-swiper-arrow--prev { left: -6px; }
        .jersey-swiper-arrow--next { right: -6px; }
        @media (max-width: 640px) {
          .jersey-swiper-arrow--prev { left: 2px; }
          .jersey-swiper-arrow--next { right: 2px; }
        }
      `}</style>
    </div>
  );
}
