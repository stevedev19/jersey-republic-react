import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
} from "../../../lib/enums/product.enum";
import { uniformSeasonSelectOptions, getCurrentSeason } from "../../../lib/season";
import { serverApiBase } from "../../../lib/config";
import { fetchNewDropsPageData, NewDropsWindow } from "../../../lib/newDropsApi";
import { collectionLabel } from "../../components/product/archiveCardUtils";

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
] as const;

const sizeChoices = [
  ProductSize.XS,
  ProductSize.S,
  ProductSize.M,
  ProductSize.L,
  ProductSize.XL,
  ProductSize.XXL,
];

const MADE_YEAR_MIN = 2018;
const MADE_YEAR_MAX = 2026;
const madeYearOptions = Array.from(
  { length: MADE_YEAR_MAX - MADE_YEAR_MIN + 1 },
  (_, i) => String(MADE_YEAR_MIN + i)
);

const kitTypeChoices: { value: string; label: string }[] = [
  { value: "0", label: "Home" },
  { value: "1", label: "Away" },
  { value: "2", label: "Third" },
  { value: "3", label: "Training" },
  { value: "4", label: "Special" },
];

const DESC_MAX = 2000;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    bgcolor: "#f8fafc",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb" },
  },
  "& .MuiInputLabel-root": { color: "#64748b" },
  "& .MuiOutlinedInput-input": { color: "#0f172a" },
} as const;

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

const INITIAL_IMAGE_SLOTS = 3;
const MAX_IMAGE_SLOTS = 5;

function truncateFilename(name: string, max = 16): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export default function AdminProductForm() {
  const [values, setValues] = useState<AdminProductFormValues>(defaultForm);
  const [savedHint, setSavedHint] = useState("");
  const [dropWindow, setDropWindow] = useState<NewDropsWindow | null>(null);
  const [dropWindowLoaded, setDropWindowLoaded] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [imageSlotCount, setImageSlotCount] = useState(INITIAL_IMAGE_SLOTS);
  const [, setImageBump] = useState(0);
  const imageFilesRef = useRef<(File | null)[]>([]);
  const bumpImageUi = () => setImageBump((n) => n + 1);

  const nameFieldRef = useRef<HTMLDivElement | null>(null);
  const yearFieldRef = useRef<HTMLDivElement | null>(null);
  const priceFieldRef = useRef<HTMLDivElement | null>(null);
  const stockFieldRef = useRef<HTMLDivElement | null>(null);

  const seasonOptions = useMemo(() => uniformSeasonSelectOptions(5), []);

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

  useEffect(() => {
    const cur = imageFilesRef.current;
    if (cur.length === 0 && imageSlotCount > 0) {
      imageFilesRef.current = Array.from({ length: imageSlotCount }, () => null);
      return;
    }
    if (cur.length < imageSlotCount) {
      imageFilesRef.current = [...cur, ...Array(imageSlotCount - cur.length).fill(null)];
    } else if (cur.length > imageSlotCount) {
      imageFilesRef.current = cur.slice(0, imageSlotCount);
    }
  }, [imageSlotCount]);

  const scrollFirstInvalid = (flags: {
    name: boolean;
    year: boolean;
    price: boolean;
    stock: boolean;
  }) => {
    const seq: [boolean, React.RefObject<HTMLDivElement | null>][] = [
      [flags.name, nameFieldRef],
      [flags.year, yearFieldRef],
      [flags.price, priceFieldRef],
      [flags.stock, stockFieldRef],
    ];
    for (const [bad, refEl] of seq) {
      if (bad) {
        refEl.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
  };

  const nameTrimmed = values.productName.trim();
  const priceNum = Number(values.productPrice);
  const stockNum = Number(values.productLeftCount);
  const yearNum = Number(values.madeYear);

  const nameInvalid = submitAttempted && nameTrimmed.length === 0;
  const priceInvalid =
    submitAttempted &&
    (values.productPrice.trim() === "" ||
      Number.isNaN(priceNum) ||
      priceNum <= 0);
  const stockInvalid =
    submitAttempted &&
    (values.productLeftCount.trim() === "" ||
      Number.isNaN(stockNum) ||
      stockNum < 0);
  const yearInvalid =
    submitAttempted &&
    (values.madeYear.trim() === "" ||
      Number.isNaN(yearNum) ||
      yearNum < MADE_YEAR_MIN ||
      yearNum > MADE_YEAR_MAX);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = nameTrimmed.length === 0;
    const yearErr =
      values.madeYear.trim() === "" ||
      Number.isNaN(yearNum) ||
      yearNum < MADE_YEAR_MIN ||
      yearNum > MADE_YEAR_MAX;
    const priceErr =
      values.productPrice.trim() === "" || Number.isNaN(priceNum) || priceNum <= 0;
    const stockErr =
      values.productLeftCount.trim() === "" || Number.isNaN(stockNum) || stockNum < 0;
    setSubmitAttempted(true);
    if (nameErr || yearErr || priceErr || stockErr) {
      requestAnimationFrame(() => {
        scrollFirstInvalid({
          name: nameErr,
          year: yearErr,
          price: priceErr,
          stock: stockErr,
        });
      });
      return;
    }

    const payload = {
      productName: nameTrimmed,
      productPrice: priceNum,
      productCollection: values.productCollection,
      productSize: values.productSize,
      productLeftCount: stockNum,
      productDesc: values.productDesc.trim() || undefined,
      uniformSeason: values.uniformSeason.trim() || null,
      productStatus: ProductStatus.PROCESS,
      productVolume: Number(values.productVolume) || 0,
      madeYear: yearNum,
    };
    console.info("[Admin] Product payload:", payload);
    const files = imageFilesRef.current.filter((f): f is File => f != null);
    if (files.length) {
      console.info(
        "[Admin] Product images (local preview only — not sent):",
        files.map((f) => f.name)
      );
    }
    try {
      if (serverApiBase) {
        await axios.post(`${serverApiBase}/api/products`, payload, {
          withCredentials: true,
        });
        setSavedHint("Product saved to the server.");
        setSubmitAttempted(false);
      } else {
        setSavedHint("API URL not configured — payload logged to console.");
      }
    } catch {
      setSavedHint("Server save failed — check console for payload; verify POST /api/products.");
    }
    window.setTimeout(() => setSavedHint(""), 8000);
  };

  const allImageSlotsFilled =
    imageSlotCount === MAX_IMAGE_SLOTS &&
    imageFilesRef.current.slice(0, imageSlotCount).every((f) => f != null);

  return (
    <Box
      component="section"
      id="admin-product-form-root"
      sx={{
        mt: 2,
        mb: 4,
        p: 3,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
        Add new jersey
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
        Set the made year for New Drops eligibility. Uniform season uses storefront labels (current:{" "}
        {getCurrentSeason()}).
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="stretch">
            <Box ref={nameFieldRef} sx={{ flex: { md: 2 }, width: "100%" }}>
              <TextField
                required
                fullWidth
                label="Product name"
                value={values.productName}
                onChange={(e) => setValues({ ...values, productName: e.target.value })}
                error={nameInvalid}
                helperText={nameInvalid ? "Name is required." : undefined}
                sx={fieldSx}
              />
            </Box>
            <Box ref={yearFieldRef} sx={{ flex: { md: 1 }, width: "100%" }}>
              <FormControl fullWidth error={yearInvalid} sx={fieldSx}>
                <InputLabel id="made-year-select-label">Jersey made year</InputLabel>
                <Select
                  labelId="made-year-select-label"
                  label="Jersey made year"
                  displayEmpty
                  value={values.madeYear}
                  onChange={(e) => setValues({ ...values, madeYear: e.target.value as string })}
                >
                  <MenuItem value="">
                    <em>Select year</em>
                  </MenuItem>
                  {madeYearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
                {yearInvalid ? (
                  <FormHelperText>Select a year between {MADE_YEAR_MIN} and {MADE_YEAR_MAX}.</FormHelperText>
                ) : (
                  <FormHelperText sx={{ color: "#94a3b8" }}>
                    {!dropWindowLoaded
                      ? "Loading catalog window…"
                      : dropWindow
                        ? `New Drops includes ${dropWindow.startYear}–${dropWindow.endYear}.`
                        : "Unable to load New Drops window from the API."}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Box ref={priceFieldRef} sx={{ flex: 1, width: "100%" }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Price"
                inputProps={{ min: 0, step: "0.01" }}
                value={values.productPrice}
                onChange={(e) => setValues({ ...values, productPrice: e.target.value })}
                error={priceInvalid}
                helperText={priceInvalid ? "Price must be greater than $0" : undefined}
                sx={fieldSx}
              />
            </Box>
            <Box ref={stockFieldRef} sx={{ flex: 1, width: "100%" }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Stock count"
                inputProps={{ min: 0, step: 1 }}
                value={values.productLeftCount}
                onChange={(e) => setValues({ ...values, productLeftCount: e.target.value })}
                error={stockInvalid}
                helperText={stockInvalid ? "Stock cannot be negative" : undefined}
                sx={fieldSx}
              />
            </Box>
            <FormControl fullWidth sx={{ ...fieldSx, flex: 1 }}>
              <InputLabel id="admin-collection-label">League</InputLabel>
              <Select
                labelId="admin-collection-label"
                label="League"
                value={values.productCollection}
                onChange={(e) =>
                  setValues({ ...values, productCollection: e.target.value as ProductCollection })
                }
              >
                {collectionChoices.map((c) => (
                  <MenuItem key={c} value={c}>
                    {collectionLabel(c)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <FormControl fullWidth sx={{ ...fieldSx, flex: 1 }}>
              <InputLabel id="admin-size-label">Size</InputLabel>
              <Select
                labelId="admin-size-label"
                label="Size"
                value={values.productSize}
                onChange={(e) =>
                  setValues({ ...values, productSize: e.target.value as ProductSize })
                }
              >
                {sizeChoices.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ ...fieldSx, flex: 1 }}>
              <InputLabel id="admin-kit-label">Kit type</InputLabel>
              <Select
                labelId="admin-kit-label"
                label="Kit type"
                value={values.productVolume}
                onChange={(e) => setValues({ ...values, productVolume: e.target.value as string })}
              >
                {kitTypeChoices.map((k) => (
                  <MenuItem key={k.value} value={k.value}>
                    {k.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description (optional)"
              value={values.productDesc}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= DESC_MAX) setValues({ ...values, productDesc: v });
              }}
              inputProps={{ maxLength: DESC_MAX }}
              sx={fieldSx}
            />
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", textAlign: "right" }}>
              {values.productDesc.length} / {DESC_MAX}
            </Typography>
          </Box>

          <FormControl fullWidth sx={fieldSx}>
            <InputLabel id="admin-uniform-season-label">Uniform season</InputLabel>
            <Select
              labelId="admin-uniform-season-label"
              label="Uniform season"
              displayEmpty
              value={values.uniformSeason}
              onChange={(e) => setValues({ ...values, uniformSeason: e.target.value as string })}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography component="span" sx={{ color: "rgba(15,23,42,0.45)" }}>
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

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#334155", mb: 1 }}>
              Product images
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {Array.from({ length: imageSlotCount }).map((_, i) => {
                const file = imageFilesRef.current[i] ?? null;
                return (
                  <Stack key={i} spacing={0.5} sx={{ width: 100 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        border: "1px dashed #cbd5e1",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f8fafc",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {file ? (
                        <>
                          <IconButton
                            type="button"
                            size="small"
                            aria-label="Remove image"
                            onClick={() => {
                              imageFilesRef.current[i] = null;
                              bumpImageUi();
                            }}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              zIndex: 1,
                              p: 0.25,
                              bgcolor: "rgba(255,255,255,0.9)",
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <Typography
                            component="label"
                            htmlFor={`product-image-${i}`}
                            sx={{
                              cursor: "pointer",
                              fontSize: 11,
                              color: "#64748b",
                              px: 2,
                              textAlign: "center",
                            }}
                          >
                            Replace
                          </Typography>
                          <input
                            id={`product-image-${i}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={(e) => {
                              const f = e.target.files?.[0] ?? null;
                              if (f) imageFilesRef.current[i] = f;
                              e.target.value = "";
                              bumpImageUi();
                            }}
                          />
                        </>
                      ) : (
                        <Typography
                          component="label"
                          htmlFor={`product-image-${i}`}
                          sx={{
                            cursor: "pointer",
                            fontSize: 11,
                            color: "#64748b",
                            textAlign: "center",
                            px: 1,
                          }}
                        >
                          Upload
                          <input
                            id={`product-image-${i}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={(e) => {
                              const f = e.target.files?.[0] ?? null;
                              if (f) imageFilesRef.current[i] = f;
                              e.target.value = "";
                              bumpImageUi();
                            }}
                          />
                        </Typography>
                      )}
                    </Box>
                    {file ? (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "#64748b",
                          fontSize: 10,
                          lineHeight: 1.2,
                          wordBreak: "break-all",
                        }}
                        title={file.name}
                      >
                        {truncateFilename(file.name)}
                      </Typography>
                    ) : null}
                  </Stack>
                );
              })}
            </Stack>
            {imageSlotCount < MAX_IMAGE_SLOTS && !allImageSlotsFilled ? (
              <Button
                type="button"
                size="small"
                onClick={() => setImageSlotCount((n) => Math.min(MAX_IMAGE_SLOTS, n + 1))}
                sx={{ mt: 1, textTransform: "none", color: "#2563eb" }}
              >
                + Add more
              </Button>
            ) : null}
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
              Image uploads are staged in the browser only; the save action still uses the existing JSON
              API.
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: "flex-start",
              mt: 1,
              px: 3,
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
            }}
          >
            Save product draft
          </Button>

          {savedHint ? (
            <Typography variant="body2" sx={{ color: "#16a34a" }}>
              {savedHint}
            </Typography>
          ) : null}
        </Stack>
      </form>
    </Box>
  );
}
