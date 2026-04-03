import React, { useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
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
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/admin.css";

function App() {
  const location = useLocation();
  const isProductsRoute = location.pathname.startsWith("/products");
  const isArchiveHome = location.pathname === "/";
  const isRouletteRoute = location.pathname === "/roulette";
  const isExperienceRoute = location.pathname === "/sticky-cards";
  const { setAuthMember } = useGlobals();

  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = useBasket();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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

      <AuthenticationModal
        signupOpen={signupOpen}
        loginOpen={loginOpen}
        handleLoginClose={handleLoginClose}
        handleSignupClose={handleSignupClose}
      />
    </>
  );
}

export default App;
