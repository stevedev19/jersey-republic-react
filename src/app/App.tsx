import React, { useState, useEffect, useCallback, useRef } from "react";
import { Route, Switch, useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "./screens/homePage";
import ProductsPage from "./screens/productsPage";
import OrdersPage from "./screens/ordersPage";
import UserPage from "./screens/userPage";
import OtherNavbar from "./components/headers/OtherNavbar";
import Footer from "./components/footer";
import HelpPage from "./screens/helpPage";
import AdminPage from "./screens/adminPage";
import AdminLoginPage from "./screens/adminPage/AdminLoginPage";
import AdminJerseyManagement from "./screens/adminPage/AdminJerseyManagement";
import StickyCardsPage from "./screens/stickyCardsPage";
import JerseyRoulette from "./screens/roulettePage";
import useBasket from "./hooks/useBasket";
import AuthenticationModal from "./components/auth";
import { useDispatch } from "react-redux";
import { sweetTopSuccessAlert } from "../lib/sweetAlert";
import MemberService from "./services/MemberService";
import {
  setFinishedOrders,
  setPausedOrders,
  setProcessOrders,
} from "./screens/ordersPage/slice";
import { useGlobals } from "./hooks/useGlobals";
import CartAuthRequiredDialog from "./components/cart/CartAuthRequiredDialog";
import { CartItem } from "../lib/types/search";
import {
  clearPendingCartItem,
  savePendingCartItem,
  takePendingCartItemIfFresh,
} from "../lib/pendingCartStorage";
import { sweetTopSmallSuccessAlert } from "../lib/sweetAlert";
import i18n from "../i18n";
import "../css/app.css";
import "../css/navbar.css";
import "../css/admin.css";

function App() {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const pathTrim = (pathname || "/").replace(/\/+$/, "") || "/";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isRouletteRoute = pathTrim === "/roulette";
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
    sweetTopSmallSuccessAlert(i18n.t("common.addedToCart"), 2000);
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
      // Never throws: the API call is best-effort and local storage is always cleared.
      await new MemberService().logout();
    } finally {
      setAuthMember(null);
      onDeleteAll();
      dispatch(setPausedOrders([]));
      dispatch(setProcessOrders([]));
      dispatch(setFinishedOrders([]));
      setCartAuthPromptOpen(false);
      setAnchorEl(null);
      history.push("/");
      sweetTopSuccessAlert(t("messages.signedOut"), 700);
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
      {location.pathname !== "/" && !isAdminRoute ? <OtherNavbar {...navbarProps} /> : null}
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
        <Route path="/admin/product/all">
          <AdminJerseyManagement />
        </Route>
        <Route exact path="/admin/login">
          <AdminLoginPage />
        </Route>
        <Route exact path="/admin">
          <AdminPage />
        </Route>
        <Route path="/">
          <HomePage {...navbarProps} />
        </Route>
      </Switch>
      {!isAdminRoute && <Footer />}

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
