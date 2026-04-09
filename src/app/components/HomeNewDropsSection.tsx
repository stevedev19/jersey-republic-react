import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Product } from "../../lib/types/product";
import { CartItem } from "../../lib/types/search";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import { collectionLabel, sizeLabel } from "./product/archiveCardUtils";
import { fetchNewDropsPageData, NewDropsWindow } from "../../lib/newDropsApi";
import { sweetTopSmallSuccessAlert } from "../../lib/sweetAlert";

const fontGrotesk = '"Space Grotesk", sans-serif';
const fontMonument = '"Monument Extended", "Monument", sans-serif';

const LOW_STOCK_MAX = 10;

export interface HomeNewDropsSectionProps {
  /** Cart add handler from shell — optional hides quick-add buttons */
  onAdd?: (item: CartItem) => boolean;
}

function cardImage(product: Product): string {
  const imgs = normalizeProductImages(product.productImages);
  if (imgs.length === 0) return "/img/noimage-list.svg";
  const first = imgs[0];
  return first.startsWith("http") ? first : getImageUrl(first) || "/img/noimage-list.svg";
}

function productToCartItem(product: Product): CartItem {
  const imgs = normalizeProductImages(product.productImages);
  const first = imgs.length > 0 ? imgs[0] : "/img/noimage-list.svg";
  return {
    _id: product._id,
    quantity: 1,
    name: product.productName,
    price: product.productPrice,
    image: first,
  };
}

function windowTotalDays(w: NewDropsWindow): number {
  const t0 = Date.parse(w.start);
  const t1 = Date.parse(w.end);
  if (Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0) {
    return Math.max(1, Math.ceil((t1 - t0) / 86400000));
  }
  return Math.max(60, w.daysRemaining + 20);
}

function windowProgressPercent(w: NewDropsWindow): number {
  const total = windowTotalDays(w);
  const left = w.daysRemaining;
  const pct = ((total - left) / total) * 100;
  return Math.min(100, Math.max(0, pct));
}

type BadgeKind = "latest" | "popular" | "low-stock";

function computeBadgeMeta(products: Product[]): Map<string, { kind: BadgeKind; label: string }> {
  const map = new Map<string, { kind: BadgeKind; label: string }>();
  if (!products.length) return map;

  let newestId = products[0]._id;
  let newestT = new Date(products[0].createdAt).getTime();
  let maxViews = -1;
  let popularId = products[0]._id;
  for (const p of products) {
    const t = new Date(p.createdAt).getTime();
    if (Number.isFinite(t) && t >= newestT) {
      newestT = t;
      newestId = p._id;
    }
    if (p.productViews > maxViews) {
      maxViews = p.productViews;
      popularId = p._id;
    }
  }

  for (const p of products) {
    const left = p.productLeftCount ?? 0;
    if (left <= LOW_STOCK_MAX) {
      map.set(p._id, { kind: "low-stock", label: `${Math.max(0, left)} left` });
      continue;
    }
    if (p._id === popularId && maxViews > 0) {
      map.set(p._id, { kind: "popular", label: "Popular" });
      continue;
    }
    if (p._id === newestId) {
      map.set(p._id, { kind: "latest", label: "Latest drop" });
      continue;
    }
    map.set(p._id, { kind: "latest", label: "Latest drop" });
  }
  return map;
}

function badgeStyles(kind: BadgeKind): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    borderRadius: 999,
    padding: "4px 10px",
    fontFamily: fontGrotesk,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  };
  if (kind === "latest") {
    return { ...base, background: "#f7ba85", color: "#0e1322" };
  }
  if (kind === "popular") {
    return { ...base, background: "#c62828", color: "#ffffff" };
  }
  return { ...base, background: "rgba(138, 148, 166, 0.95)", color: "#0e1322" };
}

export function HomeNewDropsSection({ onAdd }: HomeNewDropsSectionProps): React.ReactElement {
  const history = useHistory();
  const [newDrops, setNewDrops] = useState<Product[]>([]);
  const [dropWindow, setDropWindow] = useState<NewDropsWindow | null>(null);
  const [loaded, setLoaded] = useState(false);

  const badgeMeta = useMemo(() => computeBadgeMeta(newDrops), [newDrops]);

  useEffect(() => {
    const ac = new AbortController();
    fetchNewDropsPageData({ signal: ac.signal })
      .then((data) => {
        const list = Array.isArray(data.products) ? data.products : [];
        setNewDrops(list.slice(0, 6));
        setDropWindow(data.window);
      })
      .catch((err) => {
        if (!ac.signal.aborted) console.error(err);
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoaded(true);
      });
    return () => ac.abort();
  }, []);

  const progressPct = dropWindow ? windowProgressPercent(dropWindow) : 0;

  const quickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAdd) return;
    const added = onAdd(productToCartItem(product));
    if (added) {
      sweetTopSmallSuccessAlert("Added to cart", 1800);
      window.setTimeout(() => history.push("/products"), 0);
    }
  };

  return (
    <section
      id="drops"
      className="home-new-drops scroll-mt-28"
      style={{
        background: "#0e1322",
        padding: "80px 64px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header
          className="home-new-drops__header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: dropWindow ? 16 : 48,
            flexWrap: "wrap",
            gap: "12px 24px",
          }}
        >
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <p
              style={{
                fontFamily: fontGrotesk,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "#f7ba85",
                margin: "0 0 12px 0",
              }}
            >
              FRESH FROM THE ARCHIVE
            </p>
            <h2
              style={{
                fontFamily: fontMonument,
                fontSize: "clamp(40px, 6vw, 64px)",
                lineHeight: 0.9,
                color: "#ffffff",
                margin: 0,
                fontWeight: 800,
              }}
            >
              NEW DROPS.
            </h2>
            <p
              style={{
                fontFamily: fontGrotesk,
                fontSize: 14,
                color: "#8a94a6",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Latest kits added to the Republic.
            </p>
          </div>
          <div
            style={{
              flex: "0 0 auto",
              textAlign: "right" as const,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
              paddingBottom: 2,
            }}
          >
            {dropWindow ? (
              <p
                style={{
                  fontFamily: fontGrotesk,
                  fontSize: 11,
                  color: "#8a94a6",
                  letterSpacing: 1,
                  margin: 0,
                }}
              >
                Drop window: {dropWindow.startYear}–{dropWindow.endYear}
              </p>
            ) : null}
            <Link
              to="/products?filter=NEW_DROPS"
              style={{
                fontFamily: fontGrotesk,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#667eea",
                textDecoration: "none",
              }}
              className="home-new-drops__view-all"
            >
              View All →
            </Link>
          </div>
        </header>

        {dropWindow ? (
          <div
            className="home-new-drops__progress-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: fontGrotesk,
                fontSize: 11,
                color: "#8a94a6",
                whiteSpace: "nowrap",
              }}
            >
              Window closes in
            </span>
            <div
              style={{
                flex: "1 1 120px",
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                minWidth: 80,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #f7ba85 0%, #e65100 100%)",
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: fontGrotesk,
                fontSize: 11,
                fontWeight: 700,
                color: "#f7ba85",
                whiteSpace: "nowrap",
              }}
            >
              {dropWindow.daysRemaining} days left
            </span>
          </div>
        ) : null}

        {!loaded ? null : newDrops.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 16,
            }}
          >
            <p
              style={{
                fontFamily: fontMonument,
                fontSize: 32,
                color: "rgba(255,255,255,0.15)",
                margin: 0,
              }}
            >
              NO DROPS YET
            </p>
            <p
              style={{
                fontFamily: fontGrotesk,
                fontSize: 13,
                color: "#8a94a6",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              New kits dropping soon. Stay tuned.
            </p>
          </div>
        ) : (
          <div className="home-new-drops__grid">
            {newDrops.map((product) => {
              const badge = badgeMeta.get(product._id) ?? {
                kind: "latest" as const,
                label: "Latest drop",
              };
              return (
                <div
                  key={product._id}
                  className="home-new-drops__card-wrap archive-card"
                >
                  <div className="archive-card__image" style={{ position: "relative" }}>
                    <Link
                      to={`/products/${product._id}`}
                      className="home-new-drops__card-img-link"
                      style={{ display: "block", lineHeight: 0, textDecoration: "none" }}
                      aria-label={`View ${product.productName}`}
                    >
                      <span style={badgeStyles(badge.kind)}>{badge.label}</span>
                      <img src={cardImage(product)} alt="" decoding="async" />
                    </Link>
                    <span className="archive-card__badge-size">{sizeLabel(product)}</span>
                    {onAdd ? (
                      <button
                        type="button"
                        className="home-new-drops__quick-add"
                        aria-label={`Add ${product.productName} to cart`}
                        onClick={(e) => quickAdd(e, product)}
                      >
                        +
                      </button>
                    ) : null}
                  </div>
                  <Link
                    to={`/products/${product._id}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <div className="archive-card__body">
                      <h2 className="archive-card__name">{product.productName}</h2>
                      <p className="archive-card__league">
                        {collectionLabel(product.productCollection)}
                      </p>
                      {product.madeYear != null ? (
                        <p
                          style={{
                            fontFamily: fontGrotesk,
                            fontSize: 10,
                            color: "#8a94a6",
                            margin: "4px 0 0 0",
                          }}
                        >
                          Made: {product.madeYear}
                        </p>
                      ) : null}
                      <div className="archive-card__row home-new-drops__price-row">
                        <span className="archive-card__price">${product.productPrice}</span>
                        <span className="home-new-drops__currency">USD</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .home-new-drops__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .home-new-drops__card-wrap {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .home-new-drops__card-wrap:hover {
          transform: translateY(-2px);
          border-color: rgba(102, 126, 234, 0.35);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
        }
        .home-new-drops__price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .home-new-drops__currency {
          font-family: ${fontGrotesk};
          font-size: 10px;
          font-weight: 500;
          color: rgba(138, 148, 166, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .home-new-drops__quick-add {
          position: absolute;
          right: 10px;
          bottom: 10px;
          z-index: 4;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
          background: #667eea;
          color: #fff;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.45);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .home-new-drops__quick-add:hover {
          transform: scale(1.06);
          background: #4a62d8;
        }
        .home-new-drops__quick-add:active {
          transform: scale(0.96);
        }
        @media (max-width: 1024px) {
          .home-new-drops__grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .home-new-drops {
            padding: 48px 24px !important;
          }
          .home-new-drops__grid {
            grid-template-columns: 1fr !important;
          }
        }
        .home-new-drops__view-all:hover {
          color: #ffffff !important;
        }
      `}</style>
    </section>
  );
}
