import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Modal,
  TextField,
  Stack,
  IconButton,
  Backdrop,
  Fade,
} from "@mui/material";
import { motion } from "framer-motion";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useHistory, useLocation } from "react-router-dom";
import "../../../css/admin.css";
import { ADMIN_AUTH_KEY } from "./adminAuthConstants";

const GlowingButton = styled(motion.button)<{
  fullWidth?: boolean;
  $mt?: number;
  $py?: number;
}>`
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 25px;
  padding: ${(props) => (props.$py ? `${props.$py * 8}px 24px` : "12px 24px")};
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  margin-top: ${(props) => (props.$mt ? `${props.$mt * 8}px` : "0")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const ModalContent = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  position: relative;
  outline: none;
`;

const ErrorAlert = styled(motion.div)`
  background: rgba(244, 67, 54, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.3);
  box-shadow: 0 8px 32px rgba(244, 67, 54, 0.2);
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SuccessAlert = styled(motion.div)`
  background: rgba(76, 175, 80, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.2);
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const quickLinks = [
  {
    label: "Jersey inventory",
    sub: "15 total, 11 active",
    color: "#E6F1FB",
    stroke: "#378ADD",
    path: "/admin/product/all",
  },
  {
    label: "Manage users",
    sub: "11 registered",
    color: "#E1F5EE",
    stroke: "#1D9E75",
    path: "/admin/users",
  },
  {
    label: "Add new jersey",
    sub: "Create a listing",
    color: "#EEEDFE",
    stroke: "#7F77DD",
    path: "/admin/product/all#admin-add-jersey",
  },
  {
    label: "Edit listings",
    sub: "Update prices & stock",
    color: "#FAEEDA",
    stroke: "#BA7517",
    path: "/admin/product/all",
  },
] as const;

const systemRows = [
  { key: "API status", value: "Online", dot: "#1D9E75" },
  { key: "Database", value: "Connected", dot: "#1D9E75" },
  { key: "Image storage", value: "72% used", dot: "#BA7517" },
  { key: "Last backup", value: "Today, 06:00", dot: null as string | null },
  { key: "Server", value: "localhost:3003", dot: null as string | null },
] as const;

const activities = [
  {
    text: "New jersey added — RC Lens away kit",
    time: "2 min ago",
    color: "#1D9E75",
  },
  { text: "User login — admin", time: "13:42 today", color: "#378ADD" },
  {
    text: "Stock updated — Portugal home kit (12 → 9)",
    time: "11:30 today",
    color: "#BA7517",
  },
  {
    text: "Status changed — Borussia Dortmund set to active",
    time: "Yesterday, 17:05",
    color: "#7F77DD",
  },
  {
    text: "New user registered — user_0011",
    time: "Yesterday, 14:22",
    color: "#1D9E75",
  },
  {
    text: "Low stock alert — Arsenal away kit (3 left)",
    time: "Yesterday, 09:14",
    color: "#E24B4A",
  },
] as const;

export default function AdminPage() {
  const history = useHistory();
  const location = useLocation();
  const pathTrimmed = (location.pathname || "/").replace(/\/+$/, "") || "/";
  const isAdminHome = pathTrimmed === "/admin";

  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupData, setSignupData] = useState({
    username: "",
    phone: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [, setSystemRefreshTick] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) === "1") setAdminAuthed(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleCloseLogin = () => {
    setLoginOpen(false);
    setLoginError("");
    setLoginSuccess(false);
    setLoginData({ username: "", password: "" });
  };

  const handleCloseSignup = () => {
    setSignupOpen(false);
    setSignupError("");
    setSignupSuccess(false);
    setSignupData({ username: "", phone: "", password: "" });
  };

  const dashboardStats = {
    totalUsers: 1247,
    activeUsers: 89,
    lastActivityLabel: "Online",
    totalJerseys: 15,
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");
    setSignupSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!signupData.username || !signupData.phone || !signupData.password) {
        setSignupError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (signupData.password.length < 6) {
        setSignupError("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      setSignupSuccess(true);
      setTimeout(() => {
        setSignupOpen(false);
        setSignupData({ username: "", phone: "", password: "" });
        setSignupSuccess(false);
      }, 2000);
    } catch {
      setSignupError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    setLoginSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!loginData.username || !loginData.password) {
        setLoginError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (loginData.username === "admin" && loginData.password === "admin123") {
        setLoginSuccess(true);
        setAdminAuthed(true);
        sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
        setTimeout(() => {
          setLoginOpen(false);
          setLoginData({ username: "", password: "" });
          setLoginSuccess(false);
          history.push("/admin/product/all");
        }, 900);
      } else {
        setLoginError("Invalid username or password. Please try again.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clockTime = clock.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="admin-page">
      <header className="admin-dashboard-nav">
        <div className="admin-dashboard-nav-main">
          <button
            type="button"
            className={`admin-dashboard-nav-item${isAdminHome ? " is-active" : ""}`}
            onClick={() => history.push("/admin")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className="admin-dashboard-nav-item"
            onClick={() => history.push("/admin/product/all")}
          >
            Jersey inventory
          </button>
          <button
            type="button"
            className="admin-dashboard-nav-item"
            onClick={() => history.push("/")}
          >
            Store home
          </button>
          <button type="button" className="admin-dashboard-nav-item" onClick={() => setSignupOpen(true)}>
            Signup
          </button>
          <button type="button" className="admin-dashboard-nav-item" onClick={() => setLoginOpen(true)}>
            Login
          </button>
          {adminAuthed ? (
            <>
              <button
                type="button"
                className="admin-dashboard-nav-item"
                onClick={() => {
                  sessionStorage.removeItem(ADMIN_AUTH_KEY);
                  setAdminAuthed(false);
                }}
              >
                Exit product tools
              </button>
              <button
                type="button"
                className="admin-dashboard-nav-item"
                onClick={() => history.push("/admin/product/all")}
              >
                Open inventory
              </button>
            </>
          ) : null}
        </div>
        <div className="admin-dashboard-nav-right">
          <div className="admin-dashboard-clock">
            <div className="admin-dashboard-clock-time">{clockTime}</div>
            <div className="admin-dashboard-clock-label">Local time</div>
          </div>
        </div>
      </header>

      <Container maxWidth="lg">
        <div className="admin-hero">
          <div className="admin-hero-left">
            <h1>Admin dashboard</h1>
            <p>Welcome back — Jersey Republic management system</p>
          </div>
          <div className="admin-hero-actions">
            <button type="button" onClick={() => history.push("/admin/product/all")}>
              View jerseys
            </button>
            <button
              type="button"
              onClick={() => history.push("/admin/product/all#admin-add-jersey")}
            >
              + Add jersey
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat" style={{ borderLeftColor: "#378ADD" }}>
            <div className="admin-stat-icon" style={{ background: "#E6F1FB" }}>
              <PeopleIcon sx={{ fontSize: 20, color: "#378ADD" }} />
            </div>
            <div>
              <div className="admin-stat-num">{dashboardStats.totalUsers.toLocaleString()}</div>
              <div className="admin-stat-label">Total Users</div>
              <div className="admin-stat-delta" style={{ color: "#3B6D11" }}>
                ↑ 2 this week
              </div>
            </div>
          </div>
          <div className="admin-stat" style={{ borderLeftColor: "#1D9E75" }}>
            <div className="admin-stat-icon" style={{ background: "#E1F5EE" }}>
              <GroupsIcon sx={{ fontSize: 20, color: "#1D9E75" }} />
            </div>
            <div>
              <div className="admin-stat-num">{dashboardStats.activeUsers}</div>
              <div className="admin-stat-label">Active Users</div>
              <div className="admin-stat-delta" style={{ color: "#0F6E56" }}>
                100% active
              </div>
            </div>
          </div>
          <div className="admin-stat" style={{ borderLeftColor: "#BA7517" }}>
            <div className="admin-stat-icon" style={{ background: "#FAEEDA" }}>
              <ScheduleIcon sx={{ fontSize: 20, color: "#BA7517" }} />
            </div>
            <div>
              <div className="admin-stat-num">{dashboardStats.lastActivityLabel}</div>
              <div className="admin-stat-label">Last Activity</div>
              <div className="admin-stat-delta" style={{ color: "#5a7090" }}>
                Just now
              </div>
            </div>
          </div>
          <div className="admin-stat" style={{ borderLeftColor: "#7F77DD" }}>
            <div className="admin-stat-icon" style={{ background: "#EEEDFE" }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 20, color: "#7F77DD" }} />
            </div>
            <div>
              <div className="admin-stat-num">{dashboardStats.totalJerseys}</div>
              <div className="admin-stat-label">Total Jerseys</div>
              <div className="admin-stat-delta" style={{ color: "#3B6D11" }}>
                ↑ 1 today
              </div>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-main-grid">
          <div>
            <div className="admin-quick-grid">
              {quickLinks.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className="admin-quick-link"
                  onClick={() => {
                    if (q.path.includes("#")) {
                      const [p, h] = q.path.split("#");
                      history.push(p);
                      window.setTimeout(
                        () => document.getElementById(h)?.scrollIntoView({ behavior: "smooth" }),
                        100
                      );
                    } else {
                      history.push(q.path);
                    }
                  }}
                >
                  <span
                    className="admin-quick-link-swatch"
                    style={{ background: q.color, border: `1px solid ${q.stroke}` }}
                  />
                  <span>
                    <div className="admin-quick-link-title">{q.label}</div>
                    <div className="admin-quick-link-sub">{q.sub}</div>
                  </span>
                </button>
              ))}
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <span className="admin-panel-title">System overview</span>
                <button
                  type="button"
                  className="admin-panel-refresh"
                  onClick={() => setSystemRefreshTick((t) => t + 1)}
                >
                  Auto-refresh
                </button>
              </div>
              {systemRows.map((row) => (
                <div key={row.key} className="admin-system-row">
                  <span className="admin-system-key">{row.key}</span>
                  <span className="admin-system-value">
                    {row.dot ? (
                      <span className="admin-status-dot" style={{ background: row.dot }} />
                    ) : null}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="admin-activity-panel">
            <div className="admin-activity-title">Recent activity</div>
            {activities.map((a) => (
              <div key={`${a.text}-${a.time}`} className="admin-activity-item">
                <div className="admin-activity-row">
                  <span className="admin-activity-dot" style={{ background: a.color }} />
                  <span className="admin-activity-text">{a.text}</span>
                </div>
                <div className="admin-activity-time">{a.time}</div>
              </div>
            ))}
          </aside>
        </div>
      </Container>

      <Modal
        open={signupOpen}
        onClose={handleCloseSignup}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: "blur(10px)" },
        }}
      >
        <Fade in={signupOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "400px" },
              maxWidth: "90vw",
            }}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                  Create Account
                </Typography>
                <IconButton onClick={handleCloseSignup} sx={{ color: "white" }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <form onSubmit={handleSignupSubmit}>
                <Stack spacing={3}>
                  {signupError && (
                    <ErrorAlert
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ErrorOutlineIcon sx={{ color: "#f44336", fontSize: 20 }} />
                      <Typography sx={{ color: "#f44336", fontWeight: 500 }}>{signupError}</Typography>
                    </ErrorAlert>
                  )}

                  {signupSuccess && (
                    <SuccessAlert
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircleOutlineIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                      <Typography sx={{ color: "#4caf50", fontWeight: 500 }}>
                        Account created successfully!
                      </Typography>
                    </SuccessAlert>
                  )}

                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                      "& .MuiOutlinedInput-input": { color: "white" },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                      "& .MuiOutlinedInput-input": { color: "white" },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                      "& .MuiOutlinedInput-input": { color: "white" },
                    }}
                  />

                  <GlowingButton
                    type="submit"
                    fullWidth
                    $mt={2}
                    $py={1.5}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </GlowingButton>
                </Stack>
              </form>
            </ModalContent>
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={loginOpen}
        onClose={handleCloseLogin}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: "blur(10px)" },
        }}
      >
        <Fade in={loginOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "400px" },
              maxWidth: "90vw",
            }}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                  Login
                </Typography>
                <IconButton onClick={handleCloseLogin} sx={{ color: "white" }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <form onSubmit={handleLoginSubmit}>
                <Stack spacing={3}>
                  {loginError && (
                    <ErrorAlert
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ErrorOutlineIcon sx={{ color: "#f44336", fontSize: 20 }} />
                      <Typography sx={{ color: "#f44336", fontWeight: 500 }}>{loginError}</Typography>
                    </ErrorAlert>
                  )}

                  {loginSuccess && (
                    <SuccessAlert
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircleOutlineIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                      <Typography sx={{ color: "#4caf50", fontWeight: 500 }}>
                        Login successful! Redirecting...
                      </Typography>
                    </SuccessAlert>
                  )}

                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                      "& .MuiOutlinedInput-input": { color: "white" },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "10px",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
                      },
                      "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                      "& .MuiOutlinedInput-input": { color: "white" },
                    }}
                  />

                  <GlowingButton
                    type="submit"
                    fullWidth
                    $mt={2}
                    $py={1.5}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </GlowingButton>
                </Stack>
              </form>
            </ModalContent>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
