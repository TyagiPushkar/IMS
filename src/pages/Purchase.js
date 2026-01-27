"use client"
import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  TablePagination,
  Chip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  PictureAsPdf as PdfIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import PurchaseItemDialog from "../components/PurchaseItemDialog"
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function Purchase() {
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openAddPurchaseDialog, setOpenAddPurchaseDialog] = useState(false);
  const [openUploadInvoiceDialog, setOpenUploadInvoiceDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [imageType, setImageType] = useState(""); // "invoice" or "po"
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuPurchase, setActionMenuPurchase] = useState(null);

  // Upload invoice states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Filter states
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all"); // "all", "pending", "done"
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ================= HELPERS ================= */

  const formatDate = (datetime) => {
    if (!datetime) return "N/A";
    const d = new Date(datetime);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatPODate = (datetime) => {
    if (!datetime) return "N/A";
    const d = new Date(datetime);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getInvoiceTotal = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      return sum + (Number(item.Amount) || 0);
    }, 0);
  };

  const getFileIcon = (filename) => {
    if (!filename) return null;
    const ext = filename.split(".").pop().toLowerCase();
    return ext === "pdf" ? <PdfIcon /> : <ImageIcon />;
  };

  const getInvoiceStatus = (purchase) => {
    return purchase.Invoice ? "done" : "pending";
  };

  /* ================= FETCH ================= */

  const fetchPurchaseData = async () => {
    setLoading(true);
    setError("");

    const userObject = JSON.parse(localStorage.getItem("user"));
    const sessionToken = localStorage.getItem("sessionToken");

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/purchase/get_purchase.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userObject.OfficeId,
            sessionToken,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const result = await response.json();
      result.success
        ? setPurchaseData(result.data || [])
        : setError(result.message || "Failed to fetch purchase data.");
    } catch (err) {
      setError("Error while fetching purchase data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseData();
  }, []);

  /* ================= ACTION MENU HANDLERS ================= */

  const handleActionMenuOpen = (event, purchase) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuPurchase(purchase);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuPurchase(null);
  };

  const handleUploadInvoiceClick = () => {
    if (actionMenuPurchase) {
      setSelectedPurchase(actionMenuPurchase);
      setInvoiceNumber(actionMenuPurchase.InvoiceNumber || "");
      setInvoiceFile(null);
      setUploadError("");
      setUploadSuccess("");
      setOpenUploadInvoiceDialog(true);
    }
    handleActionMenuClose();
  };

  const handleViewItems = () => {
    if (actionMenuPurchase) {
      setSelectedInvoice(actionMenuPurchase);
      setOpenDialog(true);
    }
    handleActionMenuClose();
  };

  /* ================= UPLOAD INVOICE FUNCTIONS ================= */

  const handleInvoiceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Only JPG, PNG, GIF, WebP, and PDF files are allowed");
        return;
      }

      setInvoiceFile(file);
      setUploadError("");
    }
  };

  const handleUploadInvoice = async () => {
    if (!invoiceNumber.trim()) {
      setUploadError("Invoice number is required");
      return;
    }

    if (!invoiceFile) {
      setUploadError("Invoice file is required");
      return;
    }

    if (!selectedPurchase?.ID) {
      setUploadError("Purchase ID not found");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("PurchaseId", selectedPurchase.ID); // This will be ID field in database
      formData.append("InvoiceNumber", invoiceNumber.trim());
      formData.append("Invoice", invoiceFile);

      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/purchase/upload_invoice.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setUploadSuccess("Invoice uploaded successfully!");
        setTimeout(() => {
          fetchPurchaseData(); // Refresh the data
          setOpenUploadInvoiceDialog(false);
          setSelectedPurchase(null);
        }, 1500);
      } else {
        setUploadError(result.message || "Failed to upload invoice");
      }
    } catch (err) {
      setUploadError("An error occurred while uploading invoice");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    if (!uploadLoading) {
      setSelectedPurchase(null);
      setInvoiceNumber("");
      setInvoiceFile(null);
      setUploadError("");
      setUploadSuccess("");
      setOpenUploadInvoiceDialog(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredPurchases = purchaseData.filter((p) => {
    // Text search filter
    const matchesSearch =
      p?.InvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.OfficeName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Invoice status filter
    let matchesStatus = true;
    if (invoiceStatusFilter === "pending") {
      matchesStatus = !p.Invoice;
    } else if (invoiceStatusFilter === "done") {
      matchesStatus = !!p.Invoice;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const pendingCount = purchaseData.filter((p) => !p.Invoice).length;
  const doneCount = purchaseData.filter((p) => !!p.Invoice).length;

  const paginatedPurchases = filteredPurchases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleStatusFilterChange = (event, newStatus) => {
    if (newStatus !== null) {
      setInvoiceStatusFilter(newStatus);
      setPage(0); // Reset to first page when filter changes
    }
  };

  const clearFilters = () => {
    setInvoiceStatusFilter("all");
    setSearchTerm("");
    setPage(0);
  };

  /* ================= EXCEL ================= */

  const exportToExcel = () => {
    if (!filteredPurchases.length) return;

    const excelData = filteredPurchases.map((p, i) => ({
      "S.No": i + 1,
      "Invoice Number": p.InvoiceNumber || "N/A",
      "Office Name": p.OfficeName,
      "Vendor Name": p.VendorName,
      "Vendor Address": p.VendorAddress,
      "Invoice Date": formatDate(p.Date),
      "PO Date": formatPODate(p["PO Date"]),
      "Total Amount": getInvoiceTotal(p.Items),
      "Has PO": p.PO ? "Yes" : "No",
      "Invoice Status": p.Invoice ? "Uploaded" : "Pending",
      "Invoice File": p.Invoice || "Not Uploaded",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    XLSX.writeFile(
      wb,
      `Purchase_Invoices_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /* ================= VIEW IMAGE ================= */

  const viewImage = (imageUrl, type) => {
    if (!imageUrl) return;

    const fullUrl = `https://namami-infotech.com/SatyaMicro/src/purchase/uploads/${imageUrl}`;
    setSelectedImage(fullUrl);
    setImageType(type);
    setOpenImageDialog(true);
  };

  /* ================= RENDER ================= */

  return (
    <Box sx={{ maxWidth: "100%", p: 2 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Purchase Management
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Manage and track all purchase invoices and purchase orders
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={`Total: ${purchaseData.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Pending: ${pendingCount}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Done: ${doneCount}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Search and Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by invoice, vendor, or office..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterListIcon />}
                sx={{ borderRadius: 2 }}
              >
                Filters
              </Button>
              <Button
                variant="outlined"
                onClick={exportToExcel}
                startIcon={<DescriptionIcon />}
                disabled={!filteredPurchases.length}
                sx={{ borderRadius: 2 }}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddPurchaseDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                New Purchase
              </Button>
            </Stack>
          </Grid>

          {showFilters && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Invoice Status:
                  </Typography>

                  <ToggleButtonGroup
                    value={invoiceStatusFilter}
                    exclusive
                    onChange={handleStatusFilterChange}
                    size="small"
                  >
                    <ToggleButton value="all">
                      <Chip
                        label="All"
                        size="small"
                        variant={
                          invoiceStatusFilter === "all" ? "filled" : "outlined"
                        }
                        color="primary"
                      />
                    </ToggleButton>
                    <ToggleButton value="pending">
                      <Chip
                        label="Invoice Pending"
                        size="small"
                        variant={
                          invoiceStatusFilter === "pending"
                            ? "filled"
                            : "outlined"
                        }
                        color="warning"
                      />
                    </ToggleButton>
                    <ToggleButton value="done">
                      <Chip
                        label="Invoice Uploaded"
                        size="small"
                        variant={
                          invoiceStatusFilter === "done" ? "filled" : "outlined"
                        }
                        color="success"
                      />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Box sx={{ flexGrow: 1 }} />

                  <Button
                    size="small"
                    onClick={clearFilters}
                    sx={{ ml: "auto" }}
                  >
                    Clear Filters
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Filter Summary */}
      {invoiceStatusFilter !== "all" && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "info.50" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2">
              Showing:
              <Chip
                label={
                  invoiceStatusFilter === "pending"
                    ? "Invoice Pending"
                    : "Invoice Uploaded"
                }
                size="small"
                color={
                  invoiceStatusFilter === "pending" ? "warning" : "success"
                }
                sx={{ ml: 1 }}
              />
              <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                ({filteredPurchases.length} of {purchaseData.length} records)
              </Typography>
            </Typography>
            <Button size="small" onClick={clearFilters} sx={{ ml: "auto" }}>
              Clear Filter
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Main Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          {loading ? (
            <Box p={4} textAlign="center">
              <CircularProgress />
              <Typography color="text.secondary" mt={2}>
                Loading purchase data...
              </Typography>
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Box>
          ) : (
            <Fade in>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Invoice #
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Office
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Vendor
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Documents
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      PO Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Invoice Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, bgcolor: "background.paper" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedPurchases.map((p, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {p.InvoiceNumber || (
                            <Chip
                              label="No Invoice#"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {p.Invoice ? (
                          <Chip
                            label="Invoice Uploaded"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem" }}
                          />
                        ) : (
                          <Chip
                            label="Invoice Pending"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {p.OfficeName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {p.VendorName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {p.VendorAddress}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {getInvoiceTotal(p.Items).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {p.PO ? (
                            <Tooltip title="View Purchase Order">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => viewImage(p.PO, "PO")}
                                sx={{
                                  bgcolor: "primary.50",
                                  "&:hover": { bgcolor: "primary.100" },
                                }}
                              >
                                {getFileIcon(p.PO)}
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="No PO available">
                              <IconButton size="small" disabled>
                                <DescriptionIcon color="disabled" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {p.Invoice ? (
                            <Tooltip title="View Invoice">
                              <Badge color="success" variant="dot">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() =>
                                    viewImage(p.Invoice, "Invoice")
                                  }
                                  sx={{
                                    bgcolor: "success.50",
                                    "&:hover": { bgcolor: "success.100" },
                                  }}
                                >
                                  <ReceiptIcon />
                                </IconButton>
                              </Badge>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Upload Invoice">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleActionMenuOpen(e, p)}
                                sx={{
                                  bgcolor: "error.50",
                                  "&:hover": { bgcolor: "error.100" },
                                }}
                              >
                                <CloudUploadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CalendarIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2">
                            {formatPODate(p["PO Date"])}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CalendarIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2">
                            {formatDate(p.Date)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, p)}
                          sx={{
                            bgcolor: "action.selected",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredPurchases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <DescriptionIcon
                          sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                        />
                        <Typography color="text.secondary">
                          {searchTerm || invoiceStatusFilter !== "all"
                            ? "No matching purchases found with current filters"
                            : "No purchase records available"}
                        </Typography>
                        {(searchTerm || invoiceStatusFilter !== "all") && (
                          <Button
                            startIcon={<CloseIcon />}
                            onClick={clearFilters}
                            sx={{ mt: 2 }}
                          >
                            Clear Filters
                          </Button>
                        )}
                        {!searchTerm && invoiceStatusFilter === "all" && (
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddPurchaseDialog(true)}
                            sx={{ mt: 2 }}
                          >
                            Add Your First Purchase
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Fade>
          )}
        </TableContainer>

        {/* Pagination */}
        {filteredPurchases.length > 0 && (
          <TablePagination
            component="div"
            count={filteredPurchases.length}
            page={page}
            onPageChange={(e, n) => setPage(n)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: 1, borderColor: "divider" }}
          />
        )}
      </Paper>

      {/* Items Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptIcon />
            <Typography variant="h6">
              Invoice Items - {selectedInvoice?.InvoiceNumber || "No Invoice#"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedInvoice?.Items?.map((item, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{item.Item}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.Quantity}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {Number(item.Amount).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              {selectedInvoice?.Items?.length > 0 && (
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell colSpan={2} align="right" sx={{ fontWeight: 600 }}>
                    Total:
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {getInvoiceTotal(selectedInvoice?.Items).toLocaleString(
                      "en-IN"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "grey.50" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {imageType === "PO" ? "Purchase Order" : "Invoice"} Document
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: "grey.100" }}>
          {selectedImage && (
            <Box sx={{ textAlign: "center" }}>
              <img
                src={selectedImage}
                alt={`${imageType} document`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  borderRadius: 4,
                  boxShadow: 3,
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Invoice Dialog */}
      <Dialog
        open={openUploadInvoiceDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center">
            <CloudUploadIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Upload Invoice
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseUploadDialog}
            disabled={uploadLoading}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {uploadSuccess}
            </Alert>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Purchase: <strong>{selectedPurchase?.VendorName}</strong> (
            {selectedPurchase?.OfficeName})
          </Typography>

          <Box mt={2}>
            <TextField
              required
              fullWidth
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              error={Boolean(uploadError && !invoiceNumber.trim())}
              disabled={uploadLoading}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                border: "1px dashed rgba(0, 0, 0, 0.12)",
                borderRadius: 1,
                p: 3,
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              }}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                onChange={handleInvoiceFileChange}
                id="invoice-upload-input"
                style={{ display: "none" }}
                disabled={uploadLoading}
              />
              <label htmlFor="invoice-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  disabled={uploadLoading}
                  sx={{ mb: 1 }}
                >
                  Select Invoice File
                </Button>
              </label>

              {invoiceFile && (
                <Chip
                  label={invoiceFile.name}
                  onDelete={() => setInvoiceFile(null)}
                  color="success"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Max file size: 5MB. Allowed formats: JPG, PNG, GIF, WebP, PDF
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseUploadDialog} disabled={uploadLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadInvoice}
            disabled={uploadLoading || !invoiceNumber.trim() || !invoiceFile}
            variant="contained"
            startIcon={
              uploadLoading ? (
                <CircularProgress size={20} />
              ) : (
                <CloudUploadIcon />
              )
            }
            sx={{
              background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #43a047 0%, #1b5e20 100%)",
              },
            }}
          >
            {uploadLoading ? "Uploading..." : "Upload Invoice"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleViewItems}>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Items</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleUploadInvoiceClick}
          disabled={actionMenuPurchase?.Invoice}
        >
          <ListItemIcon>
            <CloudUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {actionMenuPurchase?.Invoice
              ? "Invoice Uploaded"
              : "Upload Invoice"}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Purchase Item Dialog */}
      <PurchaseItemDialog
        open={openAddPurchaseDialog}
        onClose={() => setOpenAddPurchaseDialog(false)}
        refreshPurchases={fetchPurchaseData}
      />
    </Box>
  );
}

export default Purchase;