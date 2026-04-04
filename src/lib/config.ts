const resolveBaseUrl = (): string => {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  /**
   * When REACT_APP_API_URL is missing in development, default to the same host
   * as `package.json` "proxy" so uploads/static files resolve (CRA serves the
   * app on :3000; images are usually hosted on the API, e.g. :3003).
   */
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3003".replace(/\/+$/, "");
  }

  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  return (browserOrigin || "").replace(/\/+$/, "");
};

const normalizedBase = resolveBaseUrl();

export const serverApiBase: string = normalizedBase;
export const serverApi: string = normalizedBase ? `${normalizedBase}/` : "/";

function coerceImagePath(
  imagePath: string | Record<string, unknown> | undefined | null
): string {
  if (imagePath == null) return "";
  if (typeof imagePath === "string") return imagePath.trim();
  const o = imagePath as Record<string, unknown>;
  for (const k of ["url", "path", "src", "image"]) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export const getImageUrl = (
  imagePath: string | Record<string, unknown> | undefined | null
): string => {
  const p = coerceImagePath(imagePath);
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${p}`;
    }
    return `https:${p}`;
  }
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${serverApiBase}${path}`;
};

export const Messages = {
    error1: "Something went wrong!",
    error2: "Please login first!",
    error3: "Please fulfill all inputs!",
    error4: "Message is empty!",
    error5: "Only images with jpeg, jpg, png format allowed",
}; 