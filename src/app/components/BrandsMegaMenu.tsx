import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCollection } from "../../lib/enums/product.enum";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import ProductService from "../services/ProductService";
import type { Product } from "../../lib/types/product";
import "../../css/brands-megamenu.css";

type LeagueRow = {
  emoji: string;
  label: string;
  count: number;
  collection: ProductCollection;
  search?: string;
};

type NationRow = {
  emoji: string;
  label: string;
  count: number;
  collection: ProductCollection;
  search?: string;
};

const LEAGUES: LeagueRow[] = [
  { emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "Premier League", count: 48, collection: ProductCollection.PREMIER_LEAGUE },
  { emoji: "🇪🇸", label: "La Liga", count: 36, collection: ProductCollection.LA_LIGA },
  { emoji: "🇩🇪", label: "Bundesliga", count: 32, collection: ProductCollection.BUNDESLIGA },
  { emoji: "🇮🇹", label: "Serie A", count: 30, collection: ProductCollection.SERIE_A },
  { emoji: "🇫🇷", label: "Ligue 1", count: 28, collection: ProductCollection.LIGUE_1 },
  { emoji: "🏆", label: "Champions League", count: 12, collection: ProductCollection.CHAMPIONS_LEAGUE },
  { emoji: "🌍", label: "World Cup 2026", count: 32, collection: ProductCollection.NATIONAL_TEAMS, search: "World Cup" },
];

const NATIONS: NationRow[] = [
  { emoji: "🇧🇷", label: "Brazil", count: 18, collection: ProductCollection.NATIONAL_TEAMS, search: "Brazil" },
  { emoji: "🇫🇷", label: "France", count: 14, collection: ProductCollection.NATIONAL_TEAMS, search: "France" },
  { emoji: "🇩🇪", label: "Germany", count: 12, collection: ProductCollection.NATIONAL_TEAMS, search: "Germany" },
  { emoji: "🇦🇷", label: "Argentina", count: 10, collection: ProductCollection.NATIONAL_TEAMS, search: "Argentina" },
  { emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "England", count: 16, collection: ProductCollection.NATIONAL_TEAMS, search: "England" },
  { emoji: "🇵🇹", label: "Portugal", count: 8, collection: ProductCollection.NATIONAL_TEAMS, search: "Portugal" },
  { emoji: "🇪🇸", label: "Spain", count: 12, collection: ProductCollection.NATIONAL_TEAMS, search: "Spain" },
  { emoji: "🇺🇿", label: "Uzbekistan", count: 6, collection: ProductCollection.UZBEKISTAN_LEAGUE },
];

function productsHref(opts: { collection?: ProductCollection; search?: string }) {
  const p = new URLSearchParams();
  if (opts.collection) p.set("collection", opts.collection);
  if (opts.search) p.set("search", opts.search);
  const q = p.toString();
  return `/products${q ? `?${q}` : ""}`;
}

function kitTypeLabel(product: Product): string {
  const vol = product.productVolume ? String(product.productVolume).replace(/_/g, " ") : "";
  const coll = String(product.productCollection || "").replace(/_/g, " ");
  const parts = [vol, coll].map((s) => s.trim()).filter(Boolean);
  return parts.join(" · ").toUpperCase();
}

interface BrandsMegaMenuProps {
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
}

export default function BrandsMegaMenu({
  open,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: BrandsMegaMenuProps) {
  const wrapNavigate = () => onNavigate();
  const [newestProduct, setNewestProduct] = useState<Product | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    const run = async () => {
      setFeaturedLoading(true);
      try {
        const svc = new ProductService();
        const list = await svc.getProducts(
          { page: 1, limit: 1, order: "createdAt" },
          { signal: ac.signal }
        );
        if (cancelled) return;
        const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
        setNewestProduct(first);
      } catch (e: unknown) {
        const err = e as { name?: string; code?: string };
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        if (!cancelled) setNewestProduct(null);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  const featuredPaths = normalizeProductImages(newestProduct?.productImages);
  const featuredImage =
    featuredPaths[0] != null ? getImageUrl(featuredPaths[0]) : "";
  const featuredHref = newestProduct ? `/products/${newestProduct._id}` : "/products?order=createdAt";
  const featuredTitle = newestProduct?.productName ?? "Latest kits this week";
  const imgAlt = newestProduct?.productName ?? "";

  return (
    <div
      id="teams-mega-menu"
      role="navigation"
      aria-label="Shop by league and nation"
      className={`brands-mega ${open ? "brands-mega--open" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="brands-mega__inner">
        <div className="brands-mega__col">
          <span className="brands-mega__section-head">BY LEAGUE</span>
          <div className="brands-mega__rows">
            {LEAGUES.map((row) => (
              <Link
                key={`${row.collection}-${row.label}`}
                to={productsHref({ collection: row.collection, search: row.search })}
                className="brands-mega__row"
                onClick={wrapNavigate}
              >
                <span className="brands-mega__row-left">
                  <span className="brands-mega__row-emoji" aria-hidden>
                    {row.emoji}
                  </span>
                  <span className="brands-mega__row-label">{row.label}</span>
                </span>
                <span className="brands-mega__row-count">{row.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="brands-mega__col">
          <span className="brands-mega__section-head">BY NATION</span>
          <div className="brands-mega__rows">
            {NATIONS.map((row) => (
              <Link
                key={`${row.collection}-${row.label}-${row.search || ""}`}
                to={productsHref({ collection: row.collection, search: row.search })}
                className="brands-mega__row"
                onClick={wrapNavigate}
              >
                <span className="brands-mega__row-left">
                  <span className="brands-mega__row-emoji" aria-hidden>
                    {row.emoji}
                  </span>
                  <span className="brands-mega__row-label">{row.label}</span>
                </span>
                <span className="brands-mega__row-count">{row.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="brands-mega__col brands-mega__col--spacer" aria-hidden="true" />

        <div className="brands-mega__col brands-mega__col--featured">
          <span className="brands-mega__section-head brands-mega__section-head--featured">FEATURED DROP</span>
          <Link to={featuredHref} className="brands-mega__featured-card" onClick={wrapNavigate}>
            <div className="brands-mega__featured-visual">
              {featuredLoading ? (
                <div className="brands-mega__featured-visual--placeholder" aria-hidden />
              ) : featuredImage ? (
                <img src={featuredImage} alt={imgAlt} className="brands-mega__featured-img" />
              ) : (
                <div className="brands-mega__featured-visual--placeholder" aria-hidden />
              )}
            </div>
            <div className="brands-mega__featured-info">
              <span className="brands-mega__featured-badge">NEW DROP</span>
              <h3 className="brands-mega__featured-name">
                {featuredLoading ? "Loading…" : featuredTitle}
              </h3>
              <p className="brands-mega__featured-kit">
                {newestProduct && !featuredLoading ? kitTypeLabel(newestProduct) : "—"}
              </p>
              <div className="brands-mega__featured-actions">
                <span className="brands-mega__featured-price">
                  {newestProduct && !featuredLoading
                    ? `$${Number(newestProduct.productPrice).toFixed(2)}`
                    : "—"}
                </span>
                <span className="brands-mega__featured-view">VIEW →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="brands-mega__footer">
        <div className="brands-mega__footer-links">
          <Link to="/products" className="brands-mega__footer-link" onClick={wrapNavigate}>
            ALL JERSEYS →
          </Link>
          <Link
            to="/products?order=createdAt"
            className="brands-mega__footer-link"
            onClick={wrapNavigate}
          >
            NEW ARRIVALS →
          </Link>
          <Link
            to="/products?order=productPrice"
            className="brands-mega__footer-link"
            onClick={wrapNavigate}
          >
            ON SALE →
          </Link>
        </div>
        <p className="brands-mega__footer-hint">Press ESC to close</p>
      </div>
    </div>
  );
}
