import React, { useEffect, useRef, useState } from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import EastIcon from "@mui/icons-material/East";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import ArchiveTopNav, { ArchiveTopNavProps } from "./ArchiveTopNav";
import ActiveUsers from "./ActiveUsers";
import { HomeNewDropsSection } from "../../components/HomeNewDropsSection";
import TrustStrip from "../../components/TrustStrip";
import HeroFeatured from "../../components/HeroFeatured";
import ArchiveProductCard from "../../components/product/ArchiveProductCard";
import { retrieveTrendingDishes, retrieveNewDishes } from "./selector";
import { Product } from "../../../lib/types/product";
import { CartItem } from "../../../lib/types/search";
import { getImageUrl } from "../../../lib/config";
import { normalizeProductImages } from "../../../lib/normalizeProductImages";
import { sweetTopSmallSuccessAlert } from "../../../lib/sweetAlert";
import { collectionLabel } from "../../components/product/archiveCardUtils";
import "../../../css/home.css";
import "../../../css/products.css";
import "../../../css/home-theme.css";

type ArchiveLandingProps = ArchiveTopNavProps;

const trendingDishesRetriever = createSelector(retrieveTrendingDishes, (trendingDishes) => ({
  trendingDishes,
}));

const newDishesRetriever = createSelector(retrieveNewDishes, (newDishes) => ({
  newDishes,
}));

function getProductCardImage(product: Product): string {
  const imgs = normalizeProductImages(product.productImages);
  if (imgs.length === 0) return "/img/noimage-list.svg";
  return getImageUrl(imgs[0]) || "/img/noimage-list.svg";
}

function getTrendingBackImage(product: Product): string {
  const imgs = normalizeProductImages(product.productImages);
  if (imgs.length >= 2) {
    return getImageUrl(imgs[1]) || "/img/noimage-list.svg";
  }
  return getProductCardImage(product);
}

function getTrendingSubtitle(product: Product, t: TFunction): string {
  const desc = product.productDesc?.trim();
  if (desc) {
    return desc.length > 52 ? `${desc.slice(0, 49)}…` : desc;
  }
  return `${collectionLabel(product.productCollection)} · ${t("common.views", { count: product.productViews })}`;
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

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDEnK7d-bZbSneNjA_TI8hpk-MOswgJksRfk6bXGS2Q0AM11Km_MdQE8-JnJIDEWXD0msf_gDKtpawD2wUa3XC5gKxdhmWlXlWIjs1D4JUZrTywctKhRJQ7y9RP-gmFJCnjG7DUU30kBS1U-WXQkN_h17nLut1_m8bl-xmj1MqD9xEESrvlBvwk8eAlcRqx_68h_15itV-X1_kCm6dA4kFIe4KvgXhIypdi80gakohu9K3yYjidvtFGUMtDmffu3O1SKvzorVj-yv-K";

const FEATURED_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAmlZ_3QqbwKJEyNI1KCv3O44HQNHbDEuDtSK9ki6b-m_bzaUle4iidlNm7SuE0pHQPZPO8Bi4aQ1VcBd-LURtHzCzOhoa9N3o68dbMSSlx6-g9BHMH-wT8x5JcDoigz9seeWAzRX2tpPH8lG8Hl-ZuHIFae6shriU9XvTv2ScYQdEjbRZvpnNRnchO7IcxUEIyJW7oaoYk-7yU7EfRWUBAZdK1Nu4KFQQsbAJ933vZ4PZZ7SiLFeclchxQaBe4L0vy83Qzd_2EXso-";

const EDITORIAL_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXv6jTfL7iP3V8g678dXeVQh5u7dU-q4bUKwiSsFVuakmtvHbAV69BQRkvkZ-61bf2c2ebLy3ecCUG1jNDfc6xrkLK8F9ak04sFegUwSxc62XBKXukYzOYNf3QJhLcwv9b6Qh5EJH--Q7_ZBGLC4aJc3TaBDeWfShkXEXJq85l554nw1ikj5jeavYhoJ7SbV4eWmpLcIvdSOFeoTMRZ311EcKcUOxYzDPyDSeSlLDCut1kNreZKGmuCIl3MqQbez6fuASajhrMIGq1";

function useDropCountdown() {
  const [remaining, setRemaining] = useState(() => ({
    h: 4,
    m: 22,
    s: 55,
  }));

  useEffect(() => {
    const end = Date.now() + (4 * 3600 + 22 * 60 + 55) * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return { h: pad(remaining.h), m: pad(remaining.m), s: pad(remaining.s) };
}

export default function ArchiveLanding(props: ArchiveLandingProps) {
  const { onAdd } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#drops") return;
    const t = window.setTimeout(() => {
      document.getElementById("drops")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);
  const { trendingDishes } = useSelector(trendingDishesRetriever);
  const trendingProducts = Array.isArray(trendingDishes) ? trendingDishes : [];
  const { newDishes } = useSelector(newDishesRetriever);
  const archiveNewJerseys = Array.isArray(newDishes) ? newDishes.slice(0, 4) : [];
  const heroProducts: Product[] = (archiveNewJerseys.length > 0 ? archiveNewJerseys : trendingProducts).slice(0, 3);

  const { h, m, s } = useDropCountdown();
  const trendingRef = useRef<HTMLDivElement>(null);
  const [trendingFlipped, setTrendingFlipped] = useState<Record<string, boolean>>({});

  const toggleTrendingFlip = (productId: string) => {
    if (!window.matchMedia("(hover: none)").matches) return;
    setTrendingFlipped((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const scrollTrending = (dir: "left" | "right") => {
    const el = trendingRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };

  return (
    <div className="jr-home min-h-screen overflow-x-hidden font-body">
      <ArchiveTopNav {...props} />
      <main>
        <section className="home-hero relative overflow-hidden pt-32 pb-16 md:pt-36 md:pb-20">
          <div className="absolute inset-0 z-0" aria-hidden>
            <img
              className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
              alt=""
              src={HERO_IMG}
            />
            {/* light scrim: the text column sits on ~96% white, so ink/ink-soft keep their contrast */}
            <div className="home-hero__scrim absolute inset-0" />
          </div>
          <div className="site-container relative z-10">
            <div className="grid grid-cols-1 min-[720px]:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="min-[720px]:col-span-7 min-[720px]:pt-6 lg:pt-16">
                <h1 className="font-monument text-[clamp(2.25rem,6.4vw,6rem)] min-[720px]:text-[clamp(2.25rem,5.6vw,6rem)] leading-[0.95] tracking-tight home-hero__title mb-6">
                  {t("home.hero.titleLine1")} <br /> <span className="home-accent">{t("home.hero.titleAccent")}</span>
                </h1>
                <p className="home-hero__lead text-lg md:text-xl leading-relaxed max-w-xl mb-8">
                  {t("home.hero.description")}
                </p>
                <NavLink
                  to="/products"
                  className="jr-btn-primary inline-flex items-center justify-center px-10 py-5 rounded-full font-headline font-bold text-sm tracking-[0.12em]"
                >
                  {t("home.hero.cta")}
                </NavLink>
              </div>
              <div className="min-[720px]:col-span-5">
                <HeroFeatured products={heroProducts} isNewDrop={archiveNewJerseys.length > 0} />
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        <div className="home-transition-strip" aria-hidden="true" />

        <HomeNewDropsSection onAdd={onAdd} />

        <section id="featured-drop" className="home-light-section py-24 scroll-mt-24">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/2 relative group">
                <div className="home-media relative rounded-lg overflow-hidden aspect-[4/5]">
                  <img
                    className="w-full h-full object-cover"
                    alt={t("home.featured.imageAlt")}
                    src={FEATURED_IMG}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="home-heading font-monument text-4xl md:text-6xl mb-6 uppercase leading-tight">
                  {t("home.featured.titleLine1")} <br />{" "}
                  <span className="home-accent">{t("home.featured.titleAccent")}</span>
                </h2>
                <p className="home-text-soft text-lg mb-12 max-w-md leading-relaxed">
                  {t("home.featured.description")}
                </p>
                <div className="mb-12">
                  <p className="home-text-soft font-headline text-xs font-bold tracking-widest uppercase mb-4">
                    {t("home.featured.timeRemaining")}
                  </p>
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="home-heading font-monument text-4xl md:text-6xl">{h}</span>
                      <span className="home-text-soft text-[10px] font-bold tracking-widest">{t("home.featured.hours")}</span>
                    </div>
                    <span className="home-gold-text font-monument text-4xl md:text-6xl">:</span>
                    <div className="flex flex-col">
                      <span className="home-heading font-monument text-4xl md:text-6xl">{m}</span>
                      <span className="home-text-soft text-[10px] font-bold tracking-widest">{t("home.featured.minutes")}</span>
                    </div>
                    <span className="home-gold-text font-monument text-4xl md:text-6xl">:</span>
                    <div className="flex flex-col">
                      <span className="home-heading font-monument text-4xl md:text-6xl">{s}</span>
                      <span className="home-text-soft text-[10px] font-bold tracking-widest">{t("home.featured.seconds")}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="jr-btn-primary w-full md:w-auto cursor-pointer border-0 px-12 py-5 rounded-full font-headline font-bold text-sm tracking-[0.2em]"
                >
                  {t("home.featured.notify")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="home-light-section py-24">
          <div className="container mx-auto px-6 md:px-12">
            <div className="mb-12">
              <h2 className="home-heading font-monument text-4xl uppercase">{t("home.archive.title")}</h2>
              <p className="home-text-soft text-base mt-3 max-w-md">{t("home.archive.subtitle")}</p>
            </div>
            {archiveNewJerseys.length === 0 ? (
              <div className="home-empty flex flex-col items-start justify-center min-h-[200px] rounded-2xl px-8 py-10">
                <p className="home-text-soft text-base mb-4">{t("home.archive.empty")}</p>
                <NavLink
                  to="/products"
                  className="home-view-all inline-flex font-headline text-sm font-bold"
                >
                  {t("home.archive.browseAll")}
                </NavLink>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {archiveNewJerseys.map((product) => (
                  <ArchiveProductCard
                    key={product._id}
                    product={product}
                    onNavigate={(id) => history.push(`/products/${id}`)}
                    onAddToCart={onAdd}
                    showNewBadge
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="home-light-section home-trending py-24 overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 mb-12">
            <div className="flex justify-between items-center">
              <h2 className="home-heading font-monument text-3xl uppercase">{t("home.trending.title")}</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  aria-label={t("home.trending.scrollLeft")}
                  className="home-round-btn h-12 w-12 cursor-pointer rounded-full border border-solid flex items-center justify-center"
                  onClick={() => scrollTrending("left")}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  type="button"
                  aria-label={t("home.trending.scrollRight")}
                  className="home-round-btn h-12 w-12 cursor-pointer rounded-full border border-solid flex items-center justify-center"
                  onClick={() => scrollTrending("right")}
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div
            ref={trendingRef}
            className="flex gap-8 px-6 md:px-12 overflow-x-auto no-scrollbar pb-12 scroll-smooth"
          >
            {trendingProducts.length === 0 ? (
              <p className="home-text-soft text-sm font-headline px-2">
                {t("home.trending.empty")}
              </p>
            ) : (
              trendingProducts.map((product: Product) => {
                const imgSrc = getProductCardImage(product);
                const backImgSrc = getTrendingBackImage(product);
                const subtitle = getTrendingSubtitle(product, t);
                const price = `$${Number(product.productPrice).toFixed(2)}`;
                const stopCardToggle = (e: React.SyntheticEvent) => e.stopPropagation();

                return (
                  <div
                    key={product._id}
                    className="trending-flip min-w-[300px] rounded-[20px] md:min-w-[400px]"
                  >
                    <div
                      className="card-wrapper h-full"
                      onClick={() => toggleTrendingFlip(product._id)}
                    >
                      <div
                        className={`card-inner ${trendingFlipped[product._id] ? "is-flipped" : ""}`}
                      >
                        <div className="card-front home-card-surface">
                          <img
                            className="trending-flip-photo"
                            alt={product.productName}
                            src={imgSrc}
                          />
                          <NavLink
                            to={`/products/${product._id}`}
                            className="absolute inset-0 z-0 block"
                            aria-label={t("common.viewNamed", { name: product.productName })}
                            onClick={stopCardToggle}
                          />
                          <div className="home-trending__scrim pointer-events-none absolute inset-0 z-[1]" />
                          <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col p-6 pt-16">
                            <NavLink
                              to={`/products/${product._id}`}
                              className="block"
                              onClick={stopCardToggle}
                            >
                              <h4 className="home-trending__name mb-2 font-monument text-xl">
                                {product.productName}
                              </h4>
                            </NavLink>
                            <p className="home-text-soft line-clamp-2 text-sm font-headline uppercase tracking-widest">
                              {subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="card-back">
                          <img
                            className="trending-flip-photo"
                            alt=""
                            src={backImgSrc}
                          />
                          <NavLink
                            to={`/products/${product._id}`}
                            className="trending-flip-back-cover-link absolute inset-0 z-0 block"
                            tabIndex={-1}
                            aria-label={t("home.trending.campaignImage", { name: product.productName })}
                            onClick={stopCardToggle}
                          />
                          <div className="home-trending__scrim pointer-events-none absolute inset-0 z-[1]" />
                          <div className="trending-flip-back-actions absolute inset-x-0 bottom-0 z-[2] flex flex-col p-6 pt-12">
                            <p className="home-text-soft mb-4 text-[10px] font-monument font-bold tracking-[0.25em]">
                              {t("home.trending.campaign")}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="home-heading text-xl font-bold">{price}</span>
                              <button
                                type="button"
                                className="trending-flip-cart-btn jr-btn-primary flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-0"
                                aria-label={t("common.addToCartNamed", { name: product.productName })}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const added = onAdd(productToCartItem(product));
                                  if (added) {
                                    sweetTopSmallSuccessAlert(t("common.addedToCart"), 1800);
                                    window.setTimeout(() => {
                                      history.push("/products");
                                    }, 0);
                                  }
                                }}
                              >
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="home-light-section py-24">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-7 order-2 md:order-1">
                <h2 className="home-heading font-monument text-4xl md:text-7xl mb-8 leading-[0.9]">
                  {t("home.roulette.titleLine1")} <br /> {t("home.roulette.titleLine2")}{" "}
                  <span className="home-accent">{t("home.roulette.titleAccent")}</span>
                </h2>
                <p className="home-text-soft text-lg leading-relaxed mb-10 max-w-xl">
                  {t("home.roulette.description")}
                </p>
                <NavLink
                  to="/roulette"
                  className="home-view-all inline-flex items-center gap-4 font-headline font-bold text-sm tracking-widest group"
                >
                  {t("home.roulette.cta")}
                  <EastIcon
                    className="shrink-0 group-hover:translate-x-2 transition-transform"
                    sx={{ fontSize: "1.25rem" }}
                    aria-hidden
                  />
                </NavLink>
              </div>
              <div className="md:col-span-5 order-1 md:order-2">
                <div className="relative">
                  <div className="rounded-lg overflow-hidden relative z-10 aspect-[3/4]">
                    <img
                      className="w-full h-full object-cover"
                      alt={t("home.roulette.imageAlt")}
                      src={EDITORIAL_IMG}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="homepage w-full overflow-x-hidden">
        <ActiveUsers />
      </div>
    </div>
  );
}
