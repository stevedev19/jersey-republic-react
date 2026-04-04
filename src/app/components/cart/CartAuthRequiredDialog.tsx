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
import {
  AUTH_BORDER,
  AUTH_MUTED,
  AUTH_PRIMARY,
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
          boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(102,126,234,0.08)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(14, 19, 34, 0.9)" },
        },
      }}
    >
      <DialogTitle
        sx={{
          position: "relative",
          color: "#fff",
          fontFamily: '"Monument Extended", "Monument", "Space Grotesk", sans-serif',
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          fontWeight: 700,
          letterSpacing: "0.04em",
          pr: 6,
          pt: 2.5,
          pb: 1,
        }}
      >
        Sign in to continue
        <IconButton
          type="button"
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: AUTH_MUTED,
            "&:hover": { color: "#fff", backgroundColor: "rgba(102,126,234,0.12)" },
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
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          You need an account to add items to your cart.
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
            backgroundColor: AUTH_PRIMARY,
            "&:hover": { backgroundColor: "#4A62D8" },
          }}
        >
          Sign In
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
            borderColor: AUTH_BORDER,
            color: "#fff",
            "&:hover": {
              borderColor: AUTH_PRIMARY,
              backgroundColor: "rgba(102,126,234,0.08)",
            },
          }}
        >
          Create Account
        </Button>
        <Button
          type="button"
          onClick={onClose}
          fullWidth
          sx={{
            color: AUTH_MUTED,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
          }}
        >
          Maybe Later
        </Button>
      </DialogActions>
    </Dialog>
  );
}
