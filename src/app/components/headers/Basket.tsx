import React from "react";
import { Box, IconButton, Badge, Menu } from "@mui/material";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import { Messages, getImageUrl } from "../../../lib/config";
import { useGlobals } from "../../hooks/useGlobals";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import OrderService from "../../services/OrderService";
import "../../../css/basket-dropdown.css";

function parseCartItemName(fullName: string): { displayName: string; size: string } {
  const m = fullName.match(/^(.*)\s*\(([^)]+)\)\s*$/);
  if (m) return { displayName: m[1].trim(), size: m[2].trim() };
  return { displayName: fullName.trim(), size: "—" };
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

interface BasketProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
}

export default function Basket(props: BasketProps) {
  const { cartItems, onAdd, onDelete, onDeleteAll, onRemove } = props;
  const { authMember, setOrderBuilder } = useGlobals();
  const history = useHistory();

  const itemsPrice = cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
  const shippingCost = itemsPrice < 100 ? 5 : 0;
  const totalQty = cartItems.reduce((a, c) => a + c.quantity, 0);
  const totalMoney = itemsPrice + shippingCost;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const proceedOrderHandler = async () => {
    try {
      handleClose();
      if (!authMember) throw new Error(Messages.error2);

      const order = new OrderService();
      await order.createOrder(cartItems);

      onDeleteAll();
      setOrderBuilder(new Date());
      history.push("/orders");
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Box className="hover-line" sx={{ position: "relative" }}>
      <IconButton
        aria-label="Cart"
        id="jr-cart-button"
        aria-controls={open ? "jr-cart-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        onClick={handleClick}
        sx={{
          color: "#b9c3ff",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.05)" },
          "&:active": { transform: "scale(0.95)" },
        }}
      >
        <Badge
          badgeContent={totalQty > 0 ? totalQty : 0}
          invisible={totalQty === 0}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#667eea",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              height: "16px",
              minWidth: totalQty > 9 ? "20px" : "16px",
              width: totalQty > 9 ? "auto" : "16px",
              padding: totalQty > 9 ? "0 4px" : 0,
              borderRadius: "9999px",
              top: -4,
              right: -4,
              lineHeight: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <img src="/icons/shopping-cart.svg" alt="" width={22} height={22} />
        </Badge>
      </IconButton>
      <Menu
        id="jr-cart-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        marginThreshold={0}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: "12px",
            zIndex: 130,
            backgroundColor: "transparent",
            boxShadow: "none",
            borderRadius: "16px",
            overflow: "visible",
            maxWidth: "calc(100vw - 24px)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        MenuListProps={{ sx: { padding: 0 } }}
      >
        <div className="jr-cart">
          <div className="jr-cart__header">
            <div className="jr-cart__title-row">
              <span className="jr-cart__title">My Cart</span>
              <span className="jr-cart__count-badge">{totalQty}</span>
            </div>
            <button type="button" className="jr-cart__close" onClick={handleClose} aria-label="Close cart">
              ×
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="jr-cart__empty">
              <div className="jr-cart__empty-icon" aria-hidden>
                🛒
              </div>
              <h2 className="jr-cart__empty-title">Your cart is empty</h2>
              <p className="jr-cart__empty-desc">Start building your collection</p>
              <button
                type="button"
                className="jr-cart__empty-cta"
                onClick={() => {
                  handleClose();
                  history.push("/products");
                }}
              >
                Shop now →
              </button>
            </div>
          ) : (
            <>
              <div className="jr-cart__list">
                {cartItems.map((item: CartItem) => {
                  const imagePath = getImageUrl(item.image) || "/img/noimage-list.svg";
                  const { displayName, size } = parseCartItemName(item.name);
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div className="jr-cart__row" key={`${item._id}-${item.name}`}>
                      <img src={imagePath} alt="" className="jr-cart__thumb" />
                      <div className="jr-cart__meta">
                        <p className="jr-cart__name">{displayName}</p>
                        <span className="jr-cart__size">Size: {size}</span>
                      </div>
                      <div className="jr-cart__right">
                        <span className="jr-cart__line-price">${formatMoney(lineTotal)}</span>
                        <div className="jr-cart__stepper">
                          <button
                            type="button"
                            className="jr-cart__step-btn"
                            aria-label="Decrease quantity"
                            onClick={() => onRemove(item)}
                          >
                            -
                          </button>
                          <span className="jr-cart__qty">{item.quantity}</span>
                          <button
                            type="button"
                            className="jr-cart__step-btn"
                            aria-label="Increase quantity"
                            onClick={() => onAdd(item)}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="jr-cart__remove"
                            aria-label="Remove item"
                            onClick={() => onDelete(item)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="jr-cart__footer">
                <div className="jr-cart__row-line">
                  <span className="jr-cart__label-sm">Subtotal</span>
                  <span className="jr-cart__value-sm">${formatMoney(itemsPrice)}</span>
                </div>
                <div className="jr-cart__row-line jr-cart__row-line--ship">
                  <span className="jr-cart__ship-label">Shipping</span>
                  <span className="jr-cart__ship-val">
                    {shippingCost === 0 ? "FREE" : `+$${formatMoney(shippingCost)}`}
                  </span>
                </div>
                <hr className="jr-cart__divider" />
                <div className="jr-cart__total-row">
                  <span className="jr-cart__total-label">Total</span>
                  <span className="jr-cart__total-amt">${formatMoney(totalMoney)}</span>
                </div>
                <button type="button" className="jr-cart__checkout" onClick={proceedOrderHandler}>
                  Checkout →
                </button>
                <button type="button" className="jr-cart__continue" onClick={handleClose}>
                  Continue shopping
                </button>
              </div>
            </>
          )}
        </div>
      </Menu>
    </Box>
  );
}
