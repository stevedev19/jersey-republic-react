import React from "react";
import { NavLink } from "react-router-dom";

type AdminPublicNavProps = {
  onSignupClick: () => void;
};

export function AdminPublicNav({ onSignupClick }: AdminPublicNavProps): React.ReactElement {
  return (
    <header className="jr-admin-nav">
      <NavLink to="/admin" className="jr-admin-nav-logo">
        Jersey Republic
      </NavLink>
      <nav className="jr-admin-nav-links" aria-label="Admin navigation">
        <NavLink
          to="/admin"
          exact
          className="jr-admin-nav-link"
          activeClassName="is-active"
        >
          Home
        </NavLink>
        <NavLink
          to="/admin/login"
          className="jr-admin-nav-link"
          activeClassName="is-active"
        >
          Login
        </NavLink>
        <button type="button" className="jr-admin-nav-link" onClick={onSignupClick}>
          Signup
        </button>
      </nav>
    </header>
  );
}
