import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrdersEmptyState() {
  const history = useHistory();
  const { t } = useTranslation();

  return (
    <div className="orders-empty-state">
      <img
        src="/icons/noimage-list.svg"
        alt=""
        className="orders-empty-state__icon"
      />
      <h2 className="orders-empty-state__title">{t("orders.empty.title")}</h2>
      <p className="orders-empty-state__sub">
        {t("orders.empty.line1")}
      </p>
      <button
        type="button"
        className="orders-empty-state__cta"
        onClick={() => history.push("/products")}
      >
        {t("orders.empty.cta")}
      </button>
    </div>
  );
}
