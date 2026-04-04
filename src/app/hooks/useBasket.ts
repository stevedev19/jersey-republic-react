import { useState } from "react";
import { CartItem } from "../../lib/types/search";

const useBasket = () => {
  const cartJson: string | null = localStorage.getItem("cartData");
  const currentCart = cartJson ? JSON.parse(cartJson) : [];
  const [cartItems, setCartItems] = useState<CartItem[]>(currentCart);

  const onAdd = (input: CartItem) => {
    setCartItems((prev) => {
      const exist = prev.find((item: CartItem) => item._id === input._id);
      const next = exist
        ? prev.map((item: CartItem) =>
            item._id === input._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...input }];
      localStorage.setItem("cartData", JSON.stringify(next));
      return next;
    });
  };

  const onRemove = (input: CartItem) => {
    setCartItems((prev) => {
      const exist = prev.find((item: CartItem) => item._id === input._id);
      if (!exist) return prev;
      const next =
        exist.quantity === 1
          ? prev.filter((item: CartItem) => item._id !== input._id)
          : prev.map((item: CartItem) =>
              item._id === input._id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            );
      localStorage.setItem("cartData", JSON.stringify(next));
      return next;
    });
  };

  const onDelete = (input: CartItem) => {
    setCartItems((prev) => {
      const next = prev.filter((item: CartItem) => item._id !== input._id);
      localStorage.setItem("cartData", JSON.stringify(next));
      return next;
    });
  };

  const onDeleteAll = () => {
    setCartItems([]);
    localStorage.removeItem("cartData");
  };

  return {
    cartItems,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll,
  };
};

export default useBasket;