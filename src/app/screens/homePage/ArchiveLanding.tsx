import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import ArchiveTopNav, { ArchiveTopNavProps } from "./ArchiveTopNav";
import ActiveUsers from "./ActiveUsers";
import { retrieveTrendingDishes, retrieveNewDishes } from "./selector";
import { Product } from "../../../lib/types/product";
import { CartItem } from "../../../lib/types/search";
import { getImageUrl } from "../../../lib/config";
import { normalizeProductImages } from "../../../lib/normalizeProductImages";
import "../../../css/home.css";

type ArchiveLandingProps = ArchiveTopNavProps;

const trendingDishesRetriever = createSelector(retrieveTrendingDishes, (trendingDishes) => ({
  trendingDishes,
}));

const newDishesRetriever = createSelector(retrieveNewDishes, (newDishes) => ({
  newDishes,
}));

const ARCHIVE_GRID_TILES = [
  {
    colSpan: "md:col-span-8",
    minH: "min-h-[280px]",
    titleClass: "font-monument text-3xl md:text-5xl text-white mb-4 line-clamp-2",
    subtitleClass: "font-headline text-primary text-sm tracking-widest font-bold",
  },
  {
    colSpan: "md:col-span-4",
    minH: "min-h-[240px]",
    titleClass: "font-monument text-2xl text-white mb-2 line-clamp-2",
    subtitleClass: "text-white/60 text-xs font-headline tracking-widest group-hover:text-white transition-colors",
  },
  {
    colSpan: "md:col-span-5",
    minH: "min-h-[240px]",
    titleClass: "font-monument text-2xl text-white uppercase line-clamp-2",
    subtitleClass: "text-outline text-sm font-headline uppercase tracking-widest",
  },
  {
    colSpan: "md:col-span-7",
    minH: "min-h-[240px]",
    titleClass: "font-monument text-2xl md:text-3xl text-white mb-2 uppercase line-clamp-2",
    subtitleClass: "text-outline text-sm",
  },
] as const;

const TRENDING_BADGES = [
  { label: "POPULAR", badgeClass: "text-primary" },
  { label: "TRENDING", badgeClass: "text-tertiary" },
  { label: "TOP VIEWS", badgeClass: "text-primary" },
  { label: "ARCHIVE", badgeClass: "text-tertiary" },
];

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

function getTrendingSubtitle(product: Product): string {
  const desc = product.productDesc?.trim();
  if (desc) {
    return desc.length > 52 ? `${desc.slice(0, 49)}…` : desc;
  }
  return `${product.productCollection.replace(/_/g, " ")} · ${product.productViews} views`;
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
  const { trendingDishes } = useSelector(trendingDishesRetriever);
  const trendingProducts = Array.isArray(trendingDishes) ? trendingDishes : [];
  const { newDishes } = useSelector(newDishesRetriever);
  const archiveNewJerseys = Array.isArray(newDishes) ? newDishes.slice(0, 4) : [];

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
    <div className="dark bg-background text-on-background selection:bg-primary selection:text-on-primary min-h-screen overflow-x-hidden font-body">
      <ArchiveTopNav {...props} />
      <main>
        <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity min-h-[100vh]"
              alt="Professional sports stadium at night under floodlights"
              src={HERO_IMG}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </div>
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="max-w-6xl">
              <h1 className="font-monument text-5xl md:text-8xl lg:text-[10rem] leading-none tracking-tighter text-white mb-8">
                WEAR THE <br /> <span className="text-primary italic">GAME.</span>
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <p className="md:col-span-6 text-outline text-lg md:text-xl font-light leading-relaxed">
                  The definitive archive of football culture. Curated, authenticated, and delivered
                  worldwide. High-performance artifacts meeting street-ready aesthetics.
                </p>
                <div className="md:col-span-6 flex md:justify-end">
                  <NavLink
                    to="/products"
                    className="inline-flex items-center justify-center bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-bold text-sm tracking-[0.2em] shadow-[0px_24px_48px_rgba(102,126,234,0.35)] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    EXPLORE THE ARCHIVE
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-[-5%] bottom-20 vertical-text hidden xl:block">
            <span className="font-monument text-surface-container-highest text-9xl uppercase opacity-20 select-none">
              REPUBLIC
            </span>
          </div>
        </section>

        <section id="drops" className="py-24 bg-surface-container-low scroll-mt-24">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/2 relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-lg blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative bg-surface-container-high rounded-lg overflow-hidden aspect-[4/5]">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Vintage football jersey fabric with embroidered crest"
                    src={FEATURED_IMG}
                  />
                  <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
                    <span className="bg-tertiary text-on-tertiary px-4 py-1 rounded-full text-[10px] font-monument font-bold tracking-widest">
                      RARE FIND
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1 rounded-full text-[10px] font-monument font-bold tracking-widest border border-white/20">
                      AUTHENTICATED
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="inline-block px-4 py-2 bg-surface-container-highest rounded-full mb-8">
                  <p className="font-headline text-primary text-xs tracking-[0.3em] font-bold uppercase">
                    NEXT DROP ARRIVING
                  </p>
                </div>
                <h2 className="font-monument text-4xl md:text-6xl text-white mb-6 uppercase leading-tight">
                  Arsenal 05/06 <br /> <span className="text-tertiary">Highbury Final</span>
                </h2>
                <p className="text-outline text-lg mb-12 max-w-md leading-relaxed">
                  The iconic maroon farewell to Highbury. Featuring gold detailing and the definitive Thierry Henry #14
                  customization. Limited to 50 verified pieces.
                </p>
                <div className="mb-12">
                  <p className="font-headline text-white/40 text-[10px] tracking-[0.4em] uppercase mb-4">
                    TIME REMAINING
                  </p>
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="font-monument text-4xl md:text-6xl text-white">{h}</span>
                      <span className="text-[10px] text-outline font-bold tracking-widest">HRS</span>
                    </div>
                    <span className="font-monument text-4xl md:text-6xl text-primary">:</span>
                    <div className="flex flex-col">
                      <span className="font-monument text-4xl md:text-6xl text-white">{m}</span>
                      <span className="text-[10px] text-outline font-bold tracking-widest">MINS</span>
                    </div>
                    <span className="font-monument text-4xl md:text-6xl text-primary">:</span>
                    <div className="flex flex-col">
                      <span className="font-monument text-4xl md:text-6xl text-white">{s}</span>
                      <span className="text-[10px] text-outline font-bold tracking-widest">SECS</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full md:w-auto bg-white text-background px-12 py-5 rounded-full font-headline font-bold text-sm tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all duration-300"
                >
                  NOTIFY ME ON DROP
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex justify-between items-end mb-16">
              <div>
                <p className="font-headline text-primary text-xs tracking-[0.3em] font-bold uppercase mb-4">
                  CURATED COLLECTIONS
                </p>
                <h2 className="font-monument text-4xl text-white uppercase">THE ARCHIVE</h2>
                <p className="text-outline text-xs font-headline tracking-widest mt-3 max-w-md">
                  Latest arrivals from the catalog — updated as new jerseys drop.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
              {archiveNewJerseys.length === 0 ? (
                <div className="md:col-span-12 flex flex-col items-start justify-center min-h-[200px] rounded-lg border border-outline-variant/20 bg-surface-container px-8 py-10">
                  <p className="text-outline text-sm font-headline mb-4">
                    New jerseys are loading or none are available yet.
                  </p>
                  <NavLink
                    to="/products"
                    className="inline-flex text-primary font-headline text-xs font-bold tracking-widest uppercase hover:text-tertiary transition-colors"
                  >
                    Browse all products →
                  </NavLink>
                </div>
              ) : (
                ARCHIVE_GRID_TILES.map((tile, i) => {
                  const product = archiveNewJerseys[i];
                  return (
                    <NavLink
                      key={product?._id ?? `archive-empty-${i}`}
                      to={product ? `/products/${product._id}` : "/products"}
                      className={`${tile.colSpan} group relative overflow-hidden rounded-lg bg-surface-container ${tile.minH} md:min-h-0 md:h-full block`}
                    >
                      {product ? (
                        <div className="card-image-wrapper card-image-wrapper--bleed md:absolute md:inset-0">
                          <img
                            className="opacity-60"
                            alt={product.productName}
                            src={getProductCardImage(product)}
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-full ${tile.minH} md:absolute md:inset-0 bg-surface-container-high flex items-center justify-center`}
                        >
                          <span className="text-outline text-xs font-headline tracking-widest uppercase px-4 text-center">
                            More in shop →
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-10 left-10 right-6">
                        <h3 className={tile.titleClass}>
                          {product ? product.productName : "New arrivals"}
                        </h3>
                        {product ? (
                          <p className={tile.subtitleClass}>
                            ${Number(product.productPrice).toFixed(2)} ·{" "}
                            <span className="text-tertiary">NEW</span>
                            {product.productViews > 0 ? (
                              <span className="text-outline"> · {product.productViews} views</span>
                            ) : null}
                          </p>
                        ) : (
                          <p className={tile.subtitleClass}>Open the catalog →</p>
                        )}
                      </div>
                    </NavLink>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-lowest overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 mb-12">
            <div className="flex justify-between items-center">
              <h2 className="font-monument text-3xl text-white uppercase">Trending Now</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  aria-label="Scroll trending left"
                  className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
                  onClick={() => scrollTrending("left")}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  type="button"
                  aria-label="Scroll trending right"
                  className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
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
              <p className="text-outline text-sm font-headline px-2">
                Popular jerseys will appear here once loaded. Open the shop or check back shortly.
              </p>
            ) : (
              trendingProducts.map((product: Product, index: number) => {
                const badge = TRENDING_BADGES[index % TRENDING_BADGES.length];
                const imgSrc = getProductCardImage(product);
                const backImgSrc = getTrendingBackImage(product);
                const subtitle = getTrendingSubtitle(product);
                const price = `$${Number(product.productPrice).toFixed(2)}`;
                const stopCardToggle = (e: React.SyntheticEvent) => e.stopPropagation();

                return (
                  <div
                    key={product._id}
                    className="trending-flip min-w-[300px] rounded-[20px] md:min-w-[400px] shadow-[0px_24px_48px_rgba(102,126,234,0.1)]"
                  >
                    <div
                      className="card-wrapper h-full"
                      onClick={() => toggleTrendingFlip(product._id)}
                    >
                      <div
                        className={`card-inner ${trendingFlipped[product._id] ? "is-flipped" : ""}`}
                      >
                        <div className="card-front bg-surface-container-high">
                          <img
                            className="trending-flip-photo"
                            alt={product.productName}
                            src={imgSrc}
                          />
                          <NavLink
                            to={`/products/${product._id}`}
                            className="absolute inset-0 z-0 block"
                            aria-label={`View ${product.productName}`}
                            onClick={stopCardToggle}
                          />
                          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/55 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col p-6 pt-16">
                            <p
                              className={`${badge.badgeClass} mb-2 text-[10px] font-monument font-bold tracking-[0.2em]`}
                            >
                              {badge.label}
                            </p>
                            <NavLink
                              to={`/products/${product._id}`}
                              className="block"
                              onClick={stopCardToggle}
                            >
                              <h4 className="mb-2 font-monument text-xl text-white transition-colors hover:text-primary">
                                {product.productName}
                              </h4>
                            </NavLink>
                            <p className="mb-6 line-clamp-2 text-sm font-headline uppercase tracking-widest text-outline">
                              {subtitle}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-white">{price}</span>
                              <button
                                type="button"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:scale-110"
                                aria-label={`Add ${product.productName} to cart`}
                                onClick={(e) => {
                                  stopCardToggle(e);
                                  onAdd(productToCartItem(product));
                                }}
                              >
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                              </button>
                            </div>
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
                            className="absolute inset-0 z-[1] block"
                            aria-label={`View ${product.productName} — campaign image`}
                            onClick={stopCardToggle}
                          />
                          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                          <p className="pointer-events-none absolute bottom-6 left-6 right-6 z-[3] text-[10px] font-monument font-bold tracking-[0.25em] text-white/80">
                            CAMPAIGN
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="py-24 bg-background border-y border-outline-variant/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-7 order-2 md:order-1">
                <p className="font-headline text-primary text-xs tracking-[0.3em] font-bold uppercase mb-6">
                  EDITORIAL STORY
                </p>
                <h2 className="font-monument text-4xl md:text-7xl text-white mb-8 leading-[0.9]">
                  STITCHED <br /> IN <span className="text-tertiary">HISTORY.</span>
                </h2>
                <p className="text-outline text-lg leading-relaxed mb-10 max-w-xl">
                  How the simple football jersey transcended the pitch to become the ultimate luxury statement. We dive
                  deep into the 90s aesthetic resurgence and the artisans who authenticate our collection.
                </p>
                <NavLink
                  to="/help"
                  className="inline-flex items-center gap-4 text-white font-headline font-bold text-sm tracking-widest group"
                >
                  READ THE FULL FEATURE
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
                </NavLink>
              </div>
              <div className="md:col-span-5 order-1 md:order-2">
                <div className="relative">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                  <div className="rounded-lg overflow-hidden relative z-10 aspect-[3/4]">
                    <img
                      className="w-full h-full object-cover"
                      alt="Editorial vintage jersey styling"
                      src={EDITORIAL_IMG}
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-surface-container-highest p-6 rounded-lg z-20 max-w-[200px]">
                    <p className="text-white font-monument text-xs mb-2">CURATOR NOTE</p>
                    <p className="text-outline text-[10px] leading-relaxed">
                      &quot;The texture of a 1996 mesh is unmistakable. It&apos;s a tactile memory.&quot;
                    </p>
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
