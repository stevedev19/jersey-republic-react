import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Container, Stack } from "@mui/material";
import { NavLink } from "react-router-dom";
import Basket from "./Basket";
import BrandsMegaMenu from "../BrandsMegaMenu";
import NavAccountMenu from "./NavAccountMenu";
import { CartItem } from "../../../lib/types/search";
import { useGlobals } from "../../hooks/useGlobals";
import FloatingElements from "../FloatingElements";

interface HomeNavbarProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
  setSignupOpen: (isOpen: boolean) => void;
  setLoginOpen: (isOpen: boolean) => void;
  handleLogoutClick?: (e: React.MouseEvent<HTMLElement>) => void;
  anchorEl?: HTMLElement | null;
  handleCloseLogout?: () => void;
  handleLogoutRequest: () => void | Promise<void>;
}

export default function HomeNavbar(props: HomeNavbarProps) {
  const {
    cartItems,
    onAdd,
    onDelete,
    onDeleteAll,
    onRemove,
    setSignupOpen,
    setLoginOpen,
    handleLogoutRequest,
  } = props;
  const { authMember } = useGlobals();
  const [brandsMegaOpen, setBrandsMegaOpen] = useState(false);
  const brandsCloseTimerRef = useRef<number | null>(null);

  const clearBrandsCloseTimer = useCallback(() => {
    if (brandsCloseTimerRef.current != null) {
      window.clearTimeout(brandsCloseTimerRef.current);
      brandsCloseTimerRef.current = null;
    }
  }, []);

  const openBrandsMega = useCallback(() => {
    clearBrandsCloseTimer();
    setBrandsMegaOpen(true);
  }, [clearBrandsCloseTimer]);

  const scheduleCloseBrandsMega = useCallback(() => {
    clearBrandsCloseTimer();
    brandsCloseTimerRef.current = window.setTimeout(() => {
      setBrandsMegaOpen(false);
      brandsCloseTimerRef.current = null;
    }, 200);
  }, [clearBrandsCloseTimer]);

  const closeBrandsMega = useCallback(() => {
    clearBrandsCloseTimer();
    setBrandsMegaOpen(false);
  }, [clearBrandsCloseTimer]);

  useEffect(() => {
    if (!brandsMegaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBrandsMega();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [brandsMegaOpen, closeBrandsMega]);

  return (
    <div className="home-navbar">
      <FloatingElements />
      <Container className="navbar-container">
        <Box className="home-navbar__menu-bar">
          <Stack className="menu">
            <Box className="hover-line navbar-logo-hover">
              <NavLink to="/" className="home-navbar-logo-link">
                <Box className={"head-main-name"}>JERSEY REPUBLIC</Box>
              </NavLink>
            </Box>
            <Stack className="links">
              <Box className={"hover-line"}>
                <NavLink
                  to={{ pathname: "/", hash: "drops" }}
                  activeClassName={"underline"}
                  isActive={(_m, loc) => loc.pathname === "/" && loc.hash === "#drops"}
                >
                  Drops
                </NavLink>
              </Box>
              <Box className={"hover-line"}>
                <NavLink to="/products" activeClassName={"underline"}>
                  Shop All
                </NavLink>
              </Box>
              <Box className={"hover-line"}>
                <NavLink to="/roulette" activeClassName={"underline"}>
                  ROULETTE
                </NavLink>
              </Box>
              <Box className={"hover-line"}>
                <div
                  className="brands-mega__trigger-wrap hidden md:inline-flex"
                  onMouseEnter={openBrandsMega}
                  onMouseLeave={scheduleCloseBrandsMega}
                >
                  <button
                    type="button"
                    className={`brands-mega__trigger brands-mega__trigger-home ${brandsMegaOpen ? "brands-mega__trigger--open" : ""}`}
                    aria-expanded={brandsMegaOpen}
                    aria-controls="teams-mega-menu"
                    aria-haspopup="true"
                  >
                    Teams
                  </button>
                </div>
              </Box>
              <Box className={"hover-line md:hidden"}>
                <button
                  type="button"
                  className={`brands-mega__trigger brands-mega__trigger-home w-full text-left ${brandsMegaOpen ? "brands-mega__trigger--open" : ""}`}
                  aria-expanded={brandsMegaOpen}
                  aria-controls="teams-mega-menu"
                  onClick={() => setBrandsMegaOpen((o) => !o)}
                >
                  Teams
                </button>
              </Box>
              <Box className={"hover-line home-navbar-about-wrap"}>
                <NavLink to="/help" className="home-navbar__link-about" activeClassName="underline">
                  About
                </NavLink>
              </Box>
              <Basket
                cartItems={cartItems}
                onAdd={onAdd}
                onRemove={onRemove}
                onDelete={onDelete}
                onDeleteAll={onDeleteAll}
              />

              {!authMember ? (
                <Box>
                  <Button variant="contained" className="login-button" onClick={() => setLoginOpen(true)}>
                    Enter your Room
                  </Button>
                </Box>
              ) : (
                <NavAccountMenu
                  authMember={authMember}
                  onLoginClick={() => setLoginOpen(true)}
                  onSignOut={handleLogoutRequest}
                />
              )}
            </Stack>
          </Stack>
          <BrandsMegaMenu
            open={brandsMegaOpen}
            onMouseEnter={openBrandsMega}
            onMouseLeave={scheduleCloseBrandsMega}
            onNavigate={closeBrandsMega}
          />
        </Box>
        <Stack className={"header-frame"}>
          <Stack className={"detail"}>
            <Box className={"head-main-txt"}>World's Most Popular Jersey Web Store</Box>
            <Box className={"wel-txt"}>Own the Game. Wear the Republic</Box>
            <Box className={"service-txt"}>24 hours service</Box>
            <Box className={"signup"}>
              {!authMember ? (
                <Button variant={"contained"} className={"signup-button"} onClick={() => setSignupOpen(true)}>
                  Join the Republic
                </Button>
              ) : null}
            </Box>
          </Stack>
          <Box className={"logo-frame"}>
            <div className={"logo-img"}></div>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}
