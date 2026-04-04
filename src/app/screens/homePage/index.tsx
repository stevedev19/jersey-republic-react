import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import ArchiveLanding from "./ArchiveLanding";
import { CartItem } from "../../../lib/types/search";
import { setNewDishes, setTrendingDishes, setTopUsers } from "./slice";
import { Product } from "../../../lib/types/product";
import { ProductCollection } from "../../../lib/enums/product.enum";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";

export interface HomePageProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => boolean;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
  setSignupOpen: (isOpen: boolean) => void;
  setLoginOpen: (isOpen: boolean) => void;
  anchorEl: HTMLElement | null;
  handleLogoutClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleCloseLogout: () => void;
  handleLogoutRequest: () => void;
}

const actionDispatch = (dispatch: Dispatch) => ({
  setTrendingDishes: (data: Product[]) => dispatch(setTrendingDishes(data)),
  setNewDishes: (data: Product[]) => dispatch(setNewDishes(data)),
  setTopUsers: (data: unknown[]) => dispatch(setTopUsers(data)),
});

function mergeProductsById(lists: Product[][]): Product[] {
  const map = new Map<string, Product>();
  for (const list of lists) {
    for (const p of list) {
      if (p?._id) map.set(p._id, p);
    }
  }
  return Array.from(map.values());
}

export default function HomePage(props: HomePageProps) {
  const { setTrendingDishes, setNewDishes, setTopUsers } = actionDispatch(useDispatch());

  useEffect(() => {
    const productService = new ProductService();
    const memberService = new MemberService();

    Promise.all([
      productService.getProducts({ page: 1, limit: 80, order: "productViews" }),
      productService.getProducts({ page: 1, limit: 40, order: "createdAt" }),
    ])
      .then(([byViews, byNewest]) => {
        const safeData = mergeProductsById([
          Array.isArray(byViews) ? byViews : [],
          Array.isArray(byNewest) ? byNewest : [],
        ]);

        const jerseyCollections = [
          ProductCollection.PREMIER_LEAGUE,
          ProductCollection.LA_LIGA,
          ProductCollection.SERIE_A,
          ProductCollection.BUNDESLIGA,
          ProductCollection.LIGUE_1,
          ProductCollection.CHAMPIONS_LEAGUE,
          ProductCollection.NATIONAL_TEAMS,
          ProductCollection.UZBEKISTAN_LEAGUE,
          ProductCollection.RETRO,
          ProductCollection.OTHER,
        ];

        /** All jersey-type products for "Trending Now" (not only Premier League) */
        const trendingPool = safeData.filter((product: Product) =>
          jerseyCollections.includes(product.productCollection)
        );

        const sortedByViews = [...trendingPool].sort(
          (a: Product, b: Product) => b.productViews - a.productViews
        );
        const sortedByNew = [...trendingPool].sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const trendingMerged: Product[] = [];
        const seenTrending = new Set<string>();
        for (const p of sortedByNew.slice(0, 10)) {
          if (!seenTrending.has(p._id)) {
            seenTrending.add(p._id);
            trendingMerged.push(p);
          }
        }
        for (const p of sortedByViews) {
          if (!seenTrending.has(p._id)) {
            seenTrending.add(p._id);
            trendingMerged.push(p);
          }
          if (trendingMerged.length >= 16) break;
        }
        const trendingFallback = sortedByViews.length
          ? sortedByViews
          : [...safeData].sort((a: Product, b: Product) => b.productViews - a.productViews);
        setTrendingDishes(
          trendingMerged.length > 0 ? trendingMerged.slice(0, 16) : trendingFallback.slice(0, 16)
        );
      })
      .catch((err) => console.log("Error getProducts", err));

    productService
      .getProducts({
        page: 1,
        limit: 4,
        order: "createdAt",
      })
      .then((data) => setNewDishes(Array.isArray(data) ? data : []))
      .catch((err) => console.log("Error getProducts", err));

    memberService
      .getTopUsers()
      .then((data) => setTopUsers(Array.isArray(data) ? data : []))
      .catch((err) => console.log("Error getTopUsers", err));
  }, [setTrendingDishes, setNewDishes, setTopUsers]);

  return <ArchiveLanding {...props} />;
}
