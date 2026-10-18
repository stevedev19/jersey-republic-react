import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import {
  AUTH_BACKDROP,
  AUTH_BORDER,
  AUTH_INK,
  AUTH_MODAL_SHADOW,
  AUTH_MUTED,
  AUTH_PRIMARY_BG,
  AUTH_PRIMARY_SHADOW,
  AUTH_SURFACE,
} from "../auth/archiveAuthStyles";

export interface CartAuthRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export default function CartAuthRequiredDialog(props: CartAuthRequiredDialogProps) {
  const { open, onClose, onSignIn, onCreateAccount } = props;
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: AUTH_SURFACE,
          backgroundImage: "none",
          border: `1px solid ${AUTH_BORDER}`,
          borderRadius: "20px",
          boxShadow: AUTH_MODAL_SHADOW,
        },
      }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: AUTH_BACKDROP },
        },
      }}
    >
      <DialogTitle
        sx={{
          position: "relative",
          color: AUTH_INK,
          fontFamily: '"Monument Extended", "Monument", "Archivo", "Pretendard", "Noto Sans KR", sans-serif',
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          fontWeight: 700,
          letterSpacing: "0.04em",
          pr: 6,
          pt: 2.5,
          pb: 1,
        }}
      >
        {t("cartAuth.title")}
        <IconButton
          type="button"
          aria-label={t("common.close")}
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: AUTH_MUTED,
            "&:hover": { color: "var(--navy)", backgroundColor: "rgba(30,42,90,0.06)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 1, pt: 0 }}>
        <Box
          component="p"
          sx={{
            m: 0,
            color: AUTH_MUTED,
            fontFamily: '"Archivo", "Pretendard", "Noto Sans KR", sans-serif',
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          {t("cartAuth.body")}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
          gap: 1.5,
          px: 3,
          pb: 2.5,
          pt: 1,
        }}
      >
        <Button
          type="button"
          variant="contained"
          onClick={onSignIn}
          fullWidth
          sx={{
            borderRadius: "9999px",
            py: 1.25,
            fontWeight: 700,
            textTransform: "none",
            background: AUTH_PRIMARY_BG,
            color: "var(--white)",
            boxShadow: AUTH_PRIMARY_SHADOW,
            "&:hover": { background: AUTH_PRIMARY_BG, boxShadow: AUTH_PRIMARY_SHADOW, filter: "brightness(1.15)" },
            "&.Mui-focusVisible": { outline: "3px solid var(--gold-deep)", outlineOffset: "3px" },
          }}
        >
          {t("cartAuth.signIn")}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onCreateAccount}
          fullWidth
          sx={{
            borderRadius: "9999px",
            py: 1.25,
            fontWeight: 700,
            textTransform: "none",
            borderColor: "var(--sand)",
            color: "var(--navy)",
            "&:hover": {
              borderColor: "var(--navy)",
              backgroundColor: "rgba(30,42,90,0.04)",
            },
          }}
        >
          {t("cartAuth.createAccount")}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          fullWidth
          sx={{
            color: AUTH_MUTED,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "rgba(30,42,90,0.05)" },
          }}
        >
          {t("cartAuth.later")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
