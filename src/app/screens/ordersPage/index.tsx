import { Container, Stack, Box } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import  TabContext  from "@mui/lab/TabContext";
import LocationOnIcon from "@mui/icons-material/LocationOn"
import PausedOrders from "./PausedOrders";
import ProcessOrders from "./ProcessOrders";
import FinishedOrders from "./FinishedOrders";
import "../../../css/order.css";

export default function OrdersPage() {
  const [value, setValue] = useState("1");

  const handleChange = (e: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div className={"order-page"}>
      <Container className="order-container">
        <Stack className={"order-left"}>
          <TabContext value={value}>
            <Box className={"order-nav-frame"}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                className={"table_list"}
                >
                 <Tab label="PAUSED ORDERS" value={"1"} />
                 <Tab label="PROCESS ORDERS" value={"2"} />
                 <Tab label="FINISHED ORDERS" value={"3"} />
                </Tabs>
              </Box>
            </Box>
            <Stack>
              <PausedOrders />
              <ProcessOrders />
              <FinishedOrders />
            </Stack>
          </TabContext>
        </Stack>
<Stack className="order-right">
          <Box className="order-right-top">
            <img src="/icons/default-user.svg" className="order-right-top-img" />
            <div className="order-right-top-text">
              <p className="order-right-top-name">Martin</p>
              <p className="order-right-top-user">User</p>
            </div>
            <div>
              <hr
                style={{
                  width: "332px",
                  height: "2px",
                  textAlign: "left",
                  marginLeft: "0px",
                  marginTop: "20px",
                }}
              />
            </div>
            <div className="order-right-top-address">
              <img src="/icons/location.svg" />
              <p>Do not exist</p>
            </div>
          </Box>
             
        
           <Box className="order-right-bottom">
            <input
              className="card-number"
              type="text"
              placeholder="Card number : **** 4090 2002 7495"
            />
            <div className="date-and-cvv">
              <input
                type="text"
                name=""
                id=""
                placeholder="07/24"
                style={{ marginRight: "10px" }}
              />
              <input type="text" name="" id="" placeholder="CVV:010" />
            </div>
            <input type="text" name="" id="" placeholder="Martin Robertson" />
            <div className="payment-types">
              <img src="/icons/western-card.svg" alt="" />
              <img src="/icons/master-card.svg" alt="" />
              <img src="/icons/paypal-card.svg" alt="" />
              <img src="/icons/visa-card.svg" alt="" />
            </div>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}