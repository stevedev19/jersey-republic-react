import React, { useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Modal, 
  TextField, 
  Stack,
  IconButton,
  Backdrop,
  Fade
} from "@mui/material";
import { motion } from "framer-motion";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import "../../../css/admin.css";

// Styled Components for Glassmorphism
const GlassNavbar = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 15px 30px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GlowingButton = styled(motion.button)<{ fullWidth?: boolean; $mt?: number; $py?: number }>`
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 25px;
  padding: ${props => props.$py ? `${props.$py * 8}px 24px` : '12px 24px'};
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  margin-top: ${props => props.$mt ? `${props.$mt * 8}px` : '0'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  &::before {
    content: '';
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

const DashboardCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 107, 53, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
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

const SphereContainer = styled(motion.div)`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 40px auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sphere = styled(motion.div)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b35, #f7931e, #4ecdc4, #44a08d);
  background-size: 400% 400%;
  position: relative;
  box-shadow: 
    0 0 50px rgba(255, 107, 53, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 20%;
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    filter: blur(10px);
  }
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

export default function AdminPage() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupData, setSignupData] = useState({
    username: "",
    phone: "",
    password: ""
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors when modals are closed
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

  // Mock dashboard data
  const dashboardStats = {
    totalUsers: 1247,
    activeLogins: 89,
    lastActivity: "2 min ago"
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");
    setSignupSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock validation
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

      // Mock successful signup
      setSignupSuccess(true);
      setTimeout(() => {
        setSignupOpen(false);
        setSignupData({ username: "", phone: "", password: "" });
        setSignupSuccess(false);
      }, 2000);
    } catch (error) {
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

    // Simulate API call with validation
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock validation - replace with actual API call
      if (!loginData.username || !loginData.password) {
        setLoginError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Mock authentication - replace with actual API call
      if (loginData.username === "admin" && loginData.password === "admin123") {
        setLoginSuccess(true);
        setTimeout(() => {
          setLoginOpen(false);
          setLoginData({ username: "", password: "" });
          setLoginSuccess(false);
        }, 2000);
      } else {
        setLoginError("Invalid username or password. Please try again.");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <Container maxWidth="lg">
        {/* Glass-style Navbar */}
        <GlassNavbar
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: "linear-gradient(45deg, #ff6b35, #f7931e)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(255, 107, 53, 0.5)"
            }}
          >
            Admin Panel
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <GlowingButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = "/"}
            >
              Home
            </GlowingButton>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>|</Typography>
            <GlowingButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSignupOpen(true)}
            >
              Signup
            </GlowingButton>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>|</Typography>
            <GlowingButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLoginOpen(true)}
            >
              Login
            </GlowingButton>
          </Stack>
        </GlassNavbar>

        {/* Animated Sphere */}
        <SphereContainer
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <Sphere
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </SphereContainer>

        {/* Dashboard Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3, mt: 4 }}>
          <DashboardCard
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <PeopleIcon sx={{ fontSize: 48, color: "#ff6b35", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
              {dashboardStats.totalUsers.toLocaleString()}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Total Users
            </Typography>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <LoginIcon sx={{ fontSize: 48, color: "#f7931e", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
              {dashboardStats.activeLogins}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Active Logins
            </Typography>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <ScheduleIcon sx={{ fontSize: 48, color: "#4ecdc4", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
              {dashboardStats.lastActivity}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Last Activity
            </Typography>
          </DashboardCard>
        </Box>

        {/* Signup Modal */}
        <Modal
          open={signupOpen}
          onClose={handleCloseSignup}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: "blur(10px)" }
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
                maxWidth: "90vw"
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
                    {/* Error Alert */}
                    {signupError && (
                      <ErrorAlert
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ErrorOutlineIcon sx={{ color: "#f44336", fontSize: 20 }} />
                        <Typography sx={{ color: "#f44336", fontWeight: 500 }}>
                          {signupError}
                        </Typography>
                      </ErrorAlert>
                    )}

                    {/* Success Alert */}
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
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)"
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 107, 53, 0.5)"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff6b35"
                          }
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)"
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "white"
                        }
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
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)"
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 107, 53, 0.5)"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff6b35"
                          }
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)"
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "white"
                        }
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
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)"
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 107, 53, 0.5)"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff6b35"
                          }
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)"
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "white"
                        }
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
                        cursor: isLoading ? 'not-allowed' : 'pointer'
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

        {/* Login Modal */}
        <Modal
          open={loginOpen}
          onClose={handleCloseLogin}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: "blur(10px)" }
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
                maxWidth: "90vw"
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
                    {/* Error Alert */}
                    {loginError && (
                      <ErrorAlert
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ErrorOutlineIcon sx={{ color: "#f44336", fontSize: 20 }} />
                        <Typography sx={{ color: "#f44336", fontWeight: 500 }}>
                          {loginError}
                        </Typography>
                      </ErrorAlert>
                    )}

                    {/* Success Alert */}
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
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)"
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 107, 53, 0.5)"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff6b35"
                          }
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)"
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "white"
                        }
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
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)"
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 107, 53, 0.5)"
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff6b35"
                          }
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)"
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "white"
                        }
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
                        cursor: isLoading ? 'not-allowed' : 'pointer'
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
      </Container>
    </div>
  );
}
