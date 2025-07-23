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
  Person as PersonIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material"
import IssueItemDialog from "../components/ItemIssueDialog"
import { useNavigate } from "react-router-dom" // Import useNavigate

function Issue() {
  const navigate = useNavigate() // Initialize useNavigate

  // State management
  const [openIssueDialog, setOpenIssueDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [issueData, setIssueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch issue data
  const fetchIssueData = async () => {
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
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/issue/get_issue.php", {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.OfficeId, // Send OfficeId as userId
          sessionToken: sessionToken,
          OfficeID: userObject.OfficeId, // Send OfficeID for filtering
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
        setIssueData(result.data)
        setError("")
      } else {
        setError(result.message || "Failed to fetch issue data.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to fetch issue data. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssueData()
  }, [])

  // Filter logic
  const filteredIssues = useMemo(() => {
    return issueData.filter(
      (issue) =>
        issue?.Item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue?.EmpID?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [issueData, searchTerm])

  // Pagination logic
  const paginatedIssues = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredIssues.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredIssues, page, rowsPerPage])

  // Event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }
  const refreshData = () => {
    fetchIssueData() // Call the main fetch function to refresh
  }
  const exportData = () => {
    const csvContent = [
      ["Office Code", "Employee", "Item", "Quantity", "Date & Time"],
      ...filteredIssues.map((issue) => [
        issue.OfficeCode,
        `${issue.Name} (${issue.EmpID})`,
        issue.Item,
        issue.Quantity,
        issue.DateTime,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "issued_items.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }
  return (
    <Box sx={{ p: 0, maxWidth: "100%" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Issued Items Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage all issued inventory items
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
                placeholder="Search issued items..."
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
                  onClick={() => setOpenIssueDialog(true)}
                  sx={{ ml: 1 }}
                >
                  Issue Item
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
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedIssues.map((issue, index) => (
                    <TableRow
                      key={`${issue.EmpID}-${issue.Item}-${index}`}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Chip label={issue.OfficeCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: "primary.main" }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{issue.Name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {issue.EmpID}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: "secondary.main" }}>
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">{issue.Item}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={issue.Quantity} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(issue.DateTime).toLocaleString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedIssues.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No issued items found
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
            count={filteredIssues.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Paper>
      {/* Issue Item Dialog */}
      <IssueItemDialog open={openIssueDialog} onClose={() => setOpenIssueDialog(false)} refreshData={refreshData} />
    </Box>
  )
}
export default Issue
