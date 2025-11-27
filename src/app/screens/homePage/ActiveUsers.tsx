import { Box, Container, Stack } from "@mui/material";
import Card from "@mui/joy/Card";
import { CssVarsProvider, Typography } from "@mui/joy";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { retrieveTopUsers } from "./selector";
import { serverApi } from "../../../lib/config";
import { Member } from "../../../lib/types/member";

/* REDUX SLICE & SELECTOR*/
const topUsersRetriever = createSelector(
  retrieveTopUsers, 
  (topUsers) => ({ topUsers, })
);

export default function ActiveUsers() {
 const { topUsers } = useSelector(topUsersRetriever);
 const safeTopUsers = Array.isArray(topUsers) ? topUsers : [];

  return (
    <div className="active-users-frame">
      <Container>
        <Stack className={"main"}>
          <Box className={"category-title"}>Active Users</Box>
          <Stack className={"cards-frame"}>
            <CssVarsProvider>
              {safeTopUsers.length !== 0 ? (
                safeTopUsers.map((member, Member) => {
                  const imagePath = member.memberImage
                    ? member.memberImage.startsWith("http")
                      ? member.memberImage
                      : `${serverApi}${member.memberImage}`
                    : "/icons/default-user.svg";
                  return (
                  <Card key={member._id} variant="outlined" className="card">
                    <CardOverflow>
                      <AspectRatio ratio="1">
                        <img src={imagePath} alt="" />
                      </AspectRatio>
                    </CardOverflow>
                    <CardOverflow variant="soft" className="product-detail">
                      <Typography className="title">
                        {member.memberNick}
                      </Typography>
                    </CardOverflow>
                  </Card>
                );
              })
              ) : (
                <Box className="no-data">No Active Users!</Box>
              )}
            </CssVarsProvider>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
