import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
} from "../../../lib/enums/product.enum";
import { uniformSeasonSelectOptions, getCurrentSeason } from "../../../lib/season";
import { serverApiBase } from "../../../lib/config";
import { fetchNewDropsPageData, NewDropsWindow } from "../../../lib/newDropsApi";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
    "&:hover fieldset": { borderColor: "rgba(255, 107, 53, 0.5)" },
    "&.Mui-focused fieldset": { borderColor: "#ff6b35" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
  "& .MuiOutlinedInput-input": { color: "white" },
} as const;

const collectionChoices = [
  ProductCollection.PREMIER_LEAGUE,
  ProductCollection.LA_LIGA,
  ProductCollection.SERIE_A,
  ProductCollection.BUNDESLIGA,
  ProductCollection.LIGUE_1,
  ProductCollection.CHAMPIONS_LEAGUE,
  ProductCollection.NATIONAL_TEAMS,
  ProductCollection.UZBEKISTAN_LEAGUE,
  ProductCollection.RETRO,
  ProductCollection.OTHER,
];

const sizeChoices = [
  ProductSize.XS,
  ProductSize.S,
  ProductSize.M,
  ProductSize.L,
  ProductSize.XL,
  ProductSize.XXL,
];

export type AdminProductFormValues = {
  productName: string;
  productPrice: string;
  productCollection: ProductCollection;
  productSize: ProductSize;
  productLeftCount: string;
  productDesc: string;
  uniformSeason: string;
  productVolume: string;
  madeYear: string;
};

const defaultForm: AdminProductFormValues = {
  productName: "",
  productPrice: "",
  productCollection: ProductCollection.PREMIER_LEAGUE,
  productSize: ProductSize.M,
  productLeftCount: "10",
  productDesc: "",
  uniformSeason: "",
  productVolume: "0",
  madeYear: "",
};

export default function AdminProductForm() {
  const [values, setValues] = useState<AdminProductFormValues>(defaultForm);
  const [savedHint, setSavedHint] = useState("");
  const [dropWindow, setDropWindow] = useState<NewDropsWindow | null>(null);
  const [dropWindowLoaded, setDropWindowLoaded] = useState(false);

  const seasonOptions = useMemo(() => uniformSeasonSelectOptions(5), []);
  const maxMadeYear = new Date().getFullYear();

  useEffect(() => {
    const ac = new AbortController();
    fetchNewDropsPageData({ signal: ac.signal })
      .then((data) => {
        setDropWindow(data.window);
      })
      .finally(() => {
        if (!ac.signal.aborted) setDropWindowLoaded(true);
      });
    return () => ac.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const madeYearNum =
      values.madeYear.trim() === "" ? null : Number(values.madeYear);
    const payload = {
      productName: values.productName.trim(),
      productPrice: Number(values.productPrice),
      productCollection: values.productCollection,
      productSize: values.productSize,
      productLeftCount: Number(values.productLeftCount) || 0,
      productDesc: values.productDesc.trim() || undefined,
      uniformSeason: values.uniformSeason.trim() || null,
      productStatus: ProductStatus.PROCESS,
      productVolume: Number(values.productVolume) || 0,
      madeYear: madeYearNum,
    };
    console.info("[Admin] Product payload:", payload);
    try {
      if (serverApiBase) {
        await axios.post(`${serverApiBase}/api/products`, payload, {
          withCredentials: true,
        });
        setSavedHint("Product saved to the server.");
      } else {
        setSavedHint("API URL not configured — payload logged to console.");
      }
    } catch {
      setSavedHint("Server save failed — check console for payload; verify POST /api/products.");
    }
    window.setTimeout(() => setSavedHint(""), 8000);
  };

  return (
    <Box
      component="section"
      sx={{
        mt: 6,
        mb: 4,
        p: 4,
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
        Create / edit product
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.65)", mb: 3 }}>
        Add a <strong style={{ color: "#ffb347" }}>new jersey</strong> below. Set the made year so it
        can qualify for New Drops. <strong style={{ color: "#ffb347" }}>Uniform season</strong> uses
        storefront labels (current: {getCurrentSeason()}).
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Box
            className="admin-new-jersey-section"
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "2px solid rgba(255, 179, 71, 0.5)",
              background: "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(247,147,30,0.08) 100%)",
              boxShadow: "0 8px 32px rgba(255, 107, 53, 0.15)",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                display: "block",
                color: "#ffb347",
                fontWeight: 800,
                letterSpacing: "0.35em",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              NEW JERSEY
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
              Jersey made year
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mb: 2, maxWidth: 520 }}>
              Enter the calendar year this kit was manufactured. This drives New Drops eligibility on the
              storefront.
            </Typography>
            <div className="admin-made-year-field">
              <label className="admin-made-year-label" htmlFor="madeYear">
                JERSEY MADE YEAR
              </label>
              <input
                id="madeYear"
                name="madeYear"
                type="number"
                className="admin-made-year-input"
                min={1900}
                max={maxMadeYear}
                placeholder="e.g. 2005"
                value={values.madeYear}
                onChange={(e) => setValues({ ...values, madeYear: e.target.value })}
                autoComplete="off"
              />
              <p className="admin-made-year-help">
                {!dropWindowLoaded
                  ? "Loading catalog window…"
                  : dropWindow
                    ? `Jerseys from ${dropWindow.startYear}–${dropWindow.endYear} will appear in New Drops section`
                    : "Unable to load New Drops window from the API."}
              </p>
            </div>
          </Box>

          <Typography
            variant="overline"
            sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", mt: 1 }}
          >
            Product details
          </Typography>

          <TextField
            required
            fullWidth
            label="Product name"
            value={values.productName}
            onChange={(e) => setValues({ ...values, productName: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            required
            fullWidth
            type="number"
            label="Price"
            inputProps={{ min: 0, step: "0.01" }}
            value={values.productPrice}
            onChange={(e) => setValues({ ...values, productPrice: e.target.value })}
            sx={textFieldSx}
          />

          <FormControl fullWidth sx={textFieldSx}>
            <InputLabel id="admin-collection-label" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Collection
            </InputLabel>
            <Select
              labelId="admin-collection-label"
              label="Collection"
              value={values.productCollection}
              onChange={(e) =>
                setValues({ ...values, productCollection: e.target.value as ProductCollection })
              }
              sx={{ color: "white" }}
            >
              {collectionChoices.map((c) => (
                <MenuItem key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={textFieldSx}>
            <InputLabel id="admin-size-label" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Size
            </InputLabel>
            <Select
              labelId="admin-size-label"
              label="Size"
              value={values.productSize}
              onChange={(e) =>
                setValues({ ...values, productSize: e.target.value as ProductSize })
              }
              sx={{ color: "white" }}
            >
              {sizeChoices.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Stock count"
            inputProps={{ min: 0, step: 1 }}
            value={values.productLeftCount}
            onChange={(e) => setValues({ ...values, productLeftCount: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Description (optional)"
            value={values.productDesc}
            onChange={(e) => setValues({ ...values, productDesc: e.target.value })}
            sx={textFieldSx}
          />

          <FormControl fullWidth sx={textFieldSx}>
            <InputLabel id="admin-uniform-season-label" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Uniform Season
            </InputLabel>
            <Select
              labelId="admin-uniform-season-label"
              label="Uniform Season"
              displayEmpty
              value={values.uniformSeason}
              onChange={(e) => setValues({ ...values, uniformSeason: e.target.value as string })}
              sx={{ color: "white" }}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography component="span" sx={{ color: "rgba(255,255,255,0.45)" }}>
                      e.g. {getCurrentSeason()}
                    </Typography>
                  );
                }
                return selected;
              }}
            >
              <MenuItem value="">
                <em>Optional — omit for legacy items</em>
              </MenuItem>
              {seasonOptions.map((season) => (
                <MenuItem key={season} value={season}>
                  {season}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "14px 24px",
              borderRadius: 25,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              color: "white",
              background: "linear-gradient(45deg, #ff6b35, #f7931e)",
              boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
            }}
          >
            Save product draft
          </button>

          {savedHint ? (
            <Typography variant="body2" sx={{ color: "#8bc34a", mt: 1 }}>
              {savedHint}
            </Typography>
          ) : null}
        </Stack>
      </form>
    </Box>
  );
}
