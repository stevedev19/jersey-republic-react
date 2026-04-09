import React, { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

const NAVY = "#0a0f1e";
const ORANGE = "#FF6B35";
const LIGHT_PANEL = "#e8ecf2";
const SUBTLE_BORDER = "rgba(255, 255, 255, 0.12)";
const fontGrotesk = '"Space Grotesk", sans-serif';
const fontMonument = '"Monument Extended", "Monument", sans-serif';

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
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Drop window
            </span>
            <span
              style={{
                fontFamily: fontGrotesk,
                fontSize: 13,
                fontWeight: 700,
                color: ORANGE,
                whiteSpace: "nowrap",
              }}
            >
              {Math.floor(daysRemaining as number)} days left
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                background: `linear-gradient(90deg, ${ORANGE} 0%, #ff9f70 100%)`,
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
          aria-label="Previous"
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
          aria-label="Next"
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
                    border: `1px solid ${SUBTLE_BORDER}`,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.04)",
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
                      background: LIGHT_PANEL,
                      flex: "1 1 auto",
                      minHeight: 200,
                    }}
                    aria-label={`View ${j.name}`}
                  >
                    {j.isLatestDrop ? (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 2,
                          background: ORANGE,
                          color: "#fff",
                          fontFamily: fontGrotesk,
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          padding: "5px 10px",
                          borderRadius: 999,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      >
                        Latest drop
                      </span>
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px 16px",
                        minHeight: 220,
                      }}
                    >
                      <img
                        src={j.imageUrl}
                        alt=""
                        decoding="async"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </Link>

                  <div
                    style={{
                      padding: "16px 16px 18px",
                      background: NAVY,
                      flex: "0 0 auto",
                    }}
                  >
                    <Link
                      to={`/products/${j.id}`}
                      style={{ textDecoration: "none", color: "#fff" }}
                    >
                      <h3
                        style={{
                          fontFamily: fontMonument,
                          fontSize: 15,
                          fontWeight: 800,
                          lineHeight: 1.25,
                          margin: "0 0 6px 0",
                          color: "#fff",
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
                          color: "rgba(255,255,255,0.5)",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {j.league}
                      </p>
                      <p
                        style={{
                          fontFamily: fontGrotesk,
                          fontSize: 12,
                          color: "rgba(255,255,255,0.45)",
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
                          color: "#fff",
                        }}
                      >
                        {formatPrice(j.price)}
                      </span>
                      {onAddToCart ? (
                        <button
                          type="button"
                          aria-label={`Add ${j.name} to cart`}
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
                            background: ORANGE,
                            color: "#fff",
                            fontSize: 24,
                            fontWeight: 300,
                            lineHeight: 1,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 6px 20px rgba(255,107,53,0.35)",
                            transition: "transform 0.15s ease, filter 0.15s ease",
                          }}
                          className="jersey-swiper-add"
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
          aria-label="Slides"
        >
          {Array.from({ length: snapCount }).map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: active ? ORANGE : "rgba(255,255,255,0.22)",
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
          border: 1px solid ${SUBTLE_BORDER};
          background: rgba(10, 15, 30, 0.92);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .jersey-swiper-arrow:hover:not(:disabled) {
          border-color: ${ORANGE};
          background: rgba(255, 107, 53, 0.15);
          color: ${ORANGE};
        }
        .jersey-swiper-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .jersey-swiper-arrow--prev { left: -6px; }
        .jersey-swiper-arrow--next { right: -6px; }
        .jersey-swiper-add:hover {
          transform: scale(1.06);
          filter: brightness(1.05);
        }
        .jersey-swiper-add:active {
          transform: scale(0.96);
        }
        @media (max-width: 640px) {
          .jersey-swiper-arrow--prev { left: 2px; }
          .jersey-swiper-arrow--next { right: 2px; }
        }
      `}</style>
    </div>
  );
}
