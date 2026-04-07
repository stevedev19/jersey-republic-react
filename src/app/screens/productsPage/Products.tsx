import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import Pagination, {
  PaginationRenderItemParams,
} from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArchiveProductCard from "../../components/product/ArchiveProductCard";
import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "./slice";
import { createSelector } from "reselect";
import { Product, ProductInquiry } from "../../../lib/types/product";
import { retrieveProducts } from "./selector";
import { ProductCollection } from "../../../lib/enums/product.enum";
import ProductService from "../../services/ProductService";
import { useHistory, useLocation } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";

const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
});

const productsRetriever = createSelector(retrieveProducts, (products) => ({
  products,
}));

const COLLECTION_FILTERS: {
  value: ProductCollection | undefined;
  label: string;
}[] = [
  { value: undefined, label: "All Products" },
  { value: ProductCollection.NATIONAL_TEAMS, label: "National Teams" },
  { value: ProductCollection.LA_LIGA, label: "La Liga" },
  { value: ProductCollection.PREMIER_LEAGUE, label: "Premier League" },
  { value: ProductCollection.SERIE_A, label: "Serie A" },
  { value: ProductCollection.BUNDESLIGA, label: "Bundesliga" },
  { value: ProductCollection.LIGUE_1, label: "Ligue 1" },
  { value: ProductCollection.UZBEKISTAN_LEAGUE, label: "Uzbekistan" },
];

const SORT_FILTERS: { value: string; label: string }[] = [
  { value: "createdAt", label: "New" },
  { value: "productPrice", label: "Price" },
  { value: "productViews", label: "Views" },
];

function readInitialCatalogFilter(): "none" | "NEW_DROPS" {
  if (typeof window === "undefined") return "none";
  return new URLSearchParams(window.location.search).get("filter") === "NEW_DROPS"
    ? "NEW_DROPS"
    : "none";
}

interface ProductsProps {
  onAdd: (item: CartItem) => boolean;
}

export default function Products(props: ProductsProps) {
  const { onAdd } = props;
  const { setProducts } = actionDispatch(useDispatch());
  const { products } = useSelector(productsRetriever);
  const safeProducts = Array.isArray(products) ? products : [];
  const [catalogFilter, setCatalogFilter] = useState<"none" | "NEW_DROPS">(readInitialCatalogFilter);
  const [newDropsCache, setNewDropsCache] = useState<Product[] | null>(null);
  const [newDropsLoading, setNewDropsLoading] = useState(false);

  const [productSearch, setProductSearch] = useState<ProductInquiry>({
    page: 1,
    limit: 6,
    order: "createdAt",
    productCollection: undefined,
    search: "",
  });
  const [searchText, setSearchText] = useState<string>("");

  const history = useHistory();
  const location = useLocation();

  const sortedNewDrops = useMemo(() => {
    if (!newDropsCache) return null;
    const copy = [...newDropsCache];
    if (productSearch.order === "productPrice") {
      copy.sort((a, b) => a.productPrice - b.productPrice);
    } else if (productSearch.order === "productViews") {
      copy.sort((a, b) => b.productViews - a.productViews);
    } else {
      copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return copy;
  }, [newDropsCache, productSearch.order]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("filter") === "NEW_DROPS") {
      setCatalogFilter("NEW_DROPS");
      setProductSearch((prev) => ({
        ...prev,
        page: 1,
        productCollection: undefined,
        search: "",
      }));
      setSearchText("");
      return;
    }

    setCatalogFilter("none");

    if (!params.toString()) return;

    const collectionParam = params.get("collection");
    const searchParam = params.get("search");
    const orderParam = params.get("order");
    const validCollections = new Set(Object.values(ProductCollection));

    setProductSearch((prev) => {
      const next = { ...prev, page: 1 };

      if (collectionParam && validCollections.has(collectionParam as ProductCollection)) {
        next.productCollection = collectionParam as ProductCollection;
      }

      if (params.has("search")) {
        next.search = searchParam ?? "";
      } else if (params.has("collection") || params.has("order")) {
        next.search = "";
      }

      if (orderParam && ["createdAt", "productPrice", "productViews"].includes(orderParam)) {
        next.order = orderParam;
      }

      return next;
    });

    if (params.has("search")) {
      setSearchText(searchParam ?? "");
    } else if (params.has("collection") || params.has("order")) {
      setSearchText("");
    }
  }, [location.search]);

  useEffect(() => {
    if (catalogFilter !== "NEW_DROPS") {
      setNewDropsCache(null);
      setNewDropsLoading(false);
      return;
    }

    const ac = new AbortController();
    let ignore = false;
    setNewDropsLoading(true);
    setProducts([]);
    const service = new ProductService();
    service
      .getProductsNewDropsFullList({ signal: ac.signal })
      .then((data) => {
        if (!ignore) setNewDropsCache(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const e = err as { code?: string; name?: string; message?: string };
          if (
            e?.code === "ERR_CANCELED" ||
            e?.name === "CanceledError" ||
            e?.message === "canceled"
          ) {
            return;
          }
          setNewDropsCache([]);
        }
      })
      .finally(() => {
        if (!ignore) setNewDropsLoading(false);
      });

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [catalogFilter]);

  useEffect(() => {
    if (catalogFilter !== "NEW_DROPS" || sortedNewDrops === null) return;
    const limit = productSearch.limit;
    const page = productSearch.page;
    const start = (page - 1) * limit;
    setProducts(sortedNewDrops.slice(start, start + limit));
  }, [catalogFilter, sortedNewDrops, productSearch.page, productSearch.limit, setProducts]);

  useEffect(() => {
    if (catalogFilter === "NEW_DROPS") return;

    const ac = new AbortController();
    let ignore = false;

    const service = new ProductService();
    service
      .getProducts(productSearch, { signal: ac.signal })
      .then((data) => {
        if (ignore) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const e = err as { code?: string; message?: string; name?: string };
        if (
          e?.code === "ERR_CANCELED" ||
          e?.name === "CanceledError" ||
          e?.message === "canceled"
        ) {
          return;
        }
        console.log(err);
      });

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [catalogFilter, productSearch, setProducts]);

  useEffect(() => {
    if (searchText !== "") return;
    setProductSearch((prev) => {
      if (prev.search === "") return prev;
      return { ...prev, search: "", page: 1 };
    });
  }, [searchText]);

  const searchCollectionHandler = (collection: ProductCollection | undefined) => {
    setCatalogFilter("none");
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      productCollection: collection,
    }));
    if (location.search.includes("filter=NEW_DROPS")) {
      history.replace(
        collection ? `/products?collection=${encodeURIComponent(collection)}` : "/products"
      );
    }
  };

  const activateNewDropsFilter = () => {
    setCatalogFilter("NEW_DROPS");
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      productCollection: undefined,
      search: "",
    }));
    setSearchText("");
    history.push("/products?filter=NEW_DROPS");
  };

  const searchOrderHandler = (order: string) => {
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      order,
    }));
  };

  const searchProductHandler = () => {
    setCatalogFilter("none");
    setProductSearch((prev) => ({
      ...prev,
      search: searchText,
      page: 1,
    }));
    if (location.search.includes("filter=NEW_DROPS")) {
      history.replace(
        searchText ? `/products?search=${encodeURIComponent(searchText)}` : "/products"
      );
    }
  };

  const paginationHandler = (e: ChangeEvent<unknown>, value: number) => {
    setProductSearch((prev) => ({
      ...prev,
      page: value,
    }));
  };

  const chooseDishHandler = (id: string) => {
    history.push(`/products/${id}`);
  };

  const newDropsPageCount =
    catalogFilter === "NEW_DROPS" && sortedNewDrops
      ? Math.max(1, Math.ceil(sortedNewDrops.length / productSearch.limit))
      : null;

  const archiveSubtext =
    catalogFilter === "NEW_DROPS"
      ? newDropsLoading
        ? "Loading new drops…"
        : sortedNewDrops && sortedNewDrops.length > 0
          ? `${sortedNewDrops.length} new drop${sortedNewDrops.length === 1 ? "" : "s"}`
          : "No new drops in this window"
      : safeProducts.length === 0
        ? "No jerseys match your filters"
        : `${safeProducts.length} jersey${safeProducts.length === 1 ? "" : "s"} available`;

  const showNewDropsEmpty =
    catalogFilter === "NEW_DROPS" && !newDropsLoading && sortedNewDrops && sortedNewDrops.length === 0;

  return (
    <div className="products products-archive">
      <div className="products-archive__shell">
        <header className="products-archive__top">
          <div className="products-archive__heading">
            <h1 className="products-archive__title">THE ARCHIVE</h1>
            <p className="products-archive__sub">{archiveSubtext}</p>
          </div>
          <div className="products-archive__search-row">
            <input
              type="search"
              className="products-archive__search-input"
              placeholder="SEARCH ARCHIVE..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchProductHandler();
              }}
              aria-label="Search archive"
            />
            <button type="button" className="products-archive__search-btn" onClick={searchProductHandler}>
              SEARCH
            </button>
          </div>
        </header>

        <div className="products-archive__layout">
          <aside className="products-archive__sidebar">
            <p className="products-archive__sidebar-heading">FILTER BY</p>
            <div className="products-archive__filter-list">
              <button
                type="button"
                className={
                  catalogFilter === "NEW_DROPS"
                    ? "archive-filter-btn archive-filter-btn--new-drops archive-filter-btn--new-drops-active"
                    : "archive-filter-btn archive-filter-btn--new-drops"
                }
                onClick={activateNewDropsFilter}
              >
                NEW DROPS
                <span className="archive-filter-btn__new-pill" aria-hidden>
                  NEW
                </span>
              </button>
              {COLLECTION_FILTERS.map(({ value, label }) => {
                const active =
                  catalogFilter !== "NEW_DROPS" && productSearch.productCollection === value;
                return (
                  <button
                    key={label}
                    type="button"
                    className={
                      active
                        ? "archive-filter-btn archive-filter-btn--active"
                        : "archive-filter-btn"
                    }
                    onClick={() => searchCollectionHandler(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <hr className="products-archive__divider" />
            <p className="products-archive__sidebar-heading">SORT BY</p>
            <div className="products-archive__filter-list">
              {SORT_FILTERS.map(({ value, label }) => {
                const active = productSearch.order === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={
                      active
                        ? "archive-filter-btn archive-filter-btn--sort-active"
                        : "archive-filter-btn"
                    }
                    onClick={() => searchOrderHandler(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="products-archive__main">
            <div className="products-archive__grid">
              {showNewDropsEmpty ? (
                <p className="products-archive__empty products-archive__empty--new-drops">
                  No new drops yet. Check back soon!
                </p>
              ) : safeProducts.length !== 0 ? (
                safeProducts.map((product: Product) => (
                  <ArchiveProductCard
                    key={product._id}
                    product={product}
                    onNavigate={chooseDishHandler}
                    onAddToCart={onAdd}
                  />
                ))
              ) : (
                <p className="products-archive__empty">No products match your search.</p>
              )}
            </div>

            <div className="products-archive__pagination">
              <Pagination
                count={
                  catalogFilter === "NEW_DROPS" && newDropsPageCount
                    ? newDropsPageCount
                    : safeProducts.length !== 0
                      ? productSearch.page + 1
                      : productSearch.page
                }
                page={productSearch.page}
                renderItem={(item: PaginationRenderItemParams) => (
                  <PaginationItem
                    components={{
                      previous: ArrowBackIcon,
                      next: ArrowForwardIcon,
                    }}
                    {...item}
                  />
                )}
                onChange={paginationHandler}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "rgba(255,255,255,0.65)",
                    borderColor: "rgba(255,255,255,0.12)",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "rgba(102,126,234,0.25) !important",
                    color: "#b9c3ff",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
