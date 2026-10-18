import React, { useState, useRef, useEffect, useCallback } from "react";
import BrandsMegaMenu from "../../components/BrandsMegaMenu";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Basket from "../../components/headers/Basket";
import NavAccountMenu from "../../components/headers/NavAccountMenu";
import LanguageToggle from "../../components/headers/LanguageToggle";
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
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
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

  // Glass bar: ink on rgba(255,255,255,.88) ≈ 15:1, navy hover/active ≈ 12:1, gold underline is decorative.
  const linkMain =
    "whitespace-nowrap font-grotesk text-[14px] font-normal uppercase tracking-[0.1em] text-[color:var(--ink)] border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-[color:var(--navy)] hover:text-[color:var(--navy)]";
  const linkMainActive =
    "border-b-2 !border-[color:var(--gold)] !text-[color:var(--navy)] pb-[4px] hover:!border-[color:var(--gold)] hover:!text-[color:var(--navy)]";

  const linkAbout =
    "whitespace-nowrap font-grotesk text-[12px] font-normal uppercase tracking-[0.1em] text-[color:var(--ink)] border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-[color:var(--navy)] hover:text-[color:var(--navy)]";
  const linkAboutActive = linkMainActive;

  return (
    <nav
      className="stitch-navbar fixed left-0 right-0 top-0 z-50 flex w-full items-center glass-nav"
      aria-label={t("nav.mainLabel")}
    >
      <div className="site-container flex h-full items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
          <NavLink
            to="/"
            className="stitch-navbar-logo shrink-0 cursor-pointer border-b-2 border-transparent pb-[4px] transition-colors duration-300 hover:border-[color:var(--gold)]"
          >
            JERSEY REPUBLIC
          </NavLink>
          <div
            className={`${
              mobileOpen ? "flex" : "hidden"
            } absolute left-0 top-full z-[60] w-full flex-col gap-5 border-b border-[color:var(--sand)] bg-[color:var(--white)] px-6 py-4 lg:relative lg:top-auto lg:z-auto lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0`}
          >
            <NavLink
              to="/#drops"
              className={linkMain}
              activeClassName={linkMainActive}
              isActive={(_match, loc) => loc.pathname === "/" && loc.hash === "#drops"}
              onClick={(e) => {
                setMobileOpen(false);
                if (location.pathname === "/") {
                  e.preventDefault();
                  document.getElementById("drops")?.scrollIntoView({ behavior: "smooth" });
                  history.replace({ pathname: "/", hash: "drops" });
                }
              }}
            >
              {t("nav.drops")}
            </NavLink>
            <NavLink
              to="/products"
              className={linkMain}
              activeClassName={linkMainActive}
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.shopAll")}
            </NavLink>
            <NavLink
              to="/roulette"
              className={linkMain}
              activeClassName={linkMainActive}
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.roulette")}
            </NavLink>
            <div
              className="brands-mega__trigger-wrap hidden lg:inline-flex"
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
                {t("nav.teams")}
              </button>
            </div>
            <button
              type="button"
              className={`${linkMain} w-full cursor-pointer border-x-0 border-t-0 bg-transparent px-0 text-left lg:hidden ${brandsMegaOpen ? linkMainActive : ""}`}
              aria-expanded={brandsMegaOpen}
              aria-controls="teams-mega-menu"
              onClick={() => setBrandsMegaOpen((o) => !o)}
            >
              {t("nav.teams")}
            </button>
            <LanguageToggle className="self-start lg:hidden" align="left" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 md:gap-6">
          <NavLink
            to="/help"
            className={`${linkAbout} hidden lg:inline-flex`}
            activeClassName={linkAboutActive}
          >
            {t("nav.about")}
          </NavLink>
          <div className="hidden h-10 w-[192px] shrink-0 items-center rounded-full border border-[color:var(--sand)] bg-[color:var(--white)] px-4 py-2 xl:flex">
            <span className="material-symbols-outlined shrink-0 text-sm text-[color:var(--ink-soft)]">search</span>
            <input
              className="font-grotesk ml-2 min-w-0 flex-1 border-none bg-transparent text-xs uppercase leading-none tracking-widest text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-soft)] placeholder:uppercase focus:ring-0"
              placeholder={t("nav.searchPlaceholder")}
              type="search"
              aria-label={t("nav.searchLabel")}
            />
          </div>
          <LanguageToggle className="hidden lg:inline-flex" />
          <div className="flex items-center gap-3 md:gap-4">
            <NavLink
              to="/help"
              className={`${linkAbout} lg:hidden`}
              activeClassName={linkAboutActive}
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.about")}
            </NavLink>
            <NavAccountMenu
              authMember={authMember}
              onLoginClick={() => setLoginOpen(true)}
              onSignOut={handleLogoutRequest}
            />
            <Basket
              cartItems={cartItems}
              onAdd={onAdd}
              onRemove={onRemove}
              onDelete={onDelete}
              onDeleteAll={onDeleteAll}
            />
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[color:var(--ink)] lg:hidden"
              aria-label={t("nav.menu")}
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
