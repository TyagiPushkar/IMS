"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
  Avatar,
  Stack,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material"
import AddItemDialog from "../components/AddItemDialog"
import AddInventoryDialog from "../components/AddInventoryDialog"
import ItemMasterDialog from "../components/ItemMasterDialog";

import { useNavigate } from "react-router-dom";

function Inventory() {
  const navigate = useNavigate();

  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openItemMasterDialog, setOpenItemMasterDialog] = useState(false);
  const [openAddInventoryDialog, setOpenAddInventoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ? Fetch inventory + items
  const fetchData = async (officeFilter = "") => {
    setLoading(true);
    setError("");

    const userObject = JSON.parse(localStorage.getItem("user"));
    const sessionToken = localStorage.getItem("sessionToken");

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const targetOffice =
        userObject.Role === "HO"
          ? officeFilter && officeFilter !== "ALL"
            ? officeFilter
            : userObject.OfficeId
          : userObject.OfficeId;

      // ? Fetch inventory
      const inventoryResponse = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/stock/get_stock.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: targetOffice,
            sessionToken: sessionToken,
          }),
        }
      );

      if (inventoryResponse.status === 401) {
        localStorage.clear();
        setError("Session expired or invalid. Please log in again.");
        navigate("/login");
        return;
      }

      const inventoryResult = await inventoryResponse.json();

      // ? Fetch items
      const itemsResponse = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/item/get_item.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userObject.OfficeId,
            sessionToken: sessionToken,
          }),
        }
      );
      const itemsResult = await itemsResponse.json();

      if (inventoryResult.success && itemsResult.success) {
        setInventoryData(inventoryResult.data);
        setItemsData(itemsResult.data);
        setUserRole(userObject.Role);
        setSelectedOffice(officeFilter || userObject.OfficeId);
      } else {
        setError(
          inventoryResult.message ||
            itemsResult.message ||
            "Failed to fetch data"
        );
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch inventory data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ? Combine inventory data with category info
  const enrichedInventoryData = useMemo(() => {
    return inventoryData.map((inventoryItem) => {
      const matchingItem = itemsData.find(
        (item) => item.Name === inventoryItem.Item
      );
      return {
        ...inventoryItem,
        Category: matchingItem?.Category || "Uncategorized",
      };
    });
  }, [inventoryData, itemsData]);

  // ? Filter by office (for HO �ALL Offices� or selected)
  const officeFilteredData = useMemo(() => {
    if (userRole === "HO" && selectedOffice === "ALL")
      return enrichedInventoryData;
    return enrichedInventoryData.filter(
      (item) => String(item.OfficeId) === String(selectedOffice)
    );
  }, [enrichedInventoryData, userRole, selectedOffice]);

  // ? Filter by search
  const filteredItems = useMemo(() => {
    return officeFilteredData.filter(
      (item) =>
        item?.Item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.Category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.OfficeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [officeFilteredData, searchTerm]);

  // ? Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const refreshData = () => fetchData(selectedOffice);

  const handleOfficeChange = (event) => {
    const value = event.target.value;
    setSelectedOffice(value);
    fetchData(value);
  };

  const exportData = () => {
    const csvContent = [
      ["Office Name", "Item", "Category", "Quantity", "Updated At"],
      ...filteredItems.map((item) => [
        item.OfficeName,
        item.Item,
        item.Category,
        item.Quantity,
        item.UpdateDateTime,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const userObject = JSON.parse(localStorage.getItem("user"));

  return (
    <Box sx={{ p: 0, maxWidth: "100%" }}>
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all inventory items in your office
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* ? Office Dropdown (HO only, with 2 options) */}
            {userRole === "HO" ? (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Select Office"
                  value={selectedOffice}
                  onChange={handleOfficeChange}
                  fullWidth
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value="ALL">All Offices</option>
                  <option value={userObject?.OfficeId}>My Office</option>
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={12} md={3}>
                <TextField
                  label="Office"
                  value="My Office"
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12} md={userRole === "HO" ? 5 : 8}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Refresh">
                  <IconButton onClick={refreshData} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton onClick={exportData} color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<InventoryIcon />}
                  color="secondary"
                  onClick={() => setOpenItemMasterDialog(true)}
                >
                  View Item Master
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddItemDialog(true)}
                  sx={{ ml: 1 }}
                >
                  Add Item
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <Fade in={!loading}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Office</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Quantity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow key={`${item.Item}-${index}`} hover>
                      <TableCell>{item.OfficeName || "N/A"}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 2,
                              bgcolor: "primary.main",
                            }}
                          >
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">{item.Item}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.Category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.Quantity}
                          color={
                            item.Quantity <= 5
                              ? "error"
                              : item.Quantity <= 10
                              ? "warning"
                              : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(item.UpdateDateTime).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Fade>
          )}
        </TableContainer>

        {!loading && !error && (
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Paper>

      {/* Dialogs */}
      <AddItemDialog
        open={openAddItemDialog}
        onClose={() => setOpenAddItemDialog(false)}
        refreshData={refreshData}
      />
      <AddInventoryDialog
        open={openAddInventoryDialog}
        onClose={() => setOpenAddInventoryDialog(false)}
        refreshData={refreshData}
      />
      <ItemMasterDialog
        open={openItemMasterDialog}
        onClose={() => setOpenItemMasterDialog(false)}
      />
    </Box>
  );
}

export default Inventory;