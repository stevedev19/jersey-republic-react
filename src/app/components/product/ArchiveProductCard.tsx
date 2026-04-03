import React from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Product } from "../../../lib/types/product";
import { getImageUrl } from "../../../lib/config";
import { CartItem } from "../../../lib/types/search";
import { collectionLabel, isNewProduct, sizeLabel } from "./archiveCardUtils";

export interface ArchiveProductCardProps {
  product: Product;
  onNavigate: (id: string) => void;
  onAddToCart?: (item: CartItem) => void;
}

export default function ArchiveProductCard(props: ArchiveProductCardProps) {
  const { product, onNavigate, onAddToCart } = props;

  const productImages = Array.isArray(product.productImages)
    ? product.productImages
    : [];
  const hasImages = productImages.length > 0;
  const firstImage = hasImages ? productImages[0] : "";
  const imagePath = hasImages
    ? firstImage.startsWith("http")
      ? firstImage
      : getImageUrl(firstImage)
    : "/img/noimage-list.svg";
  const showNew = isNewProduct(product.createdAt);

  return (
    <article
      className="archive-card"
      onClick={() => onNavigate(product._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(product._id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="archive-card__image">
        <img
          src={imagePath}
          alt=""
          decoding="async"
          key={`${product._id}-${imagePath}`}
        />
        <span className="archive-card__badge-size">{sizeLabel(product)}</span>
        {showNew ? <span className="archive-card__badge-new">NEW</span> : null}
        {onAddToCart ? (
          <button
            type="button"
            className="archive-card__cart"
            aria-label="Add to cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart({
                _id: product._id,
                quantity: 1,
                name: product.productName,
                price: product.productPrice,
                image: hasImages ? firstImage : "/img/noimage-list.svg",
              });
            }}
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 18, color: "#fff" }} />
          </button>
        ) : null}
      </div>
      <div className="archive-card__body">
        <h2 className="archive-card__name">{product.productName}</h2>
        <p className="archive-card__league">
          {collectionLabel(product.productCollection)}
        </p>
        <div className="archive-card__row">
          <span className="archive-card__price">${product.productPrice}</span>
        </div>
      </div>
    </article>
  );
}
