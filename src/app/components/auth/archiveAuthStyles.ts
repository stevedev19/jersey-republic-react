/** Jersey Republic archive modals — shared with login & signup */

export const AUTH_SURFACE = "var(--white)";
export const AUTH_BORDER = "var(--sand)";
export const AUTH_MUTED = "var(--ink-soft)";
/** Navy accent (borders, focus); white text on it is 13.7:1. */
export const AUTH_PRIMARY = "var(--navy)";
export const AUTH_PRIMARY_HOVER = "var(--navy-light)";
/** Primary button fill + gold ring, same as .jr-btn-primary in theme.css. */
export const AUTH_PRIMARY_BG = "linear-gradient(135deg, var(--navy-light), var(--navy) 55%, var(--navy-deep))";
export const AUTH_PRIMARY_SHADOW = "inset 0 0 0 1.5px var(--gold), 0 10px 24px -12px rgba(30, 42, 90, 0.55)";
export const AUTH_INK = "var(--ink)";
/** Navy for accent text on white (12.7:1+). */
export const AUTH_PRIMARY_TEXT = "var(--navy)";
/** Modal backdrop: navy-tinted ink, not black. */
export const AUTH_BACKDROP = "rgba(20, 27, 43, 0.55)";
export const AUTH_MODAL_SHADOW = "0 24px 64px -24px rgba(20, 27, 43, 0.45)";

export const authTextFieldSx = {
  width: { xs: "100%", sm: 300 },
  mt: 1.75,
  "& .MuiOutlinedInput-root": {
    color: AUTH_INK,
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    "& fieldset": {
      borderColor: "var(--sand)",
    },
    "&:hover fieldset": {
      borderColor: "var(--gold)",
    },
    "&.Mui-focused fieldset": {
      borderWidth: "2px",
      borderColor: AUTH_PRIMARY,
    },
  },
  "& .MuiInputLabel-root": {
    color: AUTH_MUTED,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: AUTH_PRIMARY_TEXT,
  },
} as const;

export const authSubmitButtonSx = {
  mt: 3,
  px: 4,
  py: 1.25,
  minWidth: 160,
  borderRadius: "9999px",
  background: AUTH_PRIMARY_BG,
  color: "var(--white)",
  fontFamily: '"Archivo", "Pretendard", "Noto Sans KR", sans-serif',
  fontWeight: 700,
  fontSize: "0.8125rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  boxShadow: AUTH_PRIMARY_SHADOW,
  "&:hover": {
    background: AUTH_PRIMARY_BG,
    boxShadow: AUTH_PRIMARY_SHADOW,
    filter: "brightness(1.15)",
  },
  "&.Mui-focusVisible": {
    outline: "3px solid var(--gold-deep)",
    outlineOffset: "3px",
  },
} as const;

export const authOutlineButtonSx = {
  mt: 1.5,
  px: 4,
  py: 1.25,
  minWidth: 160,
  borderRadius: "9999px",
  borderWidth: "2px",
  borderColor: AUTH_PRIMARY,
  color: AUTH_PRIMARY_TEXT,
  fontFamily: '"Archivo", "Pretendard", "Noto Sans KR", sans-serif',
  fontWeight: 700,
  fontSize: "0.8125rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  "&:hover": {
    borderWidth: "2px",
    borderColor: AUTH_PRIMARY_HOVER,
    color: AUTH_PRIMARY_TEXT,
    backgroundColor: "rgba(30, 42, 90, 0.06)",
  },
} as const;

export const authModalStackSx = {
  width: { xs: "min(calc(100vw - 24px), 440px)", sm: "min(calc(100vw - 32px), 520px)", md: "680px" },
  maxWidth: "100%",
  minHeight: { xs: "auto", md: 360 },
  flexDirection: { xs: "column", md: "row" },
  alignItems: "stretch",
  outline: "none",
} as const;

export const authFormColumnSx = {
  flex: 1,
  px: { xs: 2.5, md: 4 },
  py: { xs: 3, md: 4 },
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  background: AUTH_SURFACE,
} as const;

export const authRouletteLoginStackSx = {
  width: { xs: "min(calc(100vw - 24px), 860px)", sm: "min(calc(100vw - 32px), 860px)", md: "860px" },
  maxWidth: "860px",
  minHeight: { xs: "min-content", md: 480 },
  flexDirection: { xs: "column", md: "row" },
  alignItems: "stretch",
  outline: "none",
  boxSizing: "border-box",
} as const;

export const authRouletteTextFieldSx = {
  width: { xs: "100%", sm: 320 },
  mt: 1.75,
  "& .MuiOutlinedInput-root": {
    color: AUTH_INK,
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    "& fieldset": {
      borderWidth: "1px",
      borderColor: "var(--sand)",
    },
    "&:hover fieldset": {
      borderColor: "var(--gold)",
    },
    "&.Mui-focused fieldset": {
      borderWidth: "1px",
      borderColor: AUTH_PRIMARY,
    },
  },
  "& .MuiInputLabel-root": {
    color: AUTH_MUTED,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: AUTH_PRIMARY_TEXT,
  },
} as const;
