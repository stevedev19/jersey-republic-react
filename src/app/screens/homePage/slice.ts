import {createSlice} from "@reduxjs/toolkit"
import { HomePageState } from "../../../lib/types/screen"

const initialState: HomePageState = {
    trendingDishes: [],
    newDishes: [],
    topUsers: [],
}

const homePageSlice = createSlice({
    name: "homePage",
    initialState,
    reducers:{
        setTrendingDishes: (state, action) => {
            state.trendingDishes = action.payload;
        },
        setNewDishes: (state, action) => {
            state.newDishes = action.payload;
           },
           setTopUsers: (state, action) => {
            state.topUsers = action.payload;
           },
    },
})

export const { setTrendingDishes, setNewDishes, setTopUsers } = homePageSlice.actions

const HomePageReducer = homePageSlice.reducer;
export default HomePageReducer;