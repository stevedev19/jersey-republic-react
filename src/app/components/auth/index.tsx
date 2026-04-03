import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { Box, Button, Stack, TextField } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { T } from "../../../lib/types/common";
import MemberService from "../../services/MemberService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { Messages } from "../../../lib/config";
import { LoginInput, MemberInput } from "../../../lib/types/member";
import { useGlobals } from "../../hooks/useGlobals";
import {
  AUTH_BORDER,
  AUTH_PRIMARY,
  AUTH_SURFACE,
  authFormColumnSx,
  authModalStackSx,
  authOutlineButtonSx,
  authRouletteLoginStackSx,
  authRouletteTextFieldSx,
  authSubmitButtonSx,
  authTextFieldSx,
} from "./archiveAuthStyles";
import { ROULETTE_LOGIN_JERSEY_IMG } from "./rouletteLoginAssets";
import "./rouletteLoginModal.css";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  paper: {
    backgroundColor: AUTH_SURFACE,
    border: `1px solid ${AUTH_BORDER}`,
    borderRadius: 20,
    boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(102,126,234,0.08)",
    padding: 0,
    outline: "none",
    maxHeight: "92vh",
    overflow: "hidden",
  },
  /** Softer rim on /roulette login — lifts off backdrop */
  paperRoulette: {
    backgroundColor: AUTH_SURFACE,
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 20,
    boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(102,126,234,0.08)",
    padding: 0,
    outline: "none",
    maxHeight: "92vh",
    overflow: "hidden",
  },
  backdrop: {
    backgroundColor: "rgba(14, 19, 34, 0.9)",
  },
}));

const modalImageWrapSx = {
  display: { xs: "none", md: "block" },
  position: "relative" as const,
  width: { md: "42%" },
  flexShrink: 0,
  m: { md: 1.5 },
  ml: { md: 1.5 },
  mt: { md: 1.5 },
  mb: { md: 1.5 },
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(102, 126, 234, 0.28)",
  alignSelf: "stretch",
  minHeight: { md: 320 },
};

const modalImageWrapRouletteSx = {
  display: { xs: "none", md: "block" },
  position: "relative" as const,
  width: { md: "45%" },
  flexShrink: 0,
  alignSelf: "stretch",
  minHeight: { md: 480 },
  height: { md: "auto" },
  overflow: "hidden",
  borderRadius: { md: "20px 0 0 20px" },
  borderRight: { md: "1px solid rgba(102, 126, 234, 0.2)" },
};

interface AuthenticationModalProps {
  signupOpen: boolean;
  loginOpen: boolean;
  handleSignupClose: () => void;
  handleLoginClose: () => void;
  setSignupOpen: (open: boolean) => void;
  /** From App: `isRouletteRoute && loginOpen` — avoids route mismatch inside portals. */
  rouletteLogin: boolean;
}

export default function AuthenticationModal(props: AuthenticationModalProps) {
  const { signupOpen, loginOpen, handleSignupClose, handleLoginClose, setSignupOpen, rouletteLogin } = props;
  const isRouletteLogin = rouletteLogin;

  const classes = useStyles();
  const [memberNick, setMemberNick] = useState<string>("");
  const [memberPhone, setMemberPhone] = useState<string>("");
  const [memberPassword, setMemberPassword] = useState<string>("");
  const { setAuthMember } = useGlobals();

  const handleUserName = (e: T) => {
    setMemberNick(e.target.value);
  };

  const handlePhone = (e: T) => {
    setMemberPhone(e.target.value);
  };

  const handlePassword = (e: T) => {
    setMemberPassword(e.target.value);
  };

  const handlePasswordKeyDown = (e: T) => {
    if (e.key === "Enter" && signupOpen) {
      handleSignupRequest().then();
    } else if (e.key === "Enter" && loginOpen) {
      handleLoginRequest().then();
    }
  };

  const handleSignupRequest = async () => {
    try {
      const isFullFill = memberNick !== "" && memberPhone !== "" && memberPassword !== "";
      if (!isFullFill) throw new Error(Messages.error3);
      const signupInput: MemberInput = {
        memberNick: memberNick,
        memberPhone: memberPhone,
        memberPassword: memberPassword,
      };

      const member = new MemberService();
      const result = await member.signup(signupInput);

      setAuthMember(result);
      handleSignupClose();
    } catch (err) {
      console.log(err);
      handleSignupClose();
      sweetErrorHandling(err).then();
    }
  };

  const handleLoginRequest = async () => {
    try {
      const isFullFill = memberNick !== "" && memberPassword !== "";
      if (!isFullFill) throw new Error(Messages.error3);
      const loginInput: LoginInput = {
        memberNick: memberNick,
        memberPassword: memberPassword,
      };

      const member = new MemberService();
      const result = await member.login(loginInput);

      setAuthMember(result);
      handleLoginClose();
    } catch (err) {
      console.log(err);
      handleLoginClose();
      sweetErrorHandling(err).then();
    }
  };

  const switchToSignup = () => {
    handleLoginClose();
    setSignupOpen(true);
  };

  const backdropSlotProps = {
    timeout: 500,
    classes: { root: classes.backdrop },
  };

  const loginStackSx = isRouletteLogin ? authRouletteLoginStackSx : authModalStackSx;
  const loginFieldSx = isRouletteLogin ? authRouletteTextFieldSx : authTextFieldSx;

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={signupOpen}
        onClose={handleSignupClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={backdropSlotProps}
      >
        <Fade in={signupOpen}>
          <Stack className={classes.paper} direction="row" sx={{ ...authModalStackSx, width: { xs: "min(calc(100vw - 24px), 440px)", sm: "min(calc(100vw - 32px), 520px)", md: "760px" } }}>
            <Stack sx={modalImageWrapSx}>
              <img
                src="/img/auth.jpg"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 320,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(102,126,234,0.12) 0%, transparent 55%)",
                  pointerEvents: "none",
                }}
              />
            </Stack>
            <Stack sx={authFormColumnSx}>
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  color: AUTH_PRIMARY,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Join the republic
              </p>
              <h2
                id="transition-modal-title"
                style={{
                  margin: "6px 0 8px",
                  fontFamily: '"Monument Extended", "Monument", sans-serif',
                  fontWeight: 800,
                  fontSize: "clamp(1.35rem, 4vw, 1.65rem)",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "center",
                  lineHeight: 1.05,
                }}
              >
                Create account
              </h2>
              <TextField
                sx={authTextFieldSx}
                id="signup-username"
                label="Username"
                variant="outlined"
                onChange={handleUserName}
              />
              <TextField sx={authTextFieldSx} id="signup-phone" label="Phone number" variant="outlined" onChange={handlePhone} />
              <TextField
                sx={authTextFieldSx}
                id="signup-password"
                label="Password"
                variant="outlined"
                type="password"
                onChange={handlePassword}
                onKeyDown={handlePasswordKeyDown}
              />
              <Button
                variant="contained"
                disableElevation
                sx={authSubmitButtonSx}
                onClick={handleSignupRequest}
                startIcon={<LoginIcon sx={{ fontSize: 20 }} />}
              >
                Sign up
              </Button>
            </Stack>
          </Stack>
        </Fade>
      </Modal>

      <Modal
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
        className={classes.modal}
        open={loginOpen}
        onClose={handleLoginClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={backdropSlotProps}
      >
        <Fade in={loginOpen}>
          <Box
            sx={
              isRouletteLogin
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    outline: "none",
                    maxWidth: "min(calc(100vw - 32px), 860px)",
                    maxHeight: "calc(100vh - 32px)",
                  }
                : {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }
            }
          >
            <Stack
              className={isRouletteLogin ? classes.paperRoulette : classes.paper}
              direction="row"
              sx={loginStackSx}
            >
              {isRouletteLogin ? (
                <Stack sx={modalImageWrapRouletteSx} className="login-image">
                  <img src={ROULETTE_LOGIN_JERSEY_IMG} alt="" className="login-image__img" />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: 24,
                      zIndex: 2,
                      textAlign: "left",
                      pointerEvents: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "3px",
                        color: "#f7ba85",
                        textTransform: "uppercase",
                      }}
                    >
                      MEMBERS ONLY
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: '"Monument Extended", "Monument", sans-serif',
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.1,
                        textTransform: "uppercase",
                      }}
                    >
                      SPIN. WIN. WEAR.
                    </p>
                  </div>
                </Stack>
              ) : (
                <Stack sx={modalImageWrapSx}>
                  <img
                    src="/img/auth.jpg"
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 320,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(135deg, rgba(102,126,234,0.12) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }}
                  />
                </Stack>
              )}
              <Stack
                sx={{
                  ...authFormColumnSx,
                  borderRadius: isRouletteLogin ? { xs: "20px", md: "0 20px 20px 0" } : undefined,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: isRouletteLogin ? "0.25em" : "0.35em",
                    color: AUTH_PRIMARY,
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Member access
                </p>
                <h2
                  id="login-modal-title"
                  style={{
                    margin: "6px 0 0",
                    fontFamily: '"Monument Extended", "Monument", sans-serif',
                    fontWeight: 800,
                    fontSize: "clamp(1.35rem, 4vw, 1.65rem)",
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    textAlign: "center",
                    lineHeight: 1.05,
                  }}
                >
                  Log in
                </h2>
                {isRouletteLogin ? (
                  <p
                    style={{
                      margin: "12px 0 20px",
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 13,
                      color: "#8A94A6",
                      textAlign: "center",
                      lineHeight: 1.45,
                      maxWidth: 320,
                    }}
                  >
                    Log in to spin the wheel
                    <br />
                    and claim your next kit.
                  </p>
                ) : null}
                <TextField sx={loginFieldSx} id="login-username" label="Username" variant="outlined" onChange={handleUserName} />
                <TextField
                  sx={loginFieldSx}
                  id="login-password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  onChange={handlePassword}
                  onKeyDown={handlePasswordKeyDown}
                />
                <Button
                  variant="contained"
                  disableElevation
                  sx={authSubmitButtonSx}
                  onClick={handleLoginRequest}
                  startIcon={<LoginIcon sx={{ fontSize: 20 }} />}
                >
                  Log in
                </Button>
                <Button
                  variant="outlined"
                  disableElevation
                  sx={authOutlineButtonSx}
                  onClick={switchToSignup}
                  startIcon={<PersonAddIcon sx={{ fontSize: 20 }} />}
                >
                  Sign up
                </Button>
              </Stack>
            </Stack>
            {isRouletteLogin ? (
              <>
                <p className="roulette-login-modal__teaser-label">FEELING LUCKY?</p>
                <div className="roulette-login-modal__wheel" aria-hidden />
              </>
            ) : null}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
