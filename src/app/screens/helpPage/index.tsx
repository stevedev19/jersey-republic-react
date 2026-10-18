import React from "react";
import { Box, Container, Stack, Tabs } from "@mui/material";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { useTranslation } from "react-i18next";
import "../../../css/help.css";

type FaqItem = { question: string; answer: string };

export default function HelpPage() {
  const [value, setValue] = React.useState("1");
  const { t } = useTranslation();
  const terms = t("help.terms", { returnObjects: true }) as string[];
  const faq = t("help.faq", { returnObjects: true }) as FaqItem[];

  /** HANDLERS **/
  const handleChange = (e: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div className={"help-page stitch-navbar-offset"}>
      <Container className={"help-container"}>
        <TabContext value={value}>
          <Box className={"help-menu"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label={t("help.tabsLabel")}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%", // ensures it stretches across
                }}
              >
                <Tab label={t("help.tabs.terms")} value="1" />
                <Tab label={t("help.tabs.faq")} value="2" sx={{ margin: "0 auto" }} />{" "}
                {/* stays in center */}
                <Tab label={t("help.tabs.contact")} value="3" />
              </Tabs>
            </Box>
          </Box>
          <Stack>
            <Stack className={"help-main-content"}>
              <TabPanel value={"1"}>
                <Stack className={"rules-box"}>
                  <Box className={"rules-frame"}>
                    {terms.map((value, number) => {
                      return <p key={number}>{value}</p>;
                    })}
                  </Box>
                </Stack>
              </TabPanel>
              <TabPanel value={"2"}>
                <Stack className={"accordion-menu"}>
                  {faq.map((value, number) => {
                    return (
                      <Accordion key={number}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>{value.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>{value.answer}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </TabPanel>
              <TabPanel value={"3"}>
                <Stack className={"admin-letter-box"}>
                  <Stack className={"admin-letter-container"}>
                    <Box className={"admin-letter-frame"}>
                      <span>{t("help.contact.title")}</span>
                      <p>{t("help.contact.subtitle")}</p>
                    </Box>
                    <form
                      action={"#"}
                      method={"POST"}
                      className={"admin-letter-frame"}
                    >
                      <div className={"admin-input-box"}>
                        <label>{t("help.contact.name")}</label>
                        <input
                          type={"text"}
                          name={"memberNick"}
                          placeholder={t("help.contact.namePlaceholder")}
                        />
                      </div>
                      <div className={"admin-input-box"}>
                        <label>{t("help.contact.email")}</label>
                        <input
                          type={"text"}
                          name={"memberEmail"}
                          placeholder={t("help.contact.emailPlaceholder")}
                        />
                      </div>
                      <div className={"admin-input-box"}>
                        <label>{t("help.contact.message")}</label>
                        <textarea
                          name={"memberMsg"}
                          placeholder={t("help.contact.messagePlaceholder")}
                        ></textarea>
                      </div>
                      <Box
                        display={"flex"}
                        justifyContent={"flex-end"}
                        sx={{ mt: "30px" }}
                      >
                        <Button type={"submit"} variant="contained">
                          {t("help.contact.send")}
                        </Button>
                      </Box>
                    </form>
                  </Stack>
                </Stack>
              </TabPanel>
            </Stack>
          </Stack>
        </TabContext>
      </Container>
    </div>
  );
}
