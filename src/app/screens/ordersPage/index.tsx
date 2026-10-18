import { Stack, Box } from "@mui/material";
import { useEffect, useState } from "react";
import TabContext from "@mui/lab/TabContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PausedOrders from "./PausedOrders";
import ProcessOrders from "./ProcessOrders";
import FinishedOrders from "./FinishedOrders";
import { useDispatch } from "react-redux";
import { setPausedOrders, setProcessOrders, setFinishedOrders } from "./slice";

import "../../../css/order.css";
import { OrderStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { useGlobals } from "../../hooks/useGlobals";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../../lib/config";

const ORDER_LIST_PARAMS = { page: 1, limit: 5 } as const;

const TAB_LABELS = [
  { value: "1", labelKey: "orders.tabs.paused" },
  { value: "2", labelKey: "orders.tabs.process" },
  { value: "3", labelKey: "orders.tabs.finished" },
] as const;

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orderBuilder, authMember } = useGlobals();
  const history = useHistory();
  const { t } = useTranslation();
  const [value, setValue] = useState("1");

  useEffect(() => {
    const order = new OrderService();

    order
      .getMyOrders({ ...ORDER_LIST_PARAMS, orderStatus: OrderStatus.PAUSE })
      .then((data) =>
        dispatch(setPausedOrders(Array.isArray(data) ? data : []))
      )
      .catch((err) => console.log(err));

    order
      .getMyOrders({ ...ORDER_LIST_PARAMS, orderStatus: OrderStatus.PROCESS })
      .then((data) =>
        dispatch(setProcessOrders(Array.isArray(data) ? data : []))
      )
      .catch((err) => console.log(err));

    order
      .getMyOrders({ ...ORDER_LIST_PARAMS, orderStatus: OrderStatus.FINISH })
      .then((data) =>
        dispatch(setFinishedOrders(Array.isArray(data) ? data : []))
      )
      .catch((err) => console.log(err));
  }, [orderBuilder, dispatch]);

  if (!authMember) history.push("/");

  return (
    <div className={"order-page stitch-navbar-offset"}>
      <div className="order-container">
        <Stack className={"order-left"}>
          <TabContext value={value}>
            <Box className={"order-nav-frame"}>
              <div className="order-tabs-shell">
                <div
                  className="order-tabs-pill-bar"
                  role="tablist"
                  aria-label={t("orders.categories")}
                >
                  {TAB_LABELS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={value === tab.value}
                      className={
                        value === tab.value
                          ? "order-tab order-tab--active"
                          : "order-tab"
                      }
                      onClick={() => setValue(tab.value)}
                    >
                      {t(tab.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </Box>
            <Stack className="order-main-content">
              <PausedOrders setValue={setValue} />
              <ProcessOrders setValue={setValue} />
              <FinishedOrders />
            </Stack>
          </TabContext>
        </Stack>
        <Stack className="order-right">
          <Box className="order-profile-card">
            <img
              src={
                authMember?.memberImage
                  ? getImageUrl(authMember.memberImage)
                  : "/icons/default-user.svg"
              }
              alt=""
              className="order-profile-avatar"
            />
            <p className="order-profile-name">{authMember?.memberNick}</p>
            <span className="order-profile-badge">
              {authMember?.memberType ?? "USER"}
            </span>
            <div className="order-profile-location">
              <LocationOnIcon className="order-profile-location-icon" />
              <p>
                {authMember?.memberAddress
                  ? authMember.memberAddress
                  : t("common.noAddress")}
              </p>
            </div>
          </Box>

          <Box className="order-payment-card">
            <input
              className="order-payment-input"
              type="text"
              placeholder={t("orders.cardNumber")}
              autoComplete="cc-number"
            />
            <div className="order-payment-row">
              <input
                className="order-payment-input"
                type="text"
                placeholder={t("orders.expiry")}
                autoComplete="cc-exp"
              />
              <input
                className="order-payment-input"
                type="text"
                placeholder={t("orders.cvv")}
                autoComplete="cc-csc"
              />
            </div>
            <input
              className="order-payment-input"
              type="text"
              placeholder={t("orders.cardholder")}
              autoComplete="cc-name"
            />
            <div className="order-payment-brands">
              <img src="/icons/master-card.svg" alt="Mastercard" />
              <img src="/icons/visa-card.svg" alt="Visa" />
              <img src="/icons/paypal-card.svg" alt="PayPal" />
            </div>
            <button type="button" className="order-payment-save">
              {t("orders.saveCard")}
            </button>
          </Box>
        </Stack>
      </div>
    </div>
  );
}
