"use client"
import { useState, useEffect } from "react"
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
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import PurchaseItemDialog from "../components/PurchaseItemDialog"
import { useNavigate } from "react-router-dom" // Import useNavigate

function Purchase() {
  const navigate = useNavigate() // Initialize useNavigate
  const [openDialog, setOpenDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [openAddPurchaseDialog, setOpenAddPurchaseDialog] = useState(false)

  const fetchPurchaseData = async () => {
    setLoading(true)
    setError("") // Clear previous errors

    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required or Office ID not found. Please log in.")
      setLoading(false)
      navigate("/login") // Redirect to login if no session or OfficeId
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/purchase/get_purchase.php", {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.OfficeId, // Send OfficeId as userId
          sessionToken: sessionToken,
        }),
      })

      if (response.status === 401) {
        // Unauthorized, session invalid or expired
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        // The PHP already groups the data, so we can directly use it
        setPurchaseData(result.data)
      } else {
        setError(result.message || "Failed to fetch purchase data.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("An error occurred while fetching purchase data. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchaseData()
  }, [])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice)
    setOpenDialog(true)
  }
  const filteredPurchases = purchaseData.filter(
    (purchase) =>
      purchase?.InvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase?.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  return (
    <Box sx={{ p: 0, maxWidth: "100%" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Purchase Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all purchase invoices
        </Typography>
      </Paper>
      {/* Main Content */}
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search purchases..."
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddPurchaseDialog(true)}>
                  Add Purchase
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
                    <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPurchases.map((purchase, index) => (
                    <TableRow
                      key={purchase.InvoiceNumber || index}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Chip
                          label={purchase.InvoiceNumber}
                          color="primary"
                          size="small"
                          icon={<ReceiptIcon fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {purchase.VendorName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {purchase.VendorAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Invoice Image">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedImage(purchase.Invoice)
                                setOpenImageDialog(true)
                              }}
                            >
                              <ImageIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Items">
                            <IconButton size="small" onClick={() => handleRowClick(purchase)}>
                              <CategoryIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{purchase.Date}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPurchases.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No purchases found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Fade>
          )}
        </TableContainer>
      </Paper>
      {/* Invoice Items Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Invoice Items - {selectedInvoice?.InvoiceNumber}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenDialog(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedInvoice ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoice.Items && selectedInvoice.Items.length > 0 ? (
                    selectedInvoice.Items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.Item}</TableCell>
                        <TableCell align="right">{item.Quantity}</TableCell>
                        <TableCell align="right">{item.Amount}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          No items available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box p={2}>
              <Typography>No invoice selected</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Image Dialog */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box display="flex" alignItems="center">
            <ImageIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Invoice Image
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenImageDialog(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedImage && (
            <Box sx={{ maxWidth: "100%", maxHeight: "80vh", overflow: "auto" }}>
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Invoice"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 4,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Purchase Dialog */}
      <PurchaseItemDialog
        open={openAddPurchaseDialog}
        onClose={() => setOpenAddPurchaseDialog(false)}
        refreshPurchases={fetchPurchaseData}
      />
    </Box>
  )
}

export default Purchase
