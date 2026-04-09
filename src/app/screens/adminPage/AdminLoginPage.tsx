import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import "../../../css/admin-saas.css";
import { ADMIN_AUTH_KEY } from "./adminAuthConstants";
import { AdminPublicNav } from "./AdminPublicNav";

export default function AdminLoginPage(): React.ReactElement {
  const history = useHistory();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const noopSignupPath = () => {
    history.push("/admin#signup");
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
        sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
        window.setTimeout(() => {
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

  return (
    <div className="jr-admin-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminPublicNav onSignupClick={noopSignupPath} />

      <main className="jr-admin-login-body">
        <div className="jr-admin-login-card">
          <p className="jr-admin-login-eyebrow">Jersey Republic</p>
          <h1 className="jr-admin-login-heading">Sign in to your account</h1>

          <form onSubmit={handleLoginSubmit} noValidate>
            {loginError ? (
              <div className="jr-admin-alert jr-admin-alert-error" role="alert">
                {loginError}
              </div>
            ) : null}
            {loginSuccess ? (
              <div className="jr-admin-alert jr-admin-alert-success" role="status">
                Signing you in…
              </div>
            ) : null}

            <div className="jr-admin-field">
              <label htmlFor="admin-login-username" className="jr-admin-field-label">
                Username
              </label>
              <input
                id="admin-login-username"
                className="jr-admin-input"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>

            <div className="jr-admin-field">
              <label htmlFor="admin-login-password" className="jr-admin-field-label">
                Password
              </label>
              <input
                id="admin-login-password"
                className="jr-admin-input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>

            <div className="jr-admin-login-row">
              <label className="jr-admin-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="jr-admin-link" onClick={() => {}}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="jr-admin-btn-primary jr-admin-login-submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="jr-admin-login-footer">
          Don&apos;t have an account?{" "}
          <Link to="/admin#signup">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
