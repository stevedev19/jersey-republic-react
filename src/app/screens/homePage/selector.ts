import {createSelector} from "reselect";
import { AppRootState } from "../../../lib/types/screen";

const selectHomePage =(state: AppRootState) => state.homePage;

export const retrieveTrendingDishes = createSelector(
    selectHomePage,
    (HomePage) => HomePage.trendingDishes
);

export const retrieveNewDishes = createSelector(
    selectHomePage,
    (HomePage)=> HomePage.newDishes
);

export const retrieveTopUsers = createSelector(
    selectHomePage,
    (HomePage)=> HomePage.topUsers
);