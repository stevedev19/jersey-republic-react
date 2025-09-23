import React, { useEffect } from "react";
import Statistics from "./Statistics";
import PopularDishes from "./PopularDishes";
import NewDishes from "./NewDishes";
import Advertisement from "./Advertisement";
import ActiveUsers from "./ActiveUsers";
import Events from "./Events";
import { useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setNewDishes, setPopularDishes, setTopUsers } from "./slice";
import { Product } from "../../../lib/types/product";
import { ProductCollection } from "../../../lib/enums/product.enum";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import "../../../css/home.css";

/* REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setPopularDishes: (data: Product[]) => dispatch(setPopularDishes(data)),
  setNewDishes: (data: Product[]) => dispatch(setNewDishes(data)),
   setTopUsers: (data: any[]) => dispatch(setTopUsers(data))
}); // setPopularDishes reducer orqali setPopularDishes kommandasini hosil qilmoqdamiz!

export default function HomePage() {
  // Selector: Store => Data 
  const { setPopularDishes, setNewDishes, setTopUsers } = actionDispatch(useDispatch());
  
  useEffect(() => {
    const productService = new ProductService();
    const memberService = new MemberService();

    productService
      .getProducts({
        page: 1,
        limit: 50,
        order: "productViews",
      })
      .then((data) => {
        console.log("API returned ALL products:", data);
        
        // Filter for Premier League products and sort by views
        const premierLeagueProducts = data.filter((product: Product) => 
          product.productCollection === ProductCollection.PREMIER_LEAGUE
        );
        
        // If we don't have enough Premier League products, include other football collections
        let productsToShow = premierLeagueProducts;
        if (premierLeagueProducts.length < 4) {
          const footballCollections = [
            ProductCollection.PREMIER_LEAGUE,
            ProductCollection.LA_LIGA,
            ProductCollection.SERIE_A,
            ProductCollection.BUNDESLIGA,
            ProductCollection.LIGUE_1,
            ProductCollection.CHAMPIONS_LEAGUE,
            ProductCollection.NATIONAL_TEAMS
          ];
          
          productsToShow = data.filter((product: Product) => 
            footballCollections.includes(product.productCollection)
          );
        }
        
        // Sort by views and take top 4
        const sortedData = productsToShow
          .sort((a: Product, b: Product) => b.productViews - a.productViews)
          .slice(0, 4);
        
        setPopularDishes(sortedData);
      })
      .catch((err) => console.log("Error getProducts", err));

    productService
      .getProducts({
        page: 1,
        limit: 4,
        order: "createdAt",
      })
      .then((data) => setNewDishes(data))
      .catch((err) => console.log("Error getProducts", err));

    memberService
      .getTopUsers()
      .then((data) => setTopUsers(data))
      .catch((err) => console.log("Error getTopUsers", err));
  }, [setPopularDishes, setNewDishes, setTopUsers]);

  return (
  <div className={"homepage"}>
    <Statistics />
    <PopularDishes />
    <NewDishes />
    <Advertisement />
    <ActiveUsers />
    <Events />
  </div>
  );
}