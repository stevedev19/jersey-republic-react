import React, { useState, useRef, useEffect, useCallback } from "react";
import BrandsMegaMenu from "../../components/BrandsMegaMenu";
import { NavLink } from "react-router-dom";
import Basket from "../../components/headers/Basket";
import NavAccountMenu from "../../components/headers/NavAccountMenu";
import { CartItem } from "../../../lib/types/search";
import { useGlobals } from "../../hooks/useGlobals";

export interface ArchiveTopNavProps {
  cartItems: CartItem[];
  /** Returns true if the item was added; false if login was required instead. */
  onAdd: (item: CartItem) => boolean;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
  setSignupOpen: (isOpen: boolean) => void;
  setLoginOpen: (isOpen: boolean) => void;
  anchorEl?: HTMLElement | null;
  handleLogoutClick?: (e: React.MouseEvent<HTMLElement>) => void;
  handleCloseLogout?: () => void;
  handleLogoutRequest: () => void | Promise<void>;
}

export default function ArchiveTopNav(props: ArchiveTopNavProps) {
  const {
    cartItems,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll,
    setLoginOpen,
    handleLogoutRequest,
  } = props;
  const { authMember } = useGlobals();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileOpen) closeBrandsMega();
  }, [mobileOpen, closeBrandsMega]);

  const linkMain =
    "font-grotesk text-[14px] font-normal uppercase tracking-[0.1em] text-[rgba(255,255,255,0.7)] border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-white hover:text-white";
  const linkMainActive =
    "border-b-2 !border-[#b9c3ff] !text-[#b9c3ff] pb-[4px] hover:!border-[#b9c3ff] hover:!text-[#b9c3ff]";

  const linkAbout =
    "font-grotesk text-[12px] font-normal uppercase tracking-[0.1em] text-[rgba(255,255,255,0.5)] border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-[rgba(255,255,255,0.8)] hover:text-[rgba(255,255,255,0.8)]";
  const linkAboutActive =
    "border-b-2 !border-[#b9c3ff] !text-[#b9c3ff] pb-[4px] hover:!border-[#b9c3ff] hover:!text-[#b9c3ff]";

  return (
    <nav
      className="stitch-navbar fixed left-0 right-0 top-0 z-50 flex w-full items-center glass-nav"
      aria-label="Main navigation"
    >
      <div className="flex h-full w-full max-w-[100vw] items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
          <NavLink
            to="/"
            className="stitch-navbar-logo shrink-0 cursor-pointer border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-white/90"
          >
            JERSEY REPUBLIC
          </NavLink>
          <div
            className={`${
              mobileOpen ? "flex" : "hidden"
            } absolute left-0 top-full z-[60] w-full flex-col gap-5 border-b border-[rgba(68,70,83,0.2)] bg-[rgba(22,24,39,0.98)] px-6 py-4 backdrop-blur-md md:relative md:top-auto md:z-auto md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:px-0 md:py-0`}
          >
            <NavLink
              to={{ pathname: "/", hash: "drops" }}
              className={linkMain}
              activeClassName={linkMainActive}
              isActive={(_match, loc) => loc.pathname === "/" && loc.hash === "#drops"}
              onClick={() => setMobileOpen(false)}
            >
              Drops
            </NavLink>
            <NavLink
              to="/products"
              className={linkMain}
              activeClassName={linkMainActive}
              onClick={() => setMobileOpen(false)}
            >
              Shop All
            </NavLink>
            <NavLink
              to="/roulette"
              className={linkMain}
              activeClassName={linkMainActive}
              onClick={() => setMobileOpen(false)}
            >
              ROULETTE
            </NavLink>
            <div
              className="brands-mega__trigger-wrap hidden md:inline-flex"
              onMouseEnter={openBrandsMega}
              onMouseLeave={scheduleCloseBrandsMega}
            >
              <button
                type="button"
                className={`brands-mega__trigger ${linkMain} ${brandsMegaOpen ? "brands-mega__trigger--open" : ""}`}
                aria-expanded={brandsMegaOpen}
                aria-controls="teams-mega-menu"
                aria-haspopup="true"
              >
                Teams
              </button>
            </div>
            <button
              type="button"
              className={`${linkMain} w-full text-left md:hidden ${brandsMegaOpen ? linkMainActive : ""}`}
              aria-expanded={brandsMegaOpen}
              aria-controls="teams-mega-menu"
              onClick={() => setBrandsMegaOpen((o) => !o)}
            >
              Teams
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 md:gap-6">
          <NavLink
            to="/help"
            className={`${linkAbout} hidden md:inline-flex`}
            activeClassName={linkAboutActive}
          >
            About
          </NavLink>
          <div className="hidden h-10 w-[192px] shrink-0 items-center rounded-full border border-[rgba(68,70,83,0.15)] bg-[rgba(37,41,58,0.4)] px-4 py-2 lg:flex">
            <span className="material-symbols-outlined shrink-0 text-sm text-[#8f909e]">search</span>
            <input
              className="font-grotesk ml-2 min-w-0 flex-1 border-none bg-transparent text-xs uppercase leading-none tracking-widest text-[#dee1f7] outline-none placeholder:text-[#8f909e]/50 placeholder:uppercase focus:ring-0"
              placeholder="SEARCH ARCHIVE..."
              type="search"
              aria-label="Search archive"
            />
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <NavLink
              to="/help"
              className={`${linkAbout} md:hidden`}
              activeClassName={linkAboutActive}
              onClick={() => setMobileOpen(false)}
            >
              About
            </NavLink>
            <NavAccountMenu
              authMember={authMember}
              onLoginClick={() => setLoginOpen(true)}
              onSignOut={handleLogoutRequest}
            />
            <div className="text-[#b9c3ff] transition-transform hover:scale-105 active:scale-95 [&_.MuiIconButton-root]:text-[#b9c3ff] [&_.MuiSvgIcon-root]:text-[#b9c3ff]">
              <Basket
                cartItems={cartItems}
                onAdd={onAdd}
                onRemove={onRemove}
                onDelete={onDelete}
                onDeleteAll={onDeleteAll}
              />
            </div>
            <button
              type="button"
              className="text-[#b9c3ff] md:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      <BrandsMegaMenu
        open={brandsMegaOpen}
        onMouseEnter={openBrandsMega}
        onMouseLeave={scheduleCloseBrandsMega}
        onNavigate={() => {
          closeBrandsMega();
          setMobileOpen(false);
        }}
      />
    </nav>
  );
}
