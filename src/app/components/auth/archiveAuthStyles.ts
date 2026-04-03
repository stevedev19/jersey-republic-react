/** Jersey Republic archive modals — shared with login & signup */

export const AUTH_SURFACE = "#161b27";
export const AUTH_BORDER = "rgba(102, 126, 234, 0.35)";
export const AUTH_MUTED = "#8A94A6";
export const AUTH_PRIMARY = "#667EEA";
export const AUTH_PRIMARY_HOVER = "#4A62D8";

export const authTextFieldSx = {
  width: { xs: "100%", sm: 300 },
  mt: 1.75,
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    backgroundColor: "rgba(0,0,0,0.22)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(102,126,234,0.45)",
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
    color: AUTH_PRIMARY,
  },
} as const;

export const authSubmitButtonSx = {
  mt: 3,
  px: 4,
  py: 1.25,
  minWidth: 160,
  borderRadius: "9999px",
  backgroundColor: AUTH_PRIMARY,
  color: "#fff",
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 700,
  fontSize: "0.8125rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  boxShadow: "0 8px 28px rgba(102,126,234,0.35)",
  "&:hover": {
    backgroundColor: AUTH_PRIMARY_HOVER,
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
  color: AUTH_PRIMARY,
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 700,
  fontSize: "0.8125rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  "&:hover": {
    borderWidth: "2px",
    borderColor: AUTH_PRIMARY_HOVER,
    color: AUTH_PRIMARY_HOVER,
    backgroundColor: "rgba(102,126,234,0.12)",
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
  background: `linear-gradient(180deg, ${AUTH_SURFACE} 0%, #121722 100%)`,
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
    color: "#fff",
    borderRadius: "12px",
    backgroundColor: "rgba(0,0,0,0.22)",
    "& fieldset": {
      borderWidth: "1px",
      borderColor: "rgba(255,255,255,0.15)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(102,126,234,0.5)",
    },
    "&.Mui-focused fieldset": {
      borderWidth: "1px",
      borderColor: AUTH_PRIMARY,
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.4)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: AUTH_PRIMARY,
  },
} as const;
