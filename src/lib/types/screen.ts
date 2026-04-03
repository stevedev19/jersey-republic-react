 import { Member } from "./member";
import { Order } from "./order";
import { Product } from "./product";

/** REACT APP STATE **/
export interface AppRootState {
ordersPage: any;
homePage: HomePageState;
productsPage: ProductsPageState;
}

/** HOMEPAGE **/
export interface HomePageState{
    /** Homepage carousel: newest + top views so multi-image hover works for new arrivals */
    trendingDishes: Product[];
    newDishes: Product[];
    topUsers: Member[];
}

/** PRODUCTS PAGE **/
export interface ProductsPageState {
    restaurant: Member | null;
    chosenProduct: Product | null;
    products: Product[];
}


/** ORDERS PAGE **/
export interface OrdersPageState {
  pausedOrders: Order[];
  processOrders: Order[];
  finishedOrders: Order[];
}
