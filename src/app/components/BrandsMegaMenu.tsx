import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductCollection } from "../../lib/enums/product.enum";
import { getImageUrl } from "../../lib/config";
import { normalizeProductImages } from "../../lib/normalizeProductImages";
import ProductService from "../services/ProductService";
import type { Product } from "../../lib/types/product";
import "../../css/brands-megamenu.css";

type LeagueRow = {
  /** i18n key for the row label */
  labelKey: string;
  collection: ProductCollection;
  search?: string;
};

type NationRow = {
  /** i18n key for the row label */
  labelKey: string;
  collection: ProductCollection;
  search?: string;
};

const LEAGUES: LeagueRow[] = [
  { labelKey: "collections.PREMIER_LEAGUE", collection: ProductCollection.PREMIER_LEAGUE },
  { labelKey: "collections.LA_LIGA", collection: ProductCollection.LA_LIGA },
  { labelKey: "collections.BUNDESLIGA", collection: ProductCollection.BUNDESLIGA },
  { labelKey: "collections.SERIE_A", collection: ProductCollection.SERIE_A },
  { labelKey: "collections.LIGUE_1", collection: ProductCollection.LIGUE_1 },
  { labelKey: "collections.CHAMPIONS_LEAGUE", collection: ProductCollection.CHAMPIONS_LEAGUE },
  { labelKey: "megaMenu.worldCup", collection: ProductCollection.NATIONAL_TEAMS, search: "World Cup" },
];

const NATIONS: NationRow[] = [
  { labelKey: "megaMenu.nations.brazil", collection: ProductCollection.NATIONAL_TEAMS, search: "Brazil" },
  { labelKey: "megaMenu.nations.france", collection: ProductCollection.NATIONAL_TEAMS, search: "France" },
  { labelKey: "megaMenu.nations.germany", collection: ProductCollection.NATIONAL_TEAMS, search: "Germany" },
  { labelKey: "megaMenu.nations.argentina", collection: ProductCollection.NATIONAL_TEAMS, search: "Argentina" },
  { labelKey: "megaMenu.nations.england", collection: ProductCollection.NATIONAL_TEAMS, search: "England" },
  { labelKey: "megaMenu.nations.portugal", collection: ProductCollection.NATIONAL_TEAMS, search: "Portugal" },
  { labelKey: "megaMenu.nations.spain", collection: ProductCollection.NATIONAL_TEAMS, search: "Spain" },
  { labelKey: "megaMenu.nations.uzbekistan", collection: ProductCollection.UZBEKISTAN_LEAGUE },
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
  const { t } = useTranslation();
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
  const featuredTitle = newestProduct?.productName ?? t("megaMenu.latestKits");
  const imgAlt = newestProduct?.productName ?? "";

  return (
    <div
      id="teams-mega-menu"
      role="navigation"
      aria-label={t("megaMenu.label")}
      className={`brands-mega ${open ? "brands-mega--open" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="brands-mega__inner">
        <div className="brands-mega__col">
          <span className="brands-mega__section-head">{t("megaMenu.byLeague")}</span>
          <div className="brands-mega__rows">
            {LEAGUES.map((row) => (
              <Link
                key={`${row.collection}-${row.labelKey}`}
                to={productsHref({ collection: row.collection, search: row.search })}
                className="brands-mega__row"
                onClick={wrapNavigate}
              >
                <span className="brands-mega__row-label">{t(row.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="brands-mega__col">
          <span className="brands-mega__section-head">{t("megaMenu.byNation")}</span>
          <div className="brands-mega__rows">
            {NATIONS.map((row) => (
              <Link
                key={`${row.collection}-${row.labelKey}-${row.search || ""}`}
                to={productsHref({ collection: row.collection, search: row.search })}
                className="brands-mega__row"
                onClick={wrapNavigate}
              >
                <span className="brands-mega__row-label">{t(row.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="brands-mega__col brands-mega__col--spacer" aria-hidden="true" />

        <div className="brands-mega__col brands-mega__col--featured">
          <span className="brands-mega__section-head brands-mega__section-head--featured">{t("megaMenu.featuredDrop")}</span>
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
              <span className="brands-mega__featured-badge">{t("megaMenu.newDrop")}</span>
              <h3 className="brands-mega__featured-name">
                {featuredLoading ? t("megaMenu.loading") : featuredTitle}
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
                <span className="brands-mega__featured-view">{t("megaMenu.view")}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="brands-mega__footer">
        <div className="brands-mega__footer-links">
          <Link to="/products" className="brands-mega__footer-link" onClick={wrapNavigate}>
            {t("megaMenu.allJerseys")}
          </Link>
          <Link
            to="/products?order=createdAt"
            className="brands-mega__footer-link"
            onClick={wrapNavigate}
          >
            {t("megaMenu.newArrivals")}
          </Link>
          <Link
            to="/products?order=productPrice"
            className="brands-mega__footer-link"
            onClick={wrapNavigate}
          >
            {t("megaMenu.onSale")}
          </Link>
        </div>
        <p className="brands-mega__footer-hint">{t("megaMenu.escHint")}</p>
      </div>
    </div>
  );
}
