"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./Experience.module.css";

gsap.registerPlugin(ScrollTrigger);

const teams = [
  {
    id: "manu",
    name: "Manchester United",
    shortName: "Man Utd",
    founded: "Est. 1878",
    bg: "#1a0a0a",
    accent: "#c8102e",
    tag: "#FFE500",
    jerseys: [
      { name: "Home Kit", season: "2024–25", price: "$89", type: "Home" },
      { name: "Away Kit", season: "2024–25", price: "$89", type: "Away" },
      { name: "Third Kit", season: "2024–25", price: "$95", type: "Third" },
    ],
  },
  {
    id: "mancity",
    name: "Manchester City",
    shortName: "Man City",
    founded: "Est. 1880",
    bg: "#0d1e2e",
    accent: "#6CABDD",
    tag: "#ffffff",
    jerseys: [
      { name: "Home Kit", season: "2024–25", price: "$89", type: "Home" },
      { name: "Away Kit", season: "2024–25", price: "$85", type: "Away" },
      { name: "GK Kit", season: "2024–25", price: "$92", type: "Goalkeeper" },
    ],
  },
  {
    id: "real",
    name: "Real Madrid",
    shortName: "Real Madrid",
    founded: "Est. 1902",
    bg: "#0f0f0f",
    accent: "#D4AF37",
    tag: "#ffffff",
    jerseys: [
      { name: "Home Kit", season: "2024–25", price: "$92", type: "Home" },
      { name: "Away Kit", season: "2024–25", price: "$92", type: "Away" },
      { name: "Third Kit", season: "2024–25", price: "$96", type: "Third" },
    ],
  },
  {
    id: "barca",
    name: "FC Barcelona",
    shortName: "Barcelona",
    founded: "Est. 1899",
    bg: "#0a0a1a",
    accent: "#a50044",
    tag: "#D4AF37",
    jerseys: [
      { name: "Home Kit", season: "2024–25", price: "$90", type: "Home" },
      { name: "Away Kit", season: "2024–25", price: "$90", type: "Away" },
      { name: "Third Kit", season: "2024–25", price: "$94", type: "Third" },
    ],
  },
];

function JerseyIcon({ accent, secondary }) {
  return (
    <svg
      width="48"
      height="54"
      viewBox="0 0 70 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 4 L4 18 L14 22 L14 72 L56 72 L56 22 L66 18 L52 4 L42 10 Q35 14 28 10 Z"
        fill={accent}
        stroke={secondary}
        strokeWidth="1.5"
      />
      <path
        d="M18 4 L28 10 Q35 14 42 10 L52 4 L46 2 Q35 8 24 2 Z"
        fill={secondary}
        strokeWidth="0.5"
      />
      <path d="M14 22 L4 18 L14 28 Z" fill={secondary} opacity="0.5" />
      <path d="M56 22 L66 18 L56 28 Z" fill={secondary} opacity="0.5" />
    </svg>
  );
}

export default function Experience() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const cards = cardsRef.current.filter(Boolean);
    const totalCards = cards.length;
    const segmentSize = 1 / totalCards;
    const cardYOffset = 5;
    const cardScaleStep = 0.075;

    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50 + i * cardYOffset,
        scale: 1 - i * cardScaleStep,
      });
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: `+=${window.innerHeight * (totalCards * 2)}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const activeIndex = Math.min(
          Math.floor(progress / segmentSize),
          totalCards - 1
        );
        const segProgress =
          (progress - activeIndex * segmentSize) / segmentSize;

        cards.forEach((card, i) => {
          if (i < activeIndex) {
            gsap.set(card, { yPercent: -250, rotationX: 35 });
          } else if (i === activeIndex) {
            gsap.set(card, {
              yPercent: gsap.utils.interpolate(-50, -200, segProgress),
              rotationX: gsap.utils.interpolate(0, 35, segProgress),
              scale: 1,
            });
          } else {
            const behindIndex = i - activeIndex;
            gsap.set(card, {
              yPercent: -50 + (behindIndex - segProgress) * cardYOffset,
              rotationX: 0,
              scale: 1 - (behindIndex - segProgress) * cardScaleStep,
            });
          }
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return (
    <>
      <section className={styles.intro}>
        <p className={styles.introEyebrow}>The Collection</p>
        <h1 className={styles.introTitle}>Wear the Game</h1>
      </section>

      <section className={styles.stickyCards} ref={sectionRef}>
        {teams.map((team, i) => (
          <div
            key={team.id}
            className={styles.card}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              backgroundColor: team.bg,
              zIndex: teams.length - i,
            }}
          >
            {/* Left col — team info */}
            <div className={styles.colInfo}>
              <div>
                <p
                  className={styles.cardEyebrow}
                  style={{ color: team.accent }}
                >
                  {team.founded}
                </p>
                <h2 className={styles.cardTitle}>{team.name}</h2>
              </div>
              <div className={styles.cardMeta}>
                <span
                  className={styles.cardTag}
                  style={{
                    borderColor: team.accent,
                    color: team.accent,
                  }}
                >
                  {team.jerseys.length} Kits Available
                </span>
              </div>
            </div>

            {/* Right col — jersey grid */}
            <div className={styles.colJerseys}>
              {team.jerseys.map((jersey, j) => (
                <div
                  key={j}
                  className={styles.jerseyCard}
                  style={{ animationDelay: `${j * 0.08}s` }}
                >
                  <div
                    className={styles.jerseyVisual}
                    style={{ backgroundColor: `${team.accent}18` }}
                  >
                    <JerseyIcon accent={team.accent} secondary="#ffffff" />
                  </div>
                  <div className={styles.jerseyInfo}>
                    <p
                      className={styles.jerseyType}
                      style={{ color: team.accent }}
                    >
                      {jersey.type}
                    </p>
                    <p className={styles.jerseyName}>{jersey.name}</p>
                    <p className={styles.jerseySeason}>{jersey.season}</p>
                    <p className={styles.jerseyPrice}>{jersey.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Card number */}
            <span className={styles.cardNumber} style={{ color: team.accent }}>
              0{i + 1}
            </span>
          </div>
        ))}
      </section>

      <section className={styles.outro}>
        <p className={styles.introEyebrow}>End of Season</p>
        <h1 className={styles.outroTitle}>Find Your Kit</h1>
      </section>
    </>
  );
}
