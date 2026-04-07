import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../lib/types/product";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import { collectionLabel, sizeLabel } from "./product/archiveCardUtils";
import { fetchNewDropsPageData, NewDropsWindow } from "../../lib/newDropsApi";

const fontGrotesk = '"Space Grotesk", sans-serif';
const fontMonument = '"Monument Extended", "Monument", sans-serif';

function cardImage(product: Product): string {
  const imgs = normalizeProductImages(product.productImages);
  if (imgs.length === 0) return "/img/noimage-list.svg";
  const first = imgs[0];
  return first.startsWith("http") ? first : getImageUrl(first) || "/img/noimage-list.svg";
}

export default function HomeNewDropsSection() {
  const [newDrops, setNewDrops] = useState<Product[]>([]);
  const [dropWindow, setDropWindow] = useState<NewDropsWindow | null>(null);
  const [loaded, setLoaded] = useState(false);

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
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: fontGrotesk,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "#f7ba85",
                marginBottom: 12,
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
          <div style={{ textAlign: "right" as const }}>
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
                <span>
                  Drop window: {dropWindow.startYear} — {dropWindow.endYear}
                </span>
              </p>
            ) : null}
            <Link
              to="/products?filter=NEW_DROPS"
              style={{
                display: "inline-block",
                marginTop: 8,
                fontFamily: fontGrotesk,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#667eea",
                textDecoration: "none",
              }}
              className="home-new-drops__view-all"
            >
              VIEW ALL →
            </Link>
          </div>
        </header>

        {dropWindow ? (
          <p
            style={{
              fontFamily: fontGrotesk,
              fontSize: 11,
              color: "#f7ba85",
              letterSpacing: 2,
              marginBottom: 32,
              marginTop: -16,
            }}
          >
            <span>
              {dropWindow.daysRemaining} days left in this drop window
            </span>
          </p>
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
          <div
            className="home-new-drops__grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {newDrops.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="archive-card home-new-drops__card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="archive-card__image" style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      zIndex: 2,
                      background: "#f7ba85",
                      color: "#0e1322",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontFamily: fontGrotesk,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    NEW DROP
                  </span>
                  <img src={cardImage(product)} alt="" decoding="async" />
                  <span className="archive-card__badge-size">{sizeLabel(product)}</span>
                </div>
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
                  <div className="archive-card__row">
                    <span className="archive-card__price">${product.productPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`
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
