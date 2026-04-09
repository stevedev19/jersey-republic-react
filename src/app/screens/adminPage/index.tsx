import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Modal, Backdrop, Fade } from "@mui/material";
import "../../../css/admin-saas.css";
import { ADMIN_AUTH_KEY } from "./adminAuthConstants";
import { AdminPublicNav } from "./AdminPublicNav";

export default function AdminPage(): React.ReactElement {
  const history = useHistory();
  const location = useLocation();

  const [signupOpen, setSignupOpen] = useState(false);
  const [signupData, setSignupData] = useState({
    username: "",
    phone: "",
    password: "",
  });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) === "1") setAdminAuthed(true);
  }, []);

  useEffect(() => {
    if (location.hash === "#signup") {
      setSignupOpen(true);
    }
  }, [location.hash]);

  const handleCloseSignup = () => {
    setSignupOpen(false);
    setSignupError("");
    setSignupSuccess(false);
    setSignupData({ username: "", phone: "", password: "" });
    if (location.hash === "#signup") {
      history.replace("/admin");
    }
  };

  const openSignup = () => {
    setSignupOpen(true);
    window.history.replaceState(null, "", "/admin#signup");
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
      window.setTimeout(() => {
        handleCloseSignup();
      }, 2000);
    } catch {
      setSignupError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const exitProductTools = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminAuthed(false);
  };

  return (
    <div className="jr-admin-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminPublicNav onSignupClick={openSignup} />

      <main className="jr-admin-home-main">
        <div className="jr-admin-home-inner">
          <h1 className="jr-admin-home-title">Jersey Republic</h1>
          <p className="jr-admin-home-tagline">Admin platform for your jersey storefront</p>
          <div className="jr-admin-home-ctas">
            <Link to="/admin/login" className="jr-admin-btn-primary">
              Sign In
            </Link>
            <button type="button" className="jr-admin-btn-secondary" onClick={openSignup}>
              Create account
            </button>
          </div>

          {adminAuthed ? (
            <div className="jr-admin-signedin">
              <p>You&apos;re signed in to product tools.</p>
              <div className="jr-admin-signedin-actions">
                <Link to="/admin/product/all" className="jr-admin-btn-primary">
                  Open inventory
                </Link>
                <button type="button" className="jr-admin-btn-secondary" onClick={exitProductTools}>
                  Sign out of tools
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Modal
        open={signupOpen}
        onClose={handleCloseSignup}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          className: "jr-admin-modal-backdrop",
          timeout: 300,
        }}
      >
        <Fade in={signupOpen}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="jr-admin-signup-title"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 440,
              padding: "0 16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <div className="jr-admin-modal-card">
              <div className="jr-admin-modal-header">
                <h2 id="jr-admin-signup-title" className="jr-admin-modal-title">
                  Create account
                </h2>
                <button
                  type="button"
                  className="jr-admin-modal-close"
                  aria-label="Close"
                  onClick={handleCloseSignup}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSignupSubmit} noValidate>
                {signupError ? (
                  <div className="jr-admin-alert jr-admin-alert-error" role="alert">
                    {signupError}
                  </div>
                ) : null}
                {signupSuccess ? (
                  <div className="jr-admin-alert jr-admin-alert-success" role="status">
                    Account created successfully.
                  </div>
                ) : null}

                <div className="jr-admin-field">
                  <label htmlFor="admin-signup-username" className="jr-admin-field-label">
                    Username
                  </label>
                  <input
                    id="admin-signup-username"
                    className="jr-admin-input"
                    autoComplete="username"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  />
                </div>

                <div className="jr-admin-field">
                  <label htmlFor="admin-signup-phone" className="jr-admin-field-label">
                    Phone number
                  </label>
                  <input
                    id="admin-signup-phone"
                    className="jr-admin-input"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone number"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  />
                </div>

                <div className="jr-admin-field">
                  <label htmlFor="admin-signup-password" className="jr-admin-field-label">
                    Password
                  </label>
                  <input
                    id="admin-signup-password"
                    className="jr-admin-input"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="jr-admin-btn-primary jr-admin-login-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account…" : "Create account"}
                </button>
              </form>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
