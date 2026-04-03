import { useHistory } from "react-router-dom";

export default function OrdersEmptyState() {
  const history = useHistory();

  return (
    <div className="orders-empty-state">
      <img
        src="/icons/noimage-list.svg"
        alt=""
        className="orders-empty-state__icon"
      />
      <h2 className="orders-empty-state__title">NO ORDERS YET</h2>
      <p className="orders-empty-state__sub">
        Your archive is empty.
        <br />
        Start building your collection.
      </p>
      <button
        type="button"
        className="orders-empty-state__cta"
        onClick={() => history.push("/products")}
      >
        EXPLORE THE ARCHIVE →
      </button>
    </div>
  );
}
