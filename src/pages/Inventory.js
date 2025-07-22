import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import AddItemDialog from "../components/AddItemDialog";
import AddInventoryDialog from "../components/AddInventoryDialog";

function Inventory() {
  // State management
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openAddInventoryDialog, setOpenAddInventoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [itemsData, setItemsData] = useState([]); // For storing all items with categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Menu state
 

  // Fetch inventory data and items data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userObject = JSON.parse(localStorage.getItem("user"));
        const officeId = userObject?.OfficeId;

        if (!officeId) {
          throw new Error("OfficeId not found in localStorage.");
        }

        // Fetch inventory data
        const inventoryResponse = await fetch(
          `https://namami-infotech.com/SatyaMicro/src/stock/get_stock.php?OfficeId=${officeId}`
        );
        const inventoryResult = await inventoryResponse.json();

        // Fetch items data (for categories)
        const itemsResponse = await fetch(
          "https://namami-infotech.com/SatyaMicro/src/item/get_item.php"
        );
        const itemsResult = await itemsResponse.json();

        if (inventoryResult.success && itemsResult.success) {
          setInventoryData(inventoryResult.data);
          setItemsData(itemsResult.data);
          setError("");
        } else {
          setError(inventoryResult.message || itemsResult.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine inventory data with category information
  const enrichedInventoryData = useMemo(() => {
    return inventoryData.map(inventoryItem => {
      const matchingItem = itemsData.find(item => item.Name === inventoryItem.Item);
      return {
        ...inventoryItem,
        Category: matchingItem?.Category || "Uncategorized"
      };
    });
  }, [inventoryData, itemsData]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return enrichedInventoryData.filter((item) =>
      item?.Item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.Category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedInventoryData, searchTerm]);

  // Pagination logic
  const paginatedItems = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  // Event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

 

  const refreshData = async () => {
    setLoading(true);
    try {
      const userObject = JSON.parse(localStorage.getItem("user"));
      const officeId = userObject?.OfficeId;

      // Fetch inventory data
      const inventoryResponse = await fetch(
        `https://namami-infotech.com/SatyaMicro/src/stock/get_stock.php?OfficeId=${officeId}`
      );
      const inventoryResult = await inventoryResponse.json();

      // Fetch items data (for categories)
      const itemsResponse = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/item/get_item.php"
      );
      const itemsResult = await itemsResponse.json();

      if (inventoryResult.success && itemsResult.success) {
        setInventoryData(inventoryResult.data);
        setItemsData(itemsResult.data);
        setError("");
      } else {
        setError(inventoryResult.message || itemsResult.message || "Failed to refresh data");
      }
    } catch (err) {
      setError("Failed to refresh inventory data.");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Item', 'Category', 'Quantity', 'Updated At'],
      ...filteredItems.map(item => [
        item.Item, 
        item.Category, 
        item.Quantity, 
        item.UpdateDateTime
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 0, maxWidth: '100%' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all inventory items in your office
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow
                      key={`${item.Item}-${index}`}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
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
                            item.Quantity <= 5 ? 'error' : 
                            item.Quantity <= 10 ? 'warning' : 'success'
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
                  {paginatedItems.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No inventory items found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Fade>
          )}
        </TableContainer>

        {/* Pagination */}
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
    </Box>
  );
}

export default Inventory;