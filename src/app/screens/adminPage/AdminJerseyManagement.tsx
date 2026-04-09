import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Product } from "../../../lib/types/product";
import { ProductCollection, ProductStatus } from "../../../lib/enums/product.enum";
import ProductService from "../../services/ProductService";
import { collectionLabel } from "../../components/product/archiveCardUtils";
import AdminProductForm from "./AdminProductForm";
import { kitTypeLabel, leagueAccentColor, LOW_STOCK_THRESHOLD } from "./adminJerseyUi";
import { ADMIN_AUTH_KEY } from "./adminAuthConstants";

const SEARCH_DEBOUNCE_MS = 300;

const LEAGUE_FILTER: { value: ProductCollection | ""; label: string }[] = [
  { value: "", label: "All leagues" },
  { value: ProductCollection.PREMIER_LEAGUE, label: "Premier League" },
  { value: ProductCollection.SERIE_A, label: "Serie A" },
  { value: ProductCollection.LIGUE_1, label: "Ligue 1" },
  { value: ProductCollection.BUNDESLIGA, label: "Bundesliga" },
  { value: ProductCollection.NATIONAL_TEAMS, label: "National Teams" },
  { value: ProductCollection.LA_LIGA, label: "La Liga" },
  { value: ProductCollection.CHAMPIONS_LEAGUE, label: "Champions League" },
  { value: ProductCollection.UZBEKISTAN_LEAGUE, label: "Uzbekistan League" },
  { value: ProductCollection.RETRO, label: "Retro" },
  { value: ProductCollection.OTHER, label: "Other" },
];

function parseFiltersFromSearch(searchStr: string): {
  search: string;
  league: ProductCollection | "";
} {
  const q = searchStr.startsWith("?") ? searchStr.slice(1) : searchStr;
  const p = new URLSearchParams(q);
  const search = p.get("search") ?? "";
  const leagueRaw = p.get("league") ?? "";
  const league =
    leagueRaw && (Object.values(ProductCollection) as string[]).includes(leagueRaw)
      ? (leagueRaw as ProductCollection)
      : "";
  return { search, league };
}

function getInitialAdminFilters() {
  if (typeof window === "undefined") {
    return { search: "", league: "" as ProductCollection | "" };
  }
  return parseFiltersFromSearch(window.location.search);
}

const tableHeaderSx = {
  fontSize: "11px",
  letterSpacing: "0.08em",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase" as const,
  borderBottom: "1px solid #e2e8f0",
  py: 1.25,
  px: 1.5,
};

function scrollToAddJerseyAndHighlight() {
  document.getElementById("admin-add-jersey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const form = document.getElementById("admin-product-form-root");
  if (form) {
    form.classList.add("form-highlight");
    window.setTimeout(() => form.classList.remove("form-highlight"), 600);
  }
}

export default function AdminJerseyManagement() {
  const history = useHistory();
  const initial = useMemo(() => getInitialAdminFilters(), []);

  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [fetchNonce, setFetchNonce] = useState(0);

  const [searchInput, setSearchInput] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search.trim());
  const [leagueFilter, setLeagueFilter] = useState<ProductCollection | "">(initial.league);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [statusErrors, setStatusErrors] = useState<Record<string, string>>({});

  const [authed, setAuthed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(ADMIN_AUTH_KEY) === "1"
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const unlisten = history.listen((loc, action) => {
      if (action !== "POP") return;
      const { search, league } = parseFiltersFromSearch(loc.search);
      setSearchInput(search);
      setDebouncedSearch(search.trim());
      setLeagueFilter(league);
    });
    return unlisten;
  }, [history]);

  useEffect(() => {
    if (!authed) return;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (leagueFilter) params.set("league", leagueFilter);
    const qs = params.toString();
    history.replace({ pathname: history.location.pathname, search: qs ? `?${qs}` : "" });

    const ac = new AbortController();
    setLoading(true);
    setLoadError("");

    const svc = new ProductService();
    svc
      .getProducts(
        {
          page: 1,
          limit: 500,
          order: "createdAt",
          search: debouncedSearch || undefined,
          productCollection: leagueFilter || undefined,
        },
        { signal: ac.signal }
      )
      .then((data) => {
        if (ac.signal.aborted) return;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        console.error("[AdminJerseyManagement] Failed to load jerseys", err);
        setLoadError("Failed to load jerseys. ");
        setRows([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [debouncedSearch, leagueFilter, authed, fetchNonce, history]);

  const stats = useMemo(() => {
    const list = rows;
    const total = list.length;
    const active = list.filter((p) => p.productStatus === ProductStatus.PROCESS).length;
    const totalValue = list.reduce(
      (acc, p) => acc + (Number(p.productPrice) || 0) * (Number(p.productLeftCount) || 0),
      0
    );
    return { total, active, totalValue };
  }, [rows]);

  const setStatusRowError = useCallback((id: string) => {
    setStatusErrors((prev) => ({ ...prev, [id]: "Update failed" }));
    window.setTimeout(() => {
      setStatusErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3000);
  }, []);

  const handleStatusToggle = async (product: Product, nextActive: boolean) => {
    const nextStatus = nextActive ? ProductStatus.PROCESS : ProductStatus.PAUSE;
    const prev = product.productStatus;
    setRows((prevRows) =>
      prevRows.map((p) => (p._id === product._id ? { ...p, productStatus: nextStatus } : p))
    );
    try {
      const svc = new ProductService();
      await svc.updateJerseyStatus(product._id, nextStatus);
    } catch (err: unknown) {
      console.error("[AdminJerseyManagement] Status update failed", err);
      setRows((prevRows) =>
        prevRows.map((p) => (p._id === product._id ? { ...p, productStatus: prev } : p))
      );
      setStatusRowError(product._id);
    }
  };

  const handleRetryLoad = () => {
    setFetchNonce((n) => n + 1);
  };

  const handleClearSearchAndLeague = () => {
    setSearchInput("");
    setLeagueFilter("");
    setDebouncedSearch("");
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const handleClearFiltersEmptyState = () => {
    setSearchInput("");
    setLeagueFilter("");
    setDebouncedSearch("");
    history.replace({ pathname: history.location.pathname, search: "" });
    setFetchNonce((n) => n + 1);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  if (!authed) {
    return (
      <div className="admin-jersey-dashboard">
        <Box sx={{ maxWidth: 520, mx: "auto", mt: 8, p: 4 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Sign in required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Open the admin panel and log in to manage jerseys.
            </Typography>
            <Button variant="contained" component={Link} to="/admin" sx={{ textTransform: "none" }}>
              Go to admin login
            </Button>
          </Paper>
        </Box>
      </div>
    );
  }

  return (
    <div className="admin-jersey-dashboard">
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            component={Link}
            to="/admin"
            sx={{ color: "#475569", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            ← Admin home
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              sessionStorage.removeItem(ADMIN_AUTH_KEY);
              setAuthed(false);
            }}
            sx={{ textTransform: "none" }}
          >
            Sign out
          </Button>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}>
          Jersey management
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #2563eb",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Total jerseys
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "2.125rem", mt: 0.5 }}>
              {loading ? "—" : stats.total}
            </Typography>
            <Typography variant="caption" sx={{ color: "#16a34a", display: "block", mt: 1 }}>
              ↑ 2 this week
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #16a34a",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Active jerseys
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "2.125rem", mt: 0.5 }}>
              {loading ? "—" : stats.active}
            </Typography>
            <Typography variant="caption" sx={{ color: "#16a34a", display: "block", mt: 1 }}>
              ↑ 1 this week
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #d97706",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Total value
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "2.125rem", mt: 0.5 }}>
              {loading ? "—" : `$${stats.totalValue.toLocaleString()}`}
            </Typography>
            <Typography variant="caption" sx={{ color: "#d97706", display: "block", mt: 1 }}>
              ↑ 4% vs last week
            </Typography>
          </Paper>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            overflow: "hidden",
            mb: 4,
          }}
        >
          {loadError ? (
            <Box
              sx={{
                px: 2,
                py: 1.25,
                bgcolor: "#fef2f2",
                borderBottom: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography component="span" sx={{ color: "#991b1b", fontSize: 14 }}>
                {loadError}
              </Typography>
              <Button
                type="button"
                size="small"
                onClick={handleRetryLoad}
                sx={{ textTransform: "none", p: 0, minWidth: 0, fontSize: 14, color: "#991b1b" }}
              >
                Retry
              </Button>
            </Box>
          ) : null}

          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              rowGap: 1,
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 2,
              bgcolor: "#fff",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", mr: { md: 1 }, flexShrink: 0 }}
            >
              Football jersey collection
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ flex: 1, justifyContent: "flex-end", minWidth: 0 }}
            >
              <TextField
                inputRef={searchInputRef}
                size="small"
                placeholder="Search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 200 },
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                    fontSize: 14,
                    bgcolor: "#f8fafc",
                  },
                }}
                InputProps={{
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear search"
                        onClick={handleClearSearchAndLeague}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="jersey-league-filter">League</InputLabel>
                <Select
                  labelId="jersey-league-filter"
                  label="League"
                  value={leagueFilter}
                  onChange={(e) => setLeagueFilter(e.target.value as ProductCollection | "")}
                  sx={{ height: 36, fontSize: 14, bgcolor: "#f8fafc" }}
                >
                  {LEAGUE_FILTER.map((o) => (
                    <MenuItem key={o.label} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                onClick={scrollToAddJerseyAndHighlight}
                sx={{
                  height: 36,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  flexShrink: 0,
                }}
              >
                + Add jersey
              </Button>
            </Stack>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ ...tableHeaderSx, width: 40, maxWidth: 40, px: 1 }}>#</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, width: "22%" }}>Name</TableCell>
                  <TableCell sx={tableHeaderSx}>League</TableCell>
                  <TableCell sx={tableHeaderSx}>Kit type</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, width: 72 }}>Size</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, width: 88 }}>Stock</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, width: 96 }}>Price</TableCell>
                  <TableCell sx={tableHeaderSx}>Status</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, width: 120 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, si) => (
                      <TableRow key={`sk-${si}`}>
                        <TableCell colSpan={9} sx={{ py: 1.5, border: "none" }}>
                          <Box className="admin-jersey-skeleton-bar" sx={{ width: "100%" }} />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
                {!loading && !loadError && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 6, border: "none" }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 48, color: "#94a3b8" }} />
                        <Typography sx={{ color: "#64748b", fontSize: 15 }}>No jerseys found</Typography>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={handleClearFiltersEmptyState}
                          sx={{ textTransform: "none" }}
                        >
                          Clear filters
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading && !loadError && rows.length > 0
                  ? rows.map((p, i) => {
                      const accent = leagueAccentColor(p.productCollection);
                      const stock = Number(p.productLeftCount) || 0;
                      const stockLow = stock <= LOW_STOCK_THRESHOLD;
                      return (
                        <TableRow
                          key={p._id}
                          sx={{
                            borderLeft: `3px solid ${accent}`,
                            "& td": { borderColor: "#f1f5f9", verticalAlign: "middle" },
                          }}
                        >
                          <TableCell sx={{ color: "#94a3b8", fontSize: 13, px: 1, width: 40 }}>
                            {i + 1}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>
                            {p.productName}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.25 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: accent,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography component="span" sx={{ fontSize: 13, color: "#334155" }}>
                                {collectionLabel(p.productCollection)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                fontSize: "11px",
                                px: "8px",
                                py: "2px",
                                borderRadius: 999,
                                bgcolor: "#f1f5f9",
                                color: "#475569",
                                fontWeight: 500,
                              }}
                            >
                              {kitTypeLabel(p.productVolume)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 36,
                                px: 0.75,
                                py: 0.25,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                bgcolor: "#fff",
                                fontFamily: "ui-monospace, monospace",
                              }}
                            >
                              {p.productSize}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              title={stockLow ? "Low stock" : undefined}
                              sx={{
                                display: "inline-block",
                                fontSize: "11px",
                                px: "8px",
                                py: "2px",
                                borderRadius: 999,
                                fontWeight: 600,
                                bgcolor: stockLow ? "#fee2e2" : "#dcfce7",
                                color: stockLow ? "#b91c1c" : "#166534",
                              }}
                            >
                              {stock} in stock
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                            ${Number(p.productPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Stack direction="column" alignItems="flex-start" spacing={0.25}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Switch
                                  size="small"
                                  checked={p.productStatus === ProductStatus.PROCESS}
                                  onChange={(_, checked) => handleStatusToggle(p, checked)}
                                  color="success"
                                />
                                <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>
                                  {p.productStatus === ProductStatus.PROCESS ? "Active" : "Inactive"}
                                </Typography>
                              </Stack>
                              {statusErrors[p._id] ? (
                                <Typography
                                  sx={{
                                    fontSize: "11px",
                                    color: "#791f1f",
                                    pl: 0.5,
                                  }}
                                >
                                  {statusErrors[p._id]}
                                </Typography>
                              ) : null}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                              <IconButton
                                component={Link}
                                to={`/products/${p._id}`}
                                size="small"
                                title="View jersey"
                                aria-label="View jersey"
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  border: "1px solid #e2e8f0",
                                  color: "#475569",
                                }}
                              >
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Edit jersey"
                                aria-label="Edit jersey"
                                onClick={scrollToAddJerseyAndHighlight}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  border: "1px solid #e2e8f0",
                                  color: "#475569",
                                }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box id="admin-add-jersey" sx={{ scrollMarginTop: 24 }}>
          <AdminProductForm />
        </Box>
      </Box>
    </div>
  );
}
