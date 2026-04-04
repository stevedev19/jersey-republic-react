import React, { useState, useEffect, useCallback, useRef } from "react";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
import HomePage from "./screens/homePage";
import ProductsPage from "./screens/productsPage";
import OrdersPage from "./screens/ordersPage";
import UserPage from "./screens/userPage";
import OtherNavbar from "./components/headers/OtherNavbar";
import Footer from "./components/footer";
import HelpPage from "./screens/helpPage";
import AdminPage from "./screens/adminPage";
import StickyCardsPage from "./screens/stickyCardsPage";
import JerseyRoulette from "./screens/roulettePage";
import useBasket from "./hooks/useBasket";
import AuthenticationModal from "./components/auth";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../lib/sweetAlert";
import { Messages } from "../lib/config";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";
import ParticleBackground from "./components/ParticleBackground";
import CartAuthRequiredDialog from "./components/cart/CartAuthRequiredDialog";
import { CartItem } from "../lib/types/search";
import {
  clearPendingCartItem,
  savePendingCartItem,
  takePendingCartItemIfFresh,
} from "../lib/pendingCartStorage";
import { sweetTopSmallSuccessAlert } from "../lib/sweetAlert";
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/admin.css";

function App() {
  const location = useLocation();
  const history = useHistory();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const pathTrim = (pathname || "/").replace(/\/+$/, "") || "/";
  const isProductsRoute = location.pathname.startsWith("/products");
  const isArchiveHome = pathTrim === "/";
  const isRouletteRoute = pathTrim === "/roulette";
  const isExperienceRoute = location.pathname === "/sticky-cards";
  const { authMember, setAuthMember } = useGlobals();

  const {
    cartItems,
    onAdd: addToCartInternal,
    onRemove,
    onDelete,
    onDeleteAll,
  } = useBasket();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [cartAuthPromptOpen, setCartAuthPromptOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const cartReturnPath = `${location.pathname}${location.search || ""}`;

  const onAdd = useCallback(
    (item: CartItem) => {
      if (!authMember) {
        savePendingCartItem(item, cartReturnPath);
        setCartAuthPromptOpen(true);
        return false;
      }
      addToCartInternal(item);
      return true;
    },
    [authMember, addToCartInternal, cartReturnPath]
  );

  const addToCartRef = useRef(addToCartInternal);
  addToCartRef.current = addToCartInternal;
  const locationRef = useRef(location);
  locationRef.current = location;
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (!authMember) return;
    const pending = takePendingCartItemIfFresh();
    if (!pending) return;
    addToCartRef.current(pending.item);
    sweetTopSmallSuccessAlert("Added to cart", 2000);
    const here = `${locationRef.current.pathname}${locationRef.current.search || ""}`;
    if (pending.returnPath && pending.returnPath !== here) {
      historyRef.current.replace(pending.returnPath);
    }
  }, [authMember]);

  const dismissCartAuthPrompt = useCallback(() => {
    clearPendingCartItem();
    setCartAuthPromptOpen(false);
  }, []);

  const openLoginFromCartPrompt = useCallback(() => {
    setCartAuthPromptOpen(false);
    setLoginOpen(true);
  }, []);

  const openSignupFromCartPrompt = useCallback(() => {
    setCartAuthPromptOpen(false);
    setSignupOpen(true);
  }, []);

  const handleSignupClose = () => setSignupOpen(false);
  const handleLoginClose = () => setLoginOpen(false);

  const handleLogoutClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseLogout = () => {
    setAnchorEl(null);
  };

  const handleLogoutRequest = async () => {
    try {
      const member = new MemberService();
      await member.logout();

      sweetTopSuccessAlert("success", 700);
      setAuthMember(null);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(Messages.error1);
    }
  };

  const navbarProps = {
    cartItems,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll,
    setSignupOpen,
    setLoginOpen,
    anchorEl,
    handleLogoutClick,
    handleCloseLogout,
    handleLogoutRequest,
  };

  return (
    <>
      {!isProductsRoute && !isArchiveHome && !isRouletteRoute && !isExperienceRoute && (
        <ParticleBackground />
      )}
      {location.pathname !== "/" && location.pathname !== "/admin" ? (
        <OtherNavbar {...navbarProps} />
      ) : null}
      <Switch>
        <Route path="/products">
          <ProductsPage onAdd={onAdd} />
        </Route>
        <Route path="/orders">
          <OrdersPage />
        </Route>
        <Route path="/member-page">
          <UserPage />
        </Route>
        <Route path="/help">
          <HelpPage />
        </Route>
        <Route path="/sticky-cards">
          <StickyCardsPage />
        </Route>
        <Route path="/roulette">
          <JerseyRoulette {...navbarProps} />
        </Route>
        <Route path="/admin">
          <AdminPage />
        </Route>
        <Route path="/">
          <HomePage {...navbarProps} />
        </Route>
      </Switch>
      {location.pathname !== "/admin" && <Footer />}

      <CartAuthRequiredDialog
        open={cartAuthPromptOpen}
        onClose={dismissCartAuthPrompt}
        onSignIn={openLoginFromCartPrompt}
        onCreateAccount={openSignupFromCartPrompt}
      />

      <AuthenticationModal
        signupOpen={signupOpen}
        loginOpen={loginOpen}
        handleLoginClose={handleLoginClose}
        handleSignupClose={handleSignupClose}
        setSignupOpen={setSignupOpen}
        rouletteLogin={isRouletteRoute && loginOpen}
      />
    </>
  );
}

export default App;
