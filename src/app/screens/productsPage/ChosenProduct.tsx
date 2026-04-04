import { Container, Stack, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import StarIcon from "@mui/icons-material/Star";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { sweetTopSuccessAlert } from "../../../lib/sweetAlert";

import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { setChosenProduct, setRestaurant } from "./slice";
import { createSelector } from "reselect";
import { Product } from "../../../lib/types/product";
import { retrieveChosenProduct, retrieveRestaurant } from "./selector";
import { useParams } from "react-router-dom";
import {
  useEffect,
  useMemo,
  useState,
  memo,
  useRef,
  useCallback,
} from "react";
import Drift from "drift-zoom";
import "drift-zoom/dist/drift-basic.min.css";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { getImageUrl } from "../../../lib/config";
import { normalizeProductImages } from "../../../lib/normalizeProductImages";
import { CartItem } from "../../../lib/types/search";
import { ProductCollection } from "../../../lib/enums/product.enum";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setRestaurant: (data: Member) => dispatch(setRestaurant(data)),
  setChosenProduct: (data: Product) => dispatch(setChosenProduct(data)),
});

const chosenProductRetriever = createSelector(
  retrieveChosenProduct,
  (chosenProduct) => ({
    chosenProduct,
  })
);

const restaurantRetriever = createSelector(
  retrieveRestaurant,
  (restaurant) => ({
    restaurant,
  })
);

function getCollectionDisplayName(collection: string): string {
  const collectionNames: { [key: string]: string } = {
    PREMIER_LEAGUE: "Premier League",
    LA_LIGA: "La Liga",
    SERIE_A: "Serie A",
    BUNDESLIGA: "Bundesliga",
    LIGUE_1: "Ligue 1",
    CHAMPIONS_LEAGUE: "Champions League",
    NATIONAL_TEAMS: "National Teams",
    UZBEKISTAN_LEAGUE: "Uzbekistan",
    RETRO: "Retro Collection",
    OTHER: "Other",
    DISH: "Dish",
    DRINK: "Drink",
  };
  return collectionNames[collection] || collection;
}

function buildBreadcrumbCrumbs(product: Product): string[] {
  const c = product.productCollection;
  const crumbs = ["Home"];
  if (c === ProductCollection.UZBEKISTAN_LEAGUE) {
    crumbs.push("National Teams", "Uzbekistan");
    return crumbs;
  }
  if (c === ProductCollection.NATIONAL_TEAMS) {
    crumbs.push("National Teams", product.productName);
    return crumbs;
  }
  crumbs.push(getCollectionDisplayName(c));
  crumbs.push(product.productName);
  return crumbs;
}

interface ChosenProductProps {
  onAdd: (item: CartItem) => boolean;
}

function buildPhotoSwipeData(urls: readonly string[]) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<{
          src: string;
          width: number;
          height: number;
        }>((resolve) => {
          const im = new Image();
          im.onload = () =>
            resolve({
              src,
              width: im.naturalWidth || 1200,
              height: im.naturalHeight || 1200,
            });
          im.onerror = () => resolve({ src, width: 1600, height: 1600 });
          im.src = src;
        })
    )
  );
}

const ProductMediaGallery = memo(function ProductMediaGallery({
  productId,
  productName,
  imageUrls,
}: {
  productId: string;
  productName: string;
  imageUrls: readonly string[];
}) {
  const [active, setActive] = useState(0);
  const [driftDesktop, setDriftDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
  );
  const safeUrls = useMemo(
    () =>
      imageUrls.length > 0 ? [...imageUrls] : ["/img/noimage-list.svg"],
    [imageUrls]
  );
  const len = safeUrls.length;
  const imageUrlsKey = safeUrls.join("|");

  const mainImgRef = useRef<HTMLImageElement | null>(null);
  const driftPaneRef = useRef<HTMLDivElement | null>(null);
  const mainColRef = useRef<HTMLDivElement | null>(null);
  const thumbSwiperRef = useRef<SwiperType | null>(null);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDriftDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [productId, imageUrlsKey]);

  useEffect(() => {
    thumbSwiperRef.current?.slideTo(active, 300);
  }, [active]);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
    lightboxRef.current = lightbox;
    return () => {
      lightbox.destroy();
      lightboxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pane = driftPaneRef.current;
    const imgEl = mainImgRef.current;
    const col = mainColRef.current;
    if (!driftDesktop || !pane || !imgEl || !col) {
      return;
    }
    const drift = new Drift(imgEl, {
      paneContainer: pane,
      /* drift-zoom treats `false` as falsy and falls back to 375px breakpoint; -1 forces non-inline */
      inlinePane: -1,
      zoomFactor: 3,
      hoverBoundingBox: true,
      handleTouch: false,
      boundingBoxContainer: col,
      sourceAttribute: "data-zoom",
    });
    return () => drift.destroy();
  }, [driftDesktop, active, imageUrlsKey]);

  const go = (delta: number) => {
    if (len <= 1) return;
    setActive((i) => (i + delta + len) % len);
  };

  const openLightbox = useCallback(() => {
    const lb = lightboxRef.current;
    if (!lb) return;
    void buildPhotoSwipeData(safeUrls).then((dataSource) => {
      lb.loadAndOpen(active, dataSource);
    });
  }, [active, safeUrls]);

  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__stage">
        <div className="pdp-gallery__stage-inner">
          <div ref={mainColRef} className="pdp-gallery__main-col">
            {len > 1 ? (
              <>
                <button
                  type="button"
                  className="pdp-gallery__nav pdp-gallery__nav--prev"
                  aria-label="Previous image"
                  onClick={() => go(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pdp-gallery__nav pdp-gallery__nav--next"
                  aria-label="Next image"
                  onClick={() => go(1)}
                >
                  ›
                </button>
              </>
            ) : null}
            <img
              ref={mainImgRef}
              className="pdp-gallery__main pdp-gallery__main--enter"
              key={productId}
              src={safeUrls[active]}
              data-zoom={safeUrls[active]}
              alt={`${productName} — view ${active + 1} of ${len}`}
              title="View fullscreen"
              loading="eager"
              decoding="async"
              draggable={false}
              onClick={openLightbox}
            />
          </div>
          <div
            ref={driftPaneRef}
            className="pdp-gallery__drift-pane"
            aria-hidden="true"
          />
        </div>
      </div>
      {len > 1 ? (
        <div className="pdp-gallery__thumbs" aria-label="Product images">
          <Swiper
            className="pdp-gallery__thumb-swiper"
            modules={[FreeMode]}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode
            centeredSlides={false}
            watchSlidesProgress
            onSwiper={(swiper) => {
              thumbSwiperRef.current = swiper;
            }}
          >
            {safeUrls.map((url, i) => (
              <SwiperSlide key={`${productId}-thumb-${i}`} className="pdp-gallery__thumb-slide">
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={
                    i === active
                      ? "pdp-gallery__thumb pdp-gallery__thumb--active"
                      : "pdp-gallery__thumb"
                  }
                  onClick={() => setActive(i)}
                >
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}
    </div>
  );
});

export default function ChosenProduct(props: ChosenProductProps) {
  const { productId } = useParams<{ productId: string }>();
  const { setRestaurant, setChosenProduct } = actionDispatch(useDispatch());
  const { chosenProduct } = useSelector(chosenProductRetriever);
  const { restaurant } = useSelector(restaurantRetriever);

  const [selectedSize, setSelectedSize] = useState(
    chosenProduct?.productSize || ""
  );
  const [quantity, setQuantity] = useState(1);

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  useEffect(() => {
    const product = new ProductService();
    product
      .getProduct(productId)
      .then((data) => {
        setChosenProduct(data);
        setSelectedSize(data?.productSize || "");
      })
      .catch((err) => console.log(err));

    const member = new MemberService();
    member
      .getRestaurant()
      .then((data) => setRestaurant(data))
      .catch((err) => console.log(err));
  }, [productId, setChosenProduct, setRestaurant]);

  const galleryUrls = useMemo(() => {
    if (!chosenProduct || !productId || chosenProduct._id !== productId) {
      return ["/img/noimage-list.svg"];
    }
    const imgs = normalizeProductImages(chosenProduct.productImages);
    if (imgs.length === 0) return ["/img/noimage-list.svg"];
    return imgs.map((ele) =>
      ele.startsWith("http") ? ele : getImageUrl(ele) || "/img/noimage-list.svg"
    );
  }, [chosenProduct, productId]);

  /** Avoid flashing the previous PDP while the new product loads */
  if (!chosenProduct || !productId || chosenProduct._id !== productId) {
    return null;
  }

  const productImages = normalizeProductImages(chosenProduct.productImages);

  const crumbs = buildBreadcrumbCrumbs(chosenProduct);
  const collectionBadge = String(
    chosenProduct.productCollection || ""
  ).replace(/_/g, " ");

  const supplierLine = restaurant?.memberNick
    ? `${restaurant.memberNick} · Official replica supplier`
    : "JAKO · Official replica supplier";

  return (
    <div className="chosen-product pdp">
      <Container maxWidth="lg" className="pdp-container">
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((part, i) => (
            <span key={`${part}-${i}`} className="pdp-breadcrumb__segment">
              {i === 0 ? (
                <Link to="/products" className="pdp-breadcrumb__link">
                  {part}
                </Link>
              ) : (
                <span className="pdp-breadcrumb__text">{part}</span>
              )}
              {i < crumbs.length - 1 ? (
                <span className="pdp-breadcrumb__sep">&gt;</span>
              ) : null}
            </span>
          ))}
        </nav>

        <Stack className="pdp-layout" direction={{ xs: "column", md: "row" }}>
          <Box className="chosen-product-slider pdp-panel pdp-panel--media">
            <ProductMediaGallery
              productId={chosenProduct._id}
              productName={chosenProduct.productName}
              imageUrls={galleryUrls}
            />
          </Box>

          <Stack className="chosen-product-info pdp-panel pdp-panel--info">
            <Box className="info-box pdp-info">
              <span className="pdp-badge">{collectionBadge.toUpperCase()}</span>

              <Typography
                component="h1"
                className="product-name pdp-heading"
              >
                {chosenProduct.productName}
              </Typography>

              <Typography className="pdp-supplier">{supplierLine}</Typography>

              <Box className="pdp-rating-row">
                <Rating
                  name="product-rating"
                  value={4.5}
                  precision={0.5}
                  readOnly
                  sx={{
                    color: "#F8BB86",
                    "& .MuiRating-iconFilled": { color: "#F8BB86" },
                    "& .MuiRating-iconEmpty": {
                      color: "rgba(248, 187, 134, 0.35)",
                    },
                  }}
                />
                <Typography component="span" className="pdp-rating-meta">
                  (4.5) · 127 reviews
                </Typography>
              </Box>

              <Typography className="product-desc pdp-desc">
                {chosenProduct.productDesc ||
                  "Premium quality football jersey with authentic team colors and official design."}
              </Typography>

              <hr className="pdp-divider" />

              <Typography className="pdp-section-label">Select size</Typography>
              <Box className="pdp-size-grid">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={
                      selectedSize === size
                        ? "pdp-size-btn pdp-size-btn--active"
                        : "pdp-size-btn"
                    }
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </Box>

              <Typography className="pdp-section-label">Quantity</Typography>
              <Box className="pdp-qty-row">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pdp-qty-value">{quantity}</span>
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        chosenProduct.productLeftCount || 10,
                        quantity + 1
                      )
                    )
                  }
                  disabled={
                    quantity >= (chosenProduct.productLeftCount || 10)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </Box>

              <Box className="pdp-price-block">
                <Typography className="pdp-price" component="span">
                  ${chosenProduct.productPrice}
                </Typography>
                <Typography className="pdp-installments">
                  or 3 installments
                </Typography>
              </Box>

              <Box className="pdp-trust">
                <Box className="pdp-trust__item">
                  <LocalShippingIcon className="pdp-trust__icon" />
                  <span>Free shipping over $50</span>
                </Box>
                <Box className="pdp-trust__item">
                  <SecurityIcon className="pdp-trust__icon" />
                  <span>Authentic quality</span>
                </Box>
                <Box className="pdp-trust__item">
                  <StarIcon className="pdp-trust__icon" />
                  <span>Official design</span>
                </Box>
                <Box className="pdp-trust__item">
                  <SportsSoccerIcon className="pdp-trust__icon" />
                  <span>Team licensed</span>
                </Box>
              </Box>

              <Stack className="pdp-actions" spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  className="pdp-btn-cart"
                  onClick={() => {
                    if (chosenProduct && selectedSize) {
                      const cartItem: CartItem = {
                        _id: chosenProduct._id,
                        quantity: quantity,
                        name: `${chosenProduct.productName} (${selectedSize})`,
                        price: chosenProduct.productPrice,
                        image:
                          productImages.length > 0
                            ? productImages[0]
                            : "/img/noimage-list.svg",
                      };
                      const added = props.onAdd(cartItem);
                      if (added) {
                        sweetTopSuccessAlert(
                          `${chosenProduct.productName} (${selectedSize}) added to cart!`,
                          2000
                        );
                      }
                    } else {
                      sweetTopSuccessAlert("Please select a size first!", 2000);
                    }
                  }}
                  disabled={
                    !selectedSize || chosenProduct.productLeftCount === 0
                  }
                >
                  {chosenProduct.productLeftCount === 0
                    ? "OUT OF STOCK"
                    : "ADD TO CART"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
