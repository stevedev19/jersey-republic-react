import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language, setLanguage } from "../../../i18n";

/** Native names, so each option is readable regardless of the current UI language. */
const OPTIONS: { lng: Language; code: string; native: string }[] = [
  { lng: "ko", code: "KO", native: "한국어" },
  { lng: "en", code: "EN", native: "English" },
];

interface LanguageToggleProps {
  className?: string;
  /** Which edge the menu lines up with: right in the navbar bar, left inside the mobile panel. */
  align?: "left" | "right";
}

// Tailwind preflight is off in this project, so native button styles are reset explicitly.
const RESET_BTN = "m-0 cursor-pointer appearance-none border-0 font-[inherit]";

/** Language switcher dropdown (menu with radio items), keyboard and screen-reader friendly. */
export default function LanguageToggle({ className = "", align = "right" }: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentLng = (i18n.resolvedLanguage ?? i18n.language) as Language;
  const current = OPTIONS.find((o) => o.lng === currentLng) ?? OPTIONS[0];

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // Focus the active language when the menu opens.
    const idx = OPTIONS.findIndex((o) => o.lng === currentLng);
    itemRefs.current[Math.max(0, idx)]?.focus();

    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close]);

  const choose = (lng: Language) => {
    close(true);
    if (lng !== currentLng) void setLanguage(lng);
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (n: number) => items[(n + items.length) % items.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(i + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(items.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={wrapRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("language.groupLabel")}: ${current.native}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`${RESET_BTN} group flex h-9 items-center gap-1.5 rounded-full border border-solid px-3 font-grotesk text-[12px] font-medium tracking-[0.08em] transition-all duration-200 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--gold-deep)] ${
          open
            ? "border-[color:var(--navy)] bg-[color:var(--white)] text-[color:var(--navy)]"
            : "border-[color:var(--sand)] bg-[color:var(--white)] text-[color:var(--ink)] hover:border-[color:var(--navy)] hover:text-[color:var(--navy)]"
        }`}
      >
        <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
          language
        </span>
        <span lang={current.lng} className="whitespace-nowrap">
          {current.code}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] leading-none text-[color:var(--ink-soft)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          expand_more
        </span>
      </button>

      <div
        role="menu"
        aria-label={t("language.groupLabel")}
        onKeyDown={onMenuKeyDown}
        className={`absolute top-[calc(100%+10px)] z-[80] w-[200px] rounded-2xl border border-solid border-[color:var(--sand)] bg-[color:var(--white)] p-1.5 shadow-[0_20px_50px_-25px_rgba(20,27,43,0.35)] transition duration-150 ease-out ${
          align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
        } ${open ? "visible scale-100 opacity-100" : "pointer-events-none invisible scale-95 opacity-0"}`}
      >
        <p className="m-0 px-3 pb-1.5 pt-2 font-grotesk text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
          {t("language.groupLabel")}
        </p>
        {OPTIONS.map((opt, i) => {
          const active = opt.lng === currentLng;
          const translated = t(`language.${opt.lng}`);
          return (
            <button
              key={opt.lng}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              tabIndex={open ? 0 : -1}
              onClick={() => choose(opt.lng)}
              className={`${RESET_BTN} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 focus:outline-none focus-visible:bg-[rgba(30,42,90,0.08)] ${
                active ? "bg-[rgba(30,42,90,0.06)]" : "bg-transparent hover:bg-[rgba(30,42,90,0.04)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-grotesk text-[11px] font-bold tracking-[0.06em] ${
                  active ? "bg-[color:var(--navy)] text-white shadow-[inset_0_0_0_1px_var(--gold)]" : "bg-[color:var(--paper)] text-[color:var(--ink-soft)]"
                }`}
                aria-hidden
              >
                {opt.code}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  lang={opt.lng}
                  className={`text-[14px] font-semibold leading-tight ${active ? "text-[color:var(--navy)]" : "text-[color:var(--ink)]"}`}
                >
                  {opt.native}
                </span>
                {translated !== opt.native ? (
                  <span className="mt-0.5 text-[11px] leading-tight text-[color:var(--ink-soft)]">{translated}</span>
                ) : null}
              </span>
              <span
                className={`material-symbols-outlined text-[18px] leading-none text-[color:var(--navy)] transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              >
                check
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
