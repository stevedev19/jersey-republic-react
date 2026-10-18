import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import ArchiveTopNav, { ArchiveTopNavProps } from "../homePage/ArchiveTopNav";
import ProductService from "../../services/ProductService";
import { Product } from "../../../lib/types/product";
import { CartItem } from "../../../lib/types/search";
import { getImageUrl } from "../../../lib/config";
import { normalizeProductImages } from "../../../lib/normalizeProductImages";
import { collectionLabel } from "../../components/product/archiveCardUtils";
import "../../../css/roulette.css";
import { getWinningIndexFromRotation, ROULETTE_SEGMENT_COUNT } from "./spinMath";

const HISTORY_KEY = "rouletteHistory";
const SPIN_MS = 5500;

export type JerseyRoulettePageProps = ArchiveTopNavProps;

interface HistoryEntry {
  id: string;
  name: string;
  image: string;
  ts: number;
}

interface WheelSegment {
  id: string;
  name: string;
  club: string;
  image: string;
  price: number;
  product?: Product;
}

function pieWedgeClip(index: number, total: number): string {
  const slice = 360 / total;
  const start = (-90 + index * slice) * (Math.PI / 180);
  const end = (-90 + (index + 1) * slice) * (Math.PI / 180);
  const r = 50;
  const x1 = 50 + r * Math.cos(start);
  const y1 = 50 + r * Math.sin(start);
  const x2 = 50 + r * Math.cos(end);
  const y2 = 50 + r * Math.sin(end);
  return `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
}

function productToSegment(p: Product): WheelSegment {
  const imgs = normalizeProductImages(p.productImages);
  const raw = imgs[0] || "";
  return {
    id: p._id,
    name: p.productName,
    club: p.productCollection ? collectionLabel(p.productCollection) : "",
    image: getImageUrl(raw) || "/img/noimage-list.svg",
    price: p.productPrice,
    product: p,
  };
}

function segmentToCartItem(s: WheelSegment): CartItem {
  const imgs = s.product ? normalizeProductImages(s.product.productImages) : [];
  const first = imgs.length > 0 ? imgs[0] : "/img/noimage-list.svg";
  return {
    _id: s.id,
    quantity: 1,
    name: s.name,
    price: s.price,
    image: first,
  };
}

/** Isolated from spin/loading state so 8 wedges don’t re-render every toggle. */
const RouletteWheelFace = React.memo(function RouletteWheelFace({ segments: segs }: { segments: WheelSegment[] }) {
  return (
    <>
      {segs.slice(0, ROULETTE_SEGMENT_COUNT).map((seg, i) => (
        <div
          key={`${seg.id}-${i}`}
          className="absolute inset-0"
          style={{ clipPath: pieWedgeClip(i, ROULETTE_SEGMENT_COUNT) }}
        >
          <div className={`relative h-full w-full ${i % 2 === 0 ? "bg-[color:var(--white)]" : "bg-[color:var(--cream)]"}`}>
            <div
              className="absolute left-1/2 top-1/2 flex w-[50%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-start pt-[12%] md:pt-[14%]"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * (360 / ROULETTE_SEGMENT_COUNT) + 360 / ROULETTE_SEGMENT_COUNT / 2}deg)`,
              }}
            >
              <div className="h-11 w-11 overflow-hidden rounded-full border border-[color:var(--gold)] bg-[color:var(--paper)] md:h-14 md:w-14">
                <img
                  src={seg.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <span className="mt-1 max-w-[3.5rem] truncate text-center font-grotesk text-[7px] font-bold uppercase leading-tight tracking-wide text-[color:var(--ink-soft)] md:max-w-[4.5rem] md:text-[8px]">
                {seg.club || "Kit"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
});

const PLACEHOLDER_SEGMENTS: WheelSegment[] = [
  { id: "jr-ph-0", name: "Midnight Stripe '96", club: "Archive", image: "/img/noimage-list.svg", price: 124 },
  { id: "jr-ph-1", name: "Neon Goalkeeper", club: "Editorial", image: "/img/noimage-list.svg", price: 139 },
  { id: "jr-ph-2", name: "European Nights", club: "UCL", image: "/img/noimage-list.svg", price: 149 },
  { id: "jr-ph-3", name: "Heritage Mesh", club: "Retro", image: "/img/noimage-list.svg", price: 119 },
  { id: "jr-ph-4", name: "Street Crest", club: "Lifestyle", image: "/img/noimage-list.svg", price: 99 },
  { id: "jr-ph-5", name: "Cup Final Edition", club: "Limited", image: "/img/noimage-list.svg", price: 179 },
  { id: "jr-ph-6", name: "Training Day", club: "Match", image: "/img/noimage-list.svg", price: 89 },
  { id: "jr-ph-7", name: "Vault Restock", club: "Republic", image: "/img/noimage-list.svg", price: 134 },
];

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)));
  } catch {
    /* ignore */
  }
}

export default function JerseyRoulette(props: JerseyRoulettePageProps) {
  const { onAdd } = props;
  const { t } = useTranslation();
  const [segments, setSegments] = useState<WheelSegment[]>(PLACEHOLDER_SEGMENTS);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());

  const wheelRef = useRef<HTMLDivElement>(null);
  const cumulativeRotationRef = useRef(0);
  const segmentsRef = useRef(segments);
  const tickTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const spinningRef = useRef(false);
  segmentsRef.current = segments;

  useEffect(() => {
    document.title = t("roulette.pageTitle");
    return () => {
      // restore the site title in whatever language is active when leaving
      document.title = t("meta.title");
    };
  }, [t]);

  useEffect(() => {
    const svc = new ProductService();
    let cancelled = false;
    (async () => {
      try {
        const products = await svc.getRouletteProducts(ROULETTE_SEGMENT_COUNT);
        if (cancelled) return;
        if (products.length >= ROULETTE_SEGMENT_COUNT) {
          setSegments(products.slice(0, ROULETTE_SEGMENT_COUNT).map(productToSegment));
        } else if (products.length > 0) {
          const base = products.map(productToSegment);
          const merged = [...base];
          let k = 0;
          while (merged.length < ROULETTE_SEGMENT_COUNT) {
            merged.push({ ...PLACEHOLDER_SEGMENTS[k % PLACEHOLDER_SEGMENTS.length], id: `pad-${k}-${merged.length}` });
            k++;
          }
          setSegments(merged.slice(0, ROULETTE_SEGMENT_COUNT));
        } else {
          setSegments(PLACEHOLDER_SEGMENTS);
        }
      } catch {
        if (!cancelled) setSegments(PLACEHOLDER_SEGMENTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const playTick = useCallback(() => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 920;
      g.gain.setValueAtTime(0.035, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.028);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.035);
    } catch {
      /* optional sound */
    }
  }, []);

  const stopTicks = useCallback(() => {
    if (tickTimerRef.current != null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const finishSpin = useCallback(
    (nextCumulative: number) => {
      stopTicks();
      spinningRef.current = false;
      setSpinning(false);
      const el = wheelRef.current;
      if (el) el.style.willChange = "auto";

      const idx = getWinningIndexFromRotation(nextCumulative, ROULETTE_SEGMENT_COUNT);
      const pool = segmentsRef.current;
      const winner = pool[idx] ?? pool[0];
      setResult(winner);

      confetti({
        particleCount: 64,
        spread: 70,
        ticks: 180,
        origin: { y: 0.6 },
        colors: ["#c9a227", "#1e2a5a", "#2c3c7a"], // gold, navy, navy-light
        disableForReducedMotion: true,
      });

      const entry: HistoryEntry = {
        id: winner.id,
        name: winner.name,
        image: winner.image,
        ts: Date.now(),
      };
      setHistory((prev) => {
        const nextHist = [entry, ...prev.filter((h) => !(h.id === entry.id && h.ts === entry.ts))].slice(0, 5);
        writeHistory(nextHist);
        return nextHist;
      });
    },
    [stopTicks]
  );

  const startSpinAnimation = useCallback(() => {
    const el = wheelRef.current;
    if (!el || loading || spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    setResult(null);

    const spins = Math.floor(Math.random() * 5) + 5;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + extraDegrees;
    const prev = cumulativeRotationRef.current;
    const nextCumulative = prev + totalRotation;

    el.style.willChange = "transform";
    el.style.transition = "none";
    el.style.transform = `rotate(${prev}deg)`;
    void el.offsetHeight;
    el.style.transition = `transform ${SPIN_MS / 1000}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
    el.style.transform = `rotate(${nextCumulative}deg)`;
    cumulativeRotationRef.current = nextCumulative;

    stopTicks();
    let tickCount = 0;
    const maxTicks = Math.ceil(SPIN_MS / 220) + 2;
    tickTimerRef.current = window.setInterval(() => {
      playTick();
      tickCount += 1;
      if (tickCount > maxTicks) stopTicks();
    }, 220);

    let completed = false;
    let backupId = 0;
    const finishOnce = () => {
      if (completed) return;
      completed = true;
      el.removeEventListener("transitionend", onEnd);
      window.clearTimeout(backupId);
      finishSpin(nextCumulative);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      finishOnce();
    };

    el.addEventListener("transitionend", onEnd);
    backupId = window.setTimeout(finishOnce, SPIN_MS + 400);
  }, [loading, finishSpin, playTick, stopTicks]);

  const handleSpin = () => {
    if (spinningRef.current || loading) return;
    startSpinAnimation();
  };

  const closeResult = () => setResult(null);

  const removeHistoryEntry = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = prev.filter((h) => !(h.id === entry.id && h.ts === entry.ts));
      writeHistory(next);
      return next;
    });
  }, []);

  const spinAgain = () => {
    setResult(null);
    window.setTimeout(() => startSpinAnimation(), 320);
  };

  return (
    <div className="jersey-roulette-page relative min-h-screen bg-[color:var(--jr-bg)] text-[color:var(--ink)]">
      <ArchiveTopNav {...props} />
      <main className="relative z-[2] flex min-h-screen flex-col items-center overflow-x-hidden pt-24 pb-16 md:pb-24">
        <h1 className="relative z-10 mb-2 text-center font-monument text-[56px] leading-[0.85] text-[color:var(--ink)] uppercase md:text-[96px]">
          {t("roulette.titleLine1")}
          <br />
          {t("roulette.titleLine2")}
        </h1>
        <p className="relative z-10 mb-10 max-w-md px-6 text-center font-grotesk text-base text-[color:var(--ink-soft)] md:mb-12">
          {t("roulette.subtitle")}
        </p>

        <div className="relative z-10 mt-2 flex flex-col items-center">
          {/* Pointer */}
          <div
            className="jersey-roulette__pointer absolute left-1/2 z-20 -translate-x-1/2"
            style={{ top: "-20px" }}
            aria-hidden
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "14px solid transparent",
                borderRight: "14px solid transparent",
                borderTop: "22px solid var(--navy)",
              }}
            />
          </div>

          <div
            className="relative rounded-full p-[3px]"
            style={{
              boxShadow: "inset 0 0 60px rgba(20,27,43,0.12), 0 20px 50px -25px rgba(20,27,43,0.35)",
              background: "transparent",
              border: "3px solid var(--gold)",
            }}
          >
            <div
              className="relative h-[300px] w-[300px] overflow-hidden rounded-full md:h-[480px] md:w-[480px]"
              style={{ background: "var(--jr-card)" }}
            >
              <div ref={wheelRef} className="absolute inset-0" style={{ transform: "rotate(0deg)" }}>
                <RouletteWheelFace segments={segments} />
              </div>

              <button
                type="button"
                disabled={spinning || loading}
                onClick={handleSpin}
                className="absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[color:var(--white)] font-monument text-sm font-bold jr-btn-primary disabled:cursor-not-allowed disabled:opacity-50 md:h-20 md:w-20 md:text-lg"
              >
                {t("roulette.spin")}
              </button>
            </div>
          </div>
        </div>

        <section className="relative z-10 mt-14 w-full max-w-3xl px-6">
          <p className="mb-3 font-grotesk text-[10px] font-normal uppercase tracking-[4px] text-[color:var(--ink-soft)]">
            {t("roulette.yourSpins")}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {history.length === 0 ? (
              <span className="font-grotesk text-xs text-[color:var(--ink-soft)]">{t("roulette.noSpins")}</span>
            ) : (
              history.map((h) => (
                <div
                  key={`${h.id}-${h.ts}`}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[color:var(--sand)] bg-[color:var(--white)]"
                  title={h.name}
                >
                  <button
                    type="button"
                    className="absolute right-0.5 top-0.5 z-10 flex h-6 w-6 touch-manipulation items-center justify-center rounded-full bg-[rgba(20,27,43,0.75)] text-white/90 shadow-md ring-1 ring-white/10 transition-colors hover:bg-[#b42318] hover:text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--gold-deep)] md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus:opacity-100"
                    aria-label={t("roulette.removeFromHistory", { name: h.name })}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeHistoryEntry(h);
                    }}
                  >
                    <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden>
                      close
                    </span>
                  </button>
                  <img src={h.image} alt="" className="h-full w-full object-cover" />
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {result ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end md:justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(20,27,43,0.35)] backdrop-blur-[2px] md:bg-transparent"
            aria-label={t("roulette.dismiss")}
            onClick={closeResult}
          />
          <div
            className="jersey-roulette__result-sheet relative z-10 flex max-h-[100dvh] min-h-[100dvh] flex-col overflow-y-auto border-t border-[color:var(--gold)] md:max-h-[95vh] md:min-h-0 md:flex-row md:items-center md:gap-10 md:rounded-t-[24px] md:px-12 md:py-10"
            style={{
              background: "linear-gradient(to top, var(--paper), rgba(255,255,255,0.98))",
              boxShadow: "0 -20px 50px -25px rgba(20,27,43,0.35)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px 24px 0 0",
              padding: "40px 24px",
            }}
          >
            <button
              type="button"
              onClick={closeResult}
              className="absolute right-4 top-4 text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--navy)] md:right-10 md:top-10"
              aria-label={t("common.close")}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <div className="mb-8 flex shrink-0 justify-center md:mb-0">
              <img
                src={result.image}
                alt=""
                className="h-40 w-40 object-contain md:h-[200px] md:w-[200px]"
                style={{ filter: "drop-shadow(0 20px 40px rgba(20,27,43,0.3))", mixBlendMode: "multiply" }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4 text-center md:text-left">
              <p className="font-grotesk text-[10px] font-bold uppercase tracking-[4px] text-[color:var(--gold-deep)]">
                {t("roulette.result")}
              </p>
              <h2 className="font-monument text-3xl text-[color:var(--ink)] md:text-[40px]">{result.name}</h2>
              <p className="font-grotesk text-sm uppercase tracking-[2px] text-[color:var(--ink-soft)]">
                {result.club}
              </p>
              <p className="font-monument text-3xl text-[color:var(--navy)] md:text-[32px]">
                ${Number(result.price).toFixed(2)}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    const added = onAdd(segmentToCartItem(result));
                    if (added) closeResult();
                  }}
                  className="jr-btn-primary rounded-full border-0 px-10 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px]"
                >
                  {t("roulette.addToCart")}
                </button>
                <button
                  type="button"
                  onClick={spinAgain}
                  className="rounded-full border-[1.5px] border-[color:var(--sand)] bg-[color:var(--white)] px-10 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px] text-[color:var(--navy)] transition-colors hover:border-[color:var(--navy)]"
                >
                  {t("roulette.spinAgain")}
                </button>
                <NavLink
                  to={`/products/${result.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--gold)] px-8 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px] text-[color:var(--navy)] hover:bg-[rgba(30,42,90,0.06)]"
                  onClick={closeResult}
                >
                  {t("roulette.viewProduct")}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
