const resolveBaseUrl = (): string => {
  const envUrl = process.env.REACT_APP_API_URL;
  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const rawBase = envUrl || browserOrigin || "";

  return rawBase.replace(/\/+$/, "");
};

const normalizedBase = resolveBaseUrl();

export const serverApiBase: string = normalizedBase;
export const serverApi: string = normalizedBase ? `${normalizedBase}/` : "/";

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${serverApiBase}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

export const Messages = {
    error1: "Something went wrong!",
    error2: "Please login first!",
    error3: "Please fulfill all inputs!",
    error4: "Message is empty!",
    error5: "Only images with jpeg, jpg, png format allowed",
}; 