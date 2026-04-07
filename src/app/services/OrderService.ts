import { serverApi } from "../../lib/config";
import axios from "axios";
import Cookies from "universal-cookie";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../../lib/types/order";
import { CartItem } from "../../lib/types/search";

function getBearerToken(): string | undefined {
  const fromCookie = new Cookies().get("accessToken");
  if (fromCookie) return String(fromCookie);
  if (typeof localStorage !== "undefined") {
    const fromStorage = localStorage.getItem("accessToken");
    if (fromStorage) return fromStorage;
  }
  return undefined;
}

function orderAuthAxiosOptions(): { withCredentials: true; headers: Record<string, string> } {
  const token = getBearerToken();
  return {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

class OrderService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async createOrder(input: CartItem[]): Promise<Order> {
    try {
      const orderItems: OrderItemInput[] = input.map((cartItem: CartItem) => {
        return {
          itemQuantity: cartItem.quantity,
          itemPrice: cartItem.price,
          productId: cartItem._id,
        };
      });

      const url = `${this.path}order/create`;
      console.log("token in storage:", localStorage.getItem("accessToken"));
      console.log("accessToken cookie present:", Boolean(new Cookies().get("accessToken")));
      const authOptions = orderAuthAxiosOptions();
      console.log("checkout Authorization header set:", Boolean(authOptions.headers.Authorization));

      const result = await axios.post(url, orderItems, authOptions);

      console.log("createOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createOrder:", err);
      throw err;
    }
  }

  public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      //   axios.defaults.withCredentials = true;
      const url = `${this.path}order/all`;
      const query = `?page=${input.page}&limit=${input.limit}&orderStatus=${input.orderStatus}`;

      const result = await axios.get(url + query, { withCredentials: true });
      console.log("getMyOrders:", result);

      return Array.isArray(result.data) ? result.data : [];
    } catch (err) {
      console.log("Error, getMyOrders:", err);
      throw err;
    }
  }

  public async updateOrder(input: OrderUpdateInput): Promise<Order>{
        try{
       
      const url = `${this.path}order/update`
      const result = await axios.post(url, input, { withCredentials: true })
      console.log("updateOrder:", result)

      return result.data
        }catch(err){
           console.log("Error.updateOrder:", err)
           throw err;
        }
       }

}

export default OrderService;