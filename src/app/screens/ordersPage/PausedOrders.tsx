import React from "react";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import TabPanel from "@mui/lab/TabPanel";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { retrievePausedOrders } from "./selector";
import { Messages, getImageUrl } from "../../../lib/config";
import { Order, OrderItem, OrderUpdateInput } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { T } from "../../../lib/types/common";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { OrderStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { useGlobals } from "../../hooks/useGlobals";
import OrdersEmptyState from "./OrdersEmptyState";


/* REDUX SLICE & SELECTOR*/
// setPopularDishes reduceri orqali setPopularDishes kommandasini hosil qilayapmiz
const pausedOrdersRetriever = createSelector(
  retrievePausedOrders,
  (pausedOrders) => ({ pausedOrders })
);

interface PausedOrderProps {
  setValue: (input: string) => void;
}

export default function PausedOrders(props: PausedOrderProps) {
  const {setValue} = props
  const {authMember, setOrderBuilder} = useGlobals();
  const { pausedOrders } = useSelector(pausedOrdersRetriever);
  const safePausedOrders = Array.isArray(pausedOrders) ? pausedOrders : [];
   

   /**HANDLERS */

   const deleteOrderHandler = async (e: T)=>{
    try{
      if(!authMember) throw new Error(Messages.error2)
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
       orderId: orderId,
        orderStatus: OrderStatus.DELETE,
      }

      const confirmation = window.confirm("Do you want to delete the order?")
      if(confirmation){
        const order = new OrderService()
        await order.updateOrder(input);
        setValue("2")
        setOrderBuilder(new Date())
      }

    }catch(err){
     console.log(err);
     sweetErrorHandling(err).then();
    }
  }

  const processOrderHandler = async (e: T)=>{
    try{
      if(!authMember) throw new Error(Messages.error2)
        //PAYMENT PROCESS

      const orderId = e.target.value;
      const input: OrderUpdateInput = {
       orderId: orderId,
        orderStatus: OrderStatus.PROCESS,
      }

      const confirmation = window.confirm("Do you want to proceed this payment?")
      if(confirmation){
        const order = new OrderService()
        await order.updateOrder(input);
        setValue("2");
        setOrderBuilder(new Date())
      }

    }catch(err){
     console.log(err);
     sweetErrorHandling(err).then();
    }
  }

  return (
    <TabPanel value={"1"}>
      <Stack>
        {safePausedOrders.map((order: Order) => {
          const orderItems = Array.isArray(order?.orderItems) ? order.orderItems : [];
          const productList = Array.isArray(order?.productData) ? order.productData : [];
          return (
            <Box key={order._id} className="order-main-box">
              <Box className="order-box-scroll">
                {orderItems.map((item: OrderItem) => {
                  const product = productList.find(
                    (ele: Product) => item.productId === ele._id
                  );
                  
                  // Skip rendering if product is not found
                  if (!product || !product.productImages || product.productImages.length === 0) {
                    return null;
                  }
                  
                  const imagePath = product.productImages && product.productImages.length > 0 
                    ? (product.productImages[0].startsWith('http') 
                        ? product.productImages[0] 
                        : getImageUrl(product.productImages[0]))
                    : '/img/noimage-list.svg';
                  return (
                     <Box key={item._id} className="orders-name-price">
                      <img
                        src={imagePath}
                        className={"order-dish-img"}
                        alt={product.productName || ""}
                      />
                      <p className="title-dish">{product.productName || 'Unknown Product'}</p>
                      <Box className="price-box">
                        <p>${item.itemPrice}</p>
                        <img src="/icons/close.svg" alt="" />
                        <p>{item.itemQuantity}</p>
                        <img src="/icons/pause.svg" alt="" />
                         <p style={{ marginLeft: "15px" }}>
                          ${item.itemQuantity * item.itemPrice}
                        </p>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Box className="total-price-box">
                <Box className="box-total">
                  <p>Product price</p>
                  <p>${order.orderTotal - order.orderDelivery}</p>
                  <img
                    src="/icons/plus.svg"
                    style={{ marginLeft: "20px" }}
                    alt=""
                  />
                  <p>Delivery cost</p>
                   <p>${order.orderDelivery}</p>
                  <img
                    src="/icons/pause.svg"
                    style={{ marginLeft: "20px" }}
                    alt=""
                  />
                  <p>Total</p>
                   <p>${order.orderTotal}</p>
                </Box>
                <Button
                  value={order._id}
                  variant="contained"
                  color="secondary"
                  className="cancel-button"
                  sx={{ marginRight: "20px", marginLeft: "20px" }}
                  onClick={deleteOrderHandler}
                >
                  Cancel
                </Button>
             <Button
                  value={order._id}
                  variant="contained"
                  className="pay-button"
                  onClick={processOrderHandler}
                  sx={{ marginRight: "20px" }}
                >
            Payment
            </Button>

              </Box>
            </Box>
          );
        })}

        {safePausedOrders.length === 0 && <OrdersEmptyState />}
      </Stack>
    </TabPanel>
  );
}