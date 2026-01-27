"use client"
import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Stack,
  TablePagination,
} from "@mui/material";
import { Search, Add, LocalShipping, FilterList, Refresh } from "@mui/icons-material"
import CheckIcon from "@mui/icons-material/Check"
import { useNavigate } from "react-router-dom";
import TransferItemDialog from "../components/TransferItemDialog"

const Transfer = () => {
  const theme = useTheme()
  const navigate = useNavigate();

  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transferData, setTransferData] = useState([]);
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const userObject = JSON.parse(localStorage.getItem("user"));
  const sessionToken = localStorage.getItem("sessionToken");

  const fetchTransferData = async () => {
    setRefreshing(true);
    setError("");

    if (!userObject || !sessionToken) {
      setError("Authentication required. Please log in.");
      setRefreshing(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/transfer/get_stock_transfer.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userObject.OfficeId,
            sessionToken: sessionToken,
            role: userObject.Role,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        setError("Session expired or invalid. Please log in again.");
        navigate("/login");
        return;
      }

      const result = await response.json();
      if (result.success) {
        setTransferData(result.data);
      } else {
        setError(result.message || "Failed to fetch transfer data.");
      }
    } catch (err) {
      console.error("Transfer fetch error:", err);
      setError("Failed to fetch transfer data. Check console for details.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOfficeData = async () => {
    setError("");
    if (!userObject || !sessionToken) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userObject.OfficeId,
            sessionToken: sessionToken,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        setError("Session expired or invalid. Please log in again.");
        navigate("/login");
        return;
      }

      const result = await response.json();
      if (result.success) {
        setOfficeData(result.data);
      } else {
        setError(result.message || "Failed to fetch office data.");
      }
    } catch (err) {
      console.error("Office fetch error:", err);
      setError("Failed to fetch office data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchTransferData(), fetchOfficeData()]);
    };
    fetchData();
  }, []);

  const getOfficeName = (officeId) => {
    const office = officeData.find((o) => o.ID === Number(officeId));
    return office ? office.OfficeName : `Office ${officeId}`;
  };

  const getOfficeCode = (officeId) => {
    const office = officeData.find((o) => o.ID === Number(officeId));
    return office ? office.OfficeCode : "";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in transit":
        return "warning";
      case "pending":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const filteredTransfers = transferData.filter((transfer) => {
    const fromName = getOfficeName(transfer.FromOfficeID).toLowerCase();
    const toName = getOfficeName(transfer.ToOfficeID).toLowerCase();
    const batch = transfer.BatchId?.toLowerCase() || "";
    const status = transfer.Status?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      fromName.includes(search) ||
      toName.includes(search) ||
      batch.includes(search) ||
      status.includes(search)
    );
  });

  // Paginate filtered transfers
  const paginatedTransfers = filteredTransfers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAcceptTransfer = async (batchId) => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/transfer/accept_stock_transfer.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ BatchId: batchId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Stock marked as Delivered!");
        fetchTransferData();
      } else {
        alert(result.message || "Failed to mark as delivered.");
      }
    } catch (error) {
      console.error("Accept transfer error:", error);
      alert("Something went wrong while accepting transfer.");
    }
  };

  const handleRefresh = () => fetchTransferData();
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 0, minHeight: "100vh" }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalShipping sx={{ fontSize: 40, color: "black" }} />
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}
              >
                Stock Transfer Management
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: alpha(theme.palette.common.black, 0.8) }}
              >
                Track and manage stock transfers between offices
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Controls */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <TextField
                placeholder="Search transfers..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Tooltip title="Filter">
                <IconButton color="primary">
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenAddItemDialog(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            >
              New Transfer
            </Button>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Transfer Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: `1px solid ${theme.palette.divider}` }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <TableCell sx={{ fontWeight: "bold" }}>Batch ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>From Office</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>To Office</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Item ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Transfer Mode
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                      >
                        <LocalShipping
                          sx={{
                            fontSize: 48,
                            color: theme.palette.text.disabled,
                          }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No transfers found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Start by creating a new transfer"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransfers.map((transfer) => (
                    <TableRow
                      key={transfer.ID}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: alpha(theme.palette.grey[500], 0.02),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                        >
                          {transfer.BatchId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                              bgcolor: theme.palette.info.main,
                            }}
                          >
                            {getOfficeCode(transfer.FromOfficeID)}
                          </Avatar>
                          <Typography variant="body2">
                            {getOfficeName(transfer.FromOfficeID)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                              bgcolor: theme.palette.success.main,
                            }}
                          >
                            {getOfficeCode(transfer.ToOfficeID)}
                          </Avatar>
                          <Typography variant="body2">
                            {getOfficeName(transfer.ToOfficeID)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Item #${transfer.Item}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {transfer.Quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transfer.ModeOfTransfer}
                          size="small"
                          color={
                            transfer.ModeOfTransfer === "Self"
                              ? "primary"
                              : "secondary"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transfer.Status}
                          size="small"
                          color={getStatusColor(transfer.Status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(transfer.Date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Mark as Delivered">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                handleAcceptTransfer(transfer.BatchId)
                              }
                              disabled={
                                transfer.Status?.toLowerCase() === "delivered"
                              }
                            >
                              <CheckIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredTransfers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <TransferItemDialog
        open={openAddItemDialog}
        onClose={() => setOpenAddItemDialog(false)}
        refreshOffice={fetchTransferData}
      />
    </Box>
  );
}

export default Transfer
