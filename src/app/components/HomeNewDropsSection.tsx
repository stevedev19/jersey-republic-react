import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Product } from "../../lib/types/product";
import { CartItem } from "../../lib/types/search";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import { collectionLabel } from "./product/archiveCardUtils";
import { fetchNewDropsPageData, NewDropsWindow } from "../../lib/newDropsApi";
import { sweetTopSmallSuccessAlert } from "../../lib/sweetAlert";
import { JerseySwiperCarousel, JerseySwiperItem } from "./JerseySwiperCarousel";

const ACCENT = "#FF6B35";
const BG_NAVY = "#0a0f1e";
const fontGrotesk = '"Space Grotesk", sans-serif';
const fontMonument = '"Monument Extended", "Monument", sans-serif';

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

function newestProductId(products: Product[]): string | null {
  if (!products.length) return null;
  let id = products[0]._id;
  let best = new Date(products[0].createdAt).getTime();
  for (const p of products) {
    const t = new Date(p.createdAt).getTime();
    if (Number.isFinite(t) && t >= best) {
      best = t;
      id = p._id;
    }
  }
  return id;
}

function productsToJerseyItems(products: Product[], latestId: string | null): JerseySwiperItem[] {
  return products.map((product) => ({
    id: product._id,
    name: product.productName,
    league: collectionLabel(product.productCollection),
    year: product.madeYear ?? product.uniformSeason ?? null,
    price: product.productPrice,
    imageUrl: cardImage(product),
    isLatestDrop: latestId != null && product._id === latestId,
  }));
}

export function HomeNewDropsSection({ onAdd }: HomeNewDropsSectionProps): React.ReactElement {
  const history = useHistory();
  const [newDrops, setNewDrops] = useState<Product[]>([]);
  const [dropWindow, setDropWindow] = useState<NewDropsWindow | null>(null);
  const [loaded, setLoaded] = useState(false);

  const latestId = useMemo(() => newestProductId(newDrops), [newDrops]);
  const jerseyItems = useMemo(
    () => productsToJerseyItems(newDrops, latestId),
    [newDrops, latestId]
  );

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

  const handleAddById = useCallback(
    (id: string) => {
      if (!onAdd) return;
      const product = newDrops.find((p) => p._id === id);
      if (!product) return;
      const added = onAdd(productToCartItem(product));
      if (added) {
        sweetTopSmallSuccessAlert("Added to cart", 1800);
        window.setTimeout(() => history.push("/products"), 0);
      }
    },
    [newDrops, onAdd, history]
  );

  return (
    <section
      id="drops"
      className="home-new-drops scroll-mt-28"
      style={{
        background: BG_NAVY,
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
            marginBottom: 36,
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
                color: ACCENT,
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
                color: "rgba(138, 148, 166, 0.95)",
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
                  color: "rgba(138, 148, 166, 0.95)",
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
                color: ACCENT,
                textDecoration: "none",
              }}
              className="home-new-drops__view-all"
            >
              View All →
            </Link>
          </div>
        </header>

        {!loaded ? null : newDrops.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              border: "1px dashed rgba(255,255,255,0.12)",
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
                color: "rgba(138, 148, 166, 0.95)",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              New kits dropping soon. Stay tuned.
            </p>
          </div>
        ) : (
          <JerseySwiperCarousel
            jerseys={jerseyItems}
            daysRemaining={dropWindow?.daysRemaining ?? null}
            progressPercent={progressPct}
            onAddToCart={onAdd ? handleAddById : undefined}
          />
        )}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .home-new-drops {
            padding: 48px 24px !important;
          }
        }
        .home-new-drops__view-all:hover {
          color: #ffffff !important;
        }
        /* No size pills on homepage new-drops cards (#drops) */
        #drops .archive-card__badge-size,
        .home-new-drops .archive-card__badge-size {
          display: none !important;
        }
      `}</style>
    </section>
  );
}
