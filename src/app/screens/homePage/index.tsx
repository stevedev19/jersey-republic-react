import React, { useEffect } from "react";
import Statistics from "./Statistics";
import PopularDishes from "./PopularDishes";
import NewDishes from "./NewDishes";
import Advertisement from "./Advertisement";
import ActiveUsers from "./ActiveUsers";
import Events from "./Events";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setNewDishes, setPopularDishes, setTopUsers } from "./slice";
import { Product } from "../../../lib/types/product";
import { ProductCollection } from "../../../lib/enums/product.enum";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import "../../../css/home.css";

/* REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setPopularDishes: (data: Product[]) => dispatch(setPopularDishes(data)),
  setNewDishes: (data: Product[]) => dispatch(setNewDishes(data)),
   setTopUsers: (data: Member[]) => dispatch(setTopUsers(data))
}); // setPopularDishes reducer orqali setPopularDishes kommandasini hosil qilmoqdamiz!

export default function HomePage() {
  // Selector: Store => Data 
  const { setPopularDishes, setNewDishes, setTopUsers } = actionDispatch(useDispatch());
  
    useEffect(() => {
      // Backend server data fetch => Data
        const product = new ProductService();
        // Get ALL products (no collection filter) to ensure we have enough to choose from
        product
        .getProducts({
            page: 1,
            limit: 50, // Get many products to ensure we have enough
            order: "productViews", // Sort by views
            // Remove productCollection filter to get products from all collections
        })
        .then(data => {
            console.log("API returned ALL products:", data);
            
            // Show all collections found
            const collections = Array.from(new Set(data.map((p: Product) => p.productCollection)));
            console.log("Available collections:", collections);
            
            // Filter for Premier League products and sort by views
            const premierLeagueProducts = data.filter((product: Product) => 
                product.productCollection === ProductCollection.PREMIER_LEAGUE
            );
            console.log("Premier League products found:", premierLeagueProducts.length);
            
            // If we don't have enough Premier League products, include other football collections
            let productsToShow = premierLeagueProducts;
            if (premierLeagueProducts.length < 4) {
                console.log("Not enough Premier League products, including other football collections...");
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
                console.log("Football products found:", productsToShow.length);
            }
            
            // Sort by views in descending order and take top 4
            const sortedData = productsToShow
                .sort((a: Product, b: Product) => b.productViews - a.productViews)
                .slice(0, 4); // Take only top 4
            console.log("Top 4 most viewed products:", sortedData);
            setPopularDishes(sortedData);
        })
        .catch((err) => {
            console.log("Error fetching products:", err);
            // Fallback: try with Premier League filter
            product
            .getProducts({
                page: 1,
                limit: 20,
                order: "productViews",
                productCollection: ProductCollection.PREMIER_LEAGUE,
            })
            .then(fallbackData => {
                console.log("Fallback Premier League data:", fallbackData);
                const sortedFallback = fallbackData
                    .sort((a: Product, b: Product) => b.productViews - a.productViews)
                    .slice(0, 4);
                console.log("Top 4 from Premier League fallback:", sortedFallback);
                setPopularDishes(sortedFallback);
            })
            .catch(fallbackErr => console.log("Fallback also failed:", fallbackErr));
        });

         product
        .getProducts({
            page: 1,
            limit: 4,
            order: "createdAt",
        })
        .then((data) => setNewDishes(data))
        .catch((err) => console.log(err));

    const member = new MemberService();
    member
    .getTopUsers()
    .then((data) => setTopUsers(data))
    .catch((err) => console.log(err));
    }, []);

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