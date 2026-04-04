import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import confetti from "canvas-confetti";
import ArchiveTopNav, { ArchiveTopNavProps } from "../homePage/ArchiveTopNav";
import ProductService from "../../services/ProductService";
import { Product } from "../../../lib/types/product";
import { CartItem } from "../../../lib/types/search";
import { getImageUrl } from "../../../lib/config";
import { normalizeProductImages } from "../../../lib/normalizeProductImages";
import "../../../css/roulette.css";
import { getWinningIndexFromRotation, ROULETTE_SEGMENT_COUNT } from "./spinMath";

const HISTORY_KEY = "rouletteHistory";
const SPIN_MS = 4000;

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
    club: String(p.productCollection || "").replace(/_/g, " "),
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
          <div className={`relative h-full w-full ${i % 2 === 0 ? "bg-[#161b27]" : "bg-[#1a2342]"}`}>
            <div
              className="absolute left-1/2 top-1/2 flex w-[50%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-start pt-[12%] md:pt-[14%]"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * (360 / ROULETTE_SEGMENT_COUNT) + 360 / ROULETTE_SEGMENT_COUNT / 2}deg)`,
              }}
            >
              <div className="h-11 w-11 overflow-hidden rounded-full border border-[rgba(102,126,234,0.35)] bg-black/20 md:h-14 md:w-14">
                <img
                  src={seg.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <span className="mt-1 max-w-[3.5rem] truncate text-center font-grotesk text-[7px] font-bold uppercase leading-tight tracking-wide text-white/75 md:max-w-[4.5rem] md:text-[8px]">
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
  const titleRef = useRef(document.title);

  segmentsRef.current = segments;

  useEffect(() => {
    const prev = titleRef.current;
    document.title = "Jersey Roulette | Jersey Republic";
    return () => {
      document.title = prev;
    };
  }, []);

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
        colors: ["#667EEA", "#f7ba85", "#ffffff"],
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
    el.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    el.style.transform = `rotate(${nextCumulative}deg)`;
    cumulativeRotationRef.current = nextCumulative;

    stopTicks();
    let tickCount = 0;
    tickTimerRef.current = window.setInterval(() => {
      playTick();
      tickCount += 1;
      if (tickCount > 20) stopTicks();
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
    <div className="jersey-roulette-page relative min-h-screen bg-[#0e1322] text-white">
      <div className="jersey-roulette-page__ambient" aria-hidden />
      <ArchiveTopNav {...props} />
      <main className="relative z-[2] flex min-h-screen flex-col items-center overflow-x-hidden pt-24 pb-16 md:pb-24">
        <div
          className="jersey-roulette__glow pointer-events-none absolute left-1/2 top-[42%] z-[1] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{
            background: "radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <p
          className="relative z-10 mb-3 text-center font-grotesk text-[11px] font-bold uppercase tracking-[6px] text-[#667EEA]"
          style={{ letterSpacing: "6px" }}
        >
          FEELING LUCKY?
        </p>
        <h1 className="relative z-10 mb-2 text-center font-monument text-[56px] leading-[0.85] text-white uppercase md:text-[96px]">
          Jersey
          <br />
          Roulette
        </h1>
        <p className="relative z-10 mb-10 max-w-md px-6 text-center font-grotesk text-base text-[#8A94A6] md:mb-12">
          Spin the wheel. Fate picks your next kit.
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
                borderTop: "22px solid #f7ba85",
              }}
            />
          </div>

          <div
            className="relative rounded-full p-[3px]"
            style={{
              boxShadow: "0 0 60px rgba(102,126,234,0.15), inset 0 0 60px rgba(0,0,0,0.3)",
              background: "transparent",
              border: "3px solid rgba(102,126,234,0.3)",
            }}
          >
            <div
              className="relative h-[300px] w-[300px] overflow-hidden rounded-full md:h-[480px] md:w-[480px]"
              style={{ background: "#161b27" }}
            >
              <div ref={wheelRef} className="absolute inset-0" style={{ transform: "rotate(0deg)" }}>
                <RouletteWheelFace segments={segments} />
              </div>

              <button
                type="button"
                disabled={spinning || loading}
                onClick={handleSpin}
                className="absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#0e1322] bg-[#667EEA] font-monument text-sm font-bold text-white shadow-[0_0_30px_rgba(102,126,234,0.5)] transition-all hover:scale-105 hover:bg-[#4A62D8] disabled:cursor-not-allowed disabled:opacity-50 md:h-20 md:w-20 md:text-lg"
                style={{ boxShadow: "0 0 30px rgba(102,126,234,0.5)" }}
              >
                SPIN
              </button>
            </div>
          </div>
        </div>

        <section className="relative z-10 mt-14 w-full max-w-3xl px-6">
          <p className="mb-3 font-grotesk text-[10px] font-normal uppercase tracking-[4px] text-[#8A94A6]">
            Your spins
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {history.length === 0 ? (
              <span className="font-grotesk text-xs text-[#8A94A6]/70">No spins yet — give it a whirl.</span>
            ) : (
              history.map((h) => (
                <div
                  key={`${h.id}-${h.ts}`}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#161b27]"
                  title={h.name}
                >
                  <button
                    type="button"
                    className="absolute right-0.5 top-0.5 z-10 flex h-6 w-6 touch-manipulation items-center justify-center rounded-full bg-black/75 text-white/90 shadow-md ring-1 ring-white/10 transition-colors hover:bg-[#c45c6a] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#667EEA] md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus:opacity-100"
                    aria-label={`Remove ${h.name} from history`}
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

        <div className="roulette-watermark" aria-hidden>
          ROULETTE
        </div>
      </main>

      {result ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end md:justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px] md:bg-transparent"
            aria-label="Dismiss"
            onClick={closeResult}
          />
          <div
            className="jersey-roulette__result-sheet relative z-10 flex max-h-[100dvh] min-h-[100dvh] flex-col overflow-y-auto border-t border-[rgba(102,126,234,0.3)] md:max-h-[95vh] md:min-h-0 md:flex-row md:items-center md:gap-10 md:rounded-t-[24px] md:px-12 md:py-10"
            style={{
              background: "linear-gradient(to top, #161b27, rgba(22,27,39,0.98))",
              backdropFilter: "blur(10px)",
              borderRadius: "24px 24px 0 0",
              padding: "40px 24px",
            }}
          >
            <button
              type="button"
              onClick={closeResult}
              className="absolute right-4 top-4 text-[#8A94A6] transition-colors hover:text-white md:right-10 md:top-10"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <div className="mb-8 flex shrink-0 justify-center md:mb-0">
              <img
                src={result.image}
                alt=""
                className="h-40 w-40 object-contain md:h-[200px] md:w-[200px]"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4 text-center md:text-left">
              <p className="font-grotesk text-[10px] font-bold uppercase tracking-[4px] text-[#f7ba85]">
                Fate has spoken
              </p>
              <h2 className="font-monument text-3xl text-white md:text-[40px]">{result.name}</h2>
              <p className="font-grotesk text-sm uppercase tracking-[2px] text-[#8A94A6]">
                {result.club}
              </p>
              <p className="font-monument text-3xl text-[#667EEA] md:text-[32px]">
                ${Number(result.price).toFixed(2)}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    const added = onAdd(segmentToCartItem(result));
                    if (added) closeResult();
                  }}
                  className="rounded-full bg-[#667EEA] px-10 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px] text-white shadow-[0_8px_24px_rgba(102,126,234,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4A62D8]"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={spinAgain}
                  className="rounded-full border-[1.5px] border-[rgba(255,255,255,0.15)] bg-transparent px-10 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px] text-white transition-colors hover:border-[#667EEA] hover:text-[#667EEA]"
                >
                  Spin again
                </button>
                <NavLink
                  to={`/products/${result.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(102,126,234,0.4)] px-8 py-4 font-grotesk text-sm font-bold uppercase tracking-[2px] text-[#667EEA] hover:bg-[#667EEA]/10"
                  onClick={closeResult}
                >
                  View product
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
