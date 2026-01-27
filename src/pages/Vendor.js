"use client"
import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

function Vendor() {
  const navigate = useNavigate()
  
  // State
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // New Vendor Form State
  const [vendorName, setVendorName] = useState("")
  const [vendorAddress, setVendorAddress] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [emailId, setEmailId] = useState("")
  const [vendorAgreement, setVendorAgreement] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  const userObject = JSON.parse(localStorage.getItem("user"))
  const sessionToken = localStorage.getItem("sessionToken")
  const baseUrl = "https://namami-infotech.com/SatyaMicro/src/purchase"

  const fetchVendors = async () => {
    setLoading(true)
    setError("")

    if (!userObject || !sessionToken) {
      setError("Authentication required. Please log in.")
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`${baseUrl}/get_vendor.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userObject.OfficeId,
          sessionToken: sessionToken,
        }),
      })

      if (response.status === 401) {
        setError("Session expired or invalid. Please log in again.")
        localStorage.clear()
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        setVendors(result.data)
      } else {
        setError(result.message || "Failed to load vendor list.")
      }
    } catch (err) {
      console.error(err)
      setError("Error fetching vendors.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleAddVendor = async () => {
    if (!vendorName.trim()) {
      setError("Vendor name is required.")
      return
    }

    setSubmitting(true)
    setError("")
    
    try {
      const formData = new FormData()
      
      // Add all required fields
      formData.append("userId", userObject.OfficeId)
      formData.append("sessionToken", sessionToken)
      formData.append("VendorName", vendorName.trim())
      formData.append("VendorAddress", vendorAddress.trim())
      formData.append("GSTNumber", gstNumber.trim())
      formData.append("ContactPerson", contactPerson.trim())
      formData.append("ContactNumber", contactNumber.trim())
      formData.append("EmailId", emailId.trim())
      
      // Add file if present
      if (vendorAgreement) {
        formData.append("VendorAgreement", vendorAgreement)
      }

      const response = await fetch(`${baseUrl}/add_vendor.php`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        fetchVendors()
        resetForm()
        setOpenAddDialog(false)
      } else {
        setError(result.message || "Failed to add vendor.")
      }
    } catch (err) {
      console.error("Error adding vendor:", err)
      setError("Error adding vendor. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setVendorName("")
    setVendorAddress("")
    setGstNumber("")
    setContactPerson("")
    setContactNumber("")
    setEmailId("")
    setVendorAgreement(null)
    setError("")
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should be less than 5MB")
        return
      }
      setVendorAgreement(file)
    }
  }

  const handleChangePage = (event, newPage) => setPage(newPage)
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDownloadAgreement = (fileName) => {
    if (!fileName) {
      setError("No agreement file available")
      return
    }
    
    const downloadUrl = `${baseUrl}/uploads/${fileName}`
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewAgreement = (fileName) => {
    if (!fileName) {
      setError("No agreement file available")
      return
    }
    
    const viewUrl = `${baseUrl}/uploads/${fileName}`
    window.open(viewUrl, '_blank')
  }

  const filteredVendors = vendors.filter(
    (v) =>
      v.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.VendorAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.GSTNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ContactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.EmailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ContactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedVendors = filteredVendors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Vendor Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage vendor details, agreements, and communications
        </Typography>
      </Paper>

      {/* Search and Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search vendors by name, GST, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddDialog(true)}
                  sx={{ minWidth: 140 }}
                >
                  Add Vendor
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedVendors.length} of {filteredVendors.length} vendors
          {searchTerm && ` � Searching: "${searchTerm}"`}
        </Typography>
        <TablePagination
          component="div"
          count={filteredVendors.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          size="small"
        />
      </Box>

      {/* Vendor Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Vendor ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendor Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>GST Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact Person</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Agreement</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVendors.map((vendor) => (
                <TableRow key={vendor.VendorId} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {vendor.VendorId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BusinessIcon color="primary" fontSize="small" />
                      <Typography fontWeight={500}>
                        {vendor.VendorName || "-"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={vendor.VendorAddress || "No address"}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {vendor.VendorAddress 
                            ? (vendor.VendorAddress.length > 30 
                              ? `${vendor.VendorAddress.substring(0, 30)}...` 
                              : vendor.VendorAddress)
                            : "-"
                          }
                        </Typography>
                      </Stack>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {vendor.GSTNumber ? (
                      <Chip 
                        label={vendor.GSTNumber} 
                        size="small" 
                        variant="outlined"
                        color="success"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PersonIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {vendor.ContactPerson || "-"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {vendor.ContactNumber ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {vendor.ContactNumber}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.EmailId ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmailIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {vendor.EmailId}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.VendorAgreement ? (
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Agreement">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewAgreement(vendor.VendorAgreement)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Agreement">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleDownloadAgreement(vendor.VendorAgreement)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ ml: 1, alignSelf: 'center' }}>
                          {vendor.VendorAgreement.split('_').pop()?.split('.').pop()?.toUpperCase()}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Agreement
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {vendor.VendorCreated 
                        ? new Date(vendor.VendorCreated).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "-"
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {vendor.VendorCreated 
                        ? new Date(vendor.VendorCreated).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ""
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

              {filteredVendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? "No vendors match your search" : "No vendors found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Add Vendor Dialog - Keep the same as before */}
      <Dialog
        open={openAddDialog}
        onClose={() => {
          if (!submitting) {
            setOpenAddDialog(false)
            resetForm()
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Add New Vendor</Typography>
          <IconButton 
            onClick={() => {
              if (!submitting) {
                setOpenAddDialog(false)
                resetForm()
              }
            }} 
            sx={{ color: "white" }}
            disabled={submitting}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Fields marked with * are required
          </Typography>
          
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Vendor Name *"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                margin="normal"
                required
                size="small"
                error={!vendorName.trim() && vendorName !== ""}
                helperText={!vendorName.trim() && "Vendor name is required"}
                disabled={submitting}
              />
              
              <TextField
                fullWidth
                label="GST Number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                margin="normal"
                size="small"
                placeholder="Enter GSTIN number"
                disabled={submitting}
              />
              
              <TextField
                fullWidth
                label="Vendor Address"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                size="small"
                placeholder="Full address of the vendor"
                disabled={submitting}
              />
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                Contact Information
              </Typography>
              
              <TextField
                fullWidth
                label="Contact Person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                margin="normal"
                size="small"
                placeholder="Name of primary contact"
                disabled={submitting}
              />
              
              <TextField
                fullWidth
                label="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                margin="normal"
                size="small"
                type="tel"
                placeholder="Phone number"
                disabled={submitting}
              />
              
              <TextField
                fullWidth
                label="Email Address"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                margin="normal"
                size="small"
                type="email"
                placeholder="Email address"
                disabled={submitting}
              />
              
              {/* File Upload */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Vendor Agreement (Optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  sx={{ mt: 1 }}
                  fullWidth
                  disabled={submitting}
                >
                  {vendorAgreement ? vendorAgreement.name : "Upload Agreement"}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    disabled={submitting}
                  />
                </Button>
                {vendorAgreement && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {vendorAgreement.name} ({(vendorAgreement.size / 1024).toFixed(1)} KB)
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setVendorAgreement(null)}
                      disabled={submitting}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Supports: PDF, DOC, JPG, PNG (Max 5MB)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              setOpenAddDialog(false)
              resetForm()
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddVendor}
            disabled={submitting || !vendorName.trim()}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? "Adding..." : "Add Vendor"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Vendor