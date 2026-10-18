import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

export const LANGUAGES = ["ko", "en"] as const;
export type Language = typeof LANGUAGES[number];

/** Korean is the site's primary language; English is the fallback for missing keys. */
export const DEFAULT_LANGUAGE: Language = "ko";

const STORAGE_KEY = "jr-lang";
const OG_LOCALES: Record<Language, string> = { ko: "ko_KR", en: "en_US" };

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

function readSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    /* storage blocked — fall through to the default */
  }
  return DEFAULT_LANGUAGE;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Keeps <html lang>, the title, the meta description and Open Graph tags in sync with the language. */
function applyDocumentLanguage(lng: Language) {
  const t = i18n.getFixedT(lng);
  const title = t("meta.title");
  const description = t("meta.description");

  document.documentElement.lang = lng;
  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", OG_LOCALES[lng]);
  setMeta("property", "og:locale:alternate", OG_LOCALES[lng === "ko" ? "en" : "ko"]);
}

i18n.on("languageChanged", (lng) => {
  applyDocumentLanguage(isLanguage(lng) ? lng : DEFAULT_LANGUAGE);
});

/** Switches language and remembers the visitor's explicit choice for the next visit. */
export function setLanguage(lng: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  return i18n.changeLanguage(lng);
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: readSavedLanguage(),
  fallbackLng: "en",
  supportedLngs: [...LANGUAGES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
