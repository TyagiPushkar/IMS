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
  Grid,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Stack,
} from "@mui/material"
import {
  Search,
  Add,
  Visibility,
  LocalShipping,
  Business,
  Person,
  CalendarToday,
  FilterList,
  Refresh,
} from "@mui/icons-material"
import TransferItemDialog from "../components/TransferitemDialog"

const Transfer = () => {
  const theme = useTheme()
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [transferData, setTransferData] = useState([])
  const [officeData, setOfficeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch transfer data
  const fetchTransferData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/transfer/get_stock_transfer.php")
      const result = await response.json()
      if (result.success) {
        setTransferData(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to fetch transfer data.")
      console.error("Transfer fetch error:", err)
    } finally {
      setRefreshing(false)
    }
  }

  // Fetch office data for mapping office IDs to names
  const fetchOfficeData = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php")
      const result = await response.json()
      if (result.success) {
        setOfficeData(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to fetch office data.")
      console.error("Office fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchTransferData(), fetchOfficeData()])
    }
    fetchData()
  }, [])

  // Helper function to get office name by ID
  const getOfficeName = (officeId) => {
    const office = officeData.find((office) => office.ID === Number.parseInt(officeId))
    return office ? office.OfficeName : `Office ${officeId}`
  }

  // Helper function to get office code by ID
  const getOfficeCode = (officeId) => {
    const office = officeData.find((office) => office.ID === Number.parseInt(officeId))
    return office ? office.OfficeCode : ""
  }

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success"
      case "in transit":
        return "warning"
      case "pending":
        return "info"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  // Filter transfers based on search term
  const filteredTransfers = transferData.filter((transfer) => {
    const fromOfficeName = getOfficeName(transfer.FromOfficeID).toLowerCase()
    const toOfficeName = getOfficeName(transfer.ToOfficeID).toLowerCase()
    const batchId = transfer.BatchId?.toLowerCase() || ""
    const status = transfer.Status?.toLowerCase() || ""
    const searchLower = searchTerm.toLowerCase()

    return (
      fromOfficeName.includes(searchLower) ||
      toOfficeName.includes(searchLower) ||
      batchId.includes(searchLower) ||
      status.includes(searchLower)
    )
  })

  const handleRefresh = () => {
    fetchTransferData()
  }

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
      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalShipping sx={{ fontSize: 40, color: "black" }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "black", mb: 1 }}>
                Stock Transfer Management
              </Typography>
              <Typography variant="body1" sx={{ color: alpha(theme.palette.common.black, 0.8) }}>
                Track and manage stock transfers between offices
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.success.main }}>
                    {transferData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transfers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: theme.palette.warning.main }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.warning.main }}>
                    {transferData.filter((t) => t.Status === "In transit").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Transit
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: theme.palette.info.main }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.info.main }}>
                    {officeData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Offices
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ backgroundColor: theme.palette.error.main }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.error.main }}>
                    {new Set(transferData.map((t) => t.BatchId)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Batches
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
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
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Batch ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>From Office</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>To Office</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Item ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Transfer Mode</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <LocalShipping sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                        <Typography variant="h6" color="text.secondary">
                          No transfers found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchTerm ? "Try adjusting your search criteria" : "Start by creating a new transfer"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers.map((transfer, index) => (
                    <TableRow
                      key={transfer.ID}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: alpha(theme.palette.grey[500], 0.02),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
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
                              backgroundColor: theme.palette.info.main,
                            }}
                          >
                            {getOfficeCode(transfer.FromOfficeID)}
                          </Avatar>
                          <Typography variant="body2">{getOfficeName(transfer.FromOfficeID)}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                              backgroundColor: theme.palette.success.main,
                            }}
                          >
                            {getOfficeCode(transfer.ToOfficeID)}
                          </Avatar>
                          <Typography variant="body2">{getOfficeName(transfer.ToOfficeID)}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={`Item #${transfer.Item}`} size="small" variant="outlined" />
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
                          color={transfer.ModeOfTransfer === "Self" ? "primary" : "secondary"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transfer.Status}
                          size="small"
                          color={getStatusColor(transfer.Status)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(transfer.Date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
  )
}

export default Transfer
