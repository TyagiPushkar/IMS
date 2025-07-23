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
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Avatar,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import AddEmployeeDialog from "../components/AddEmployeeDialog"
import { useNavigate } from "react-router-dom" // Import useNavigate

function Employees() {
  const navigate = useNavigate() // Initialize useNavigate

  // State management
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeData, setEmployeeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)
  const [officeFilter, setOfficeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  // Fetch employee data
  const fetchEmployeeData = async () => {
    setLoading(true)
    setError("") // Clear previous errors

    const user = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!user || !sessionToken) {
      setError("Authentication required. Please log in.")
      setLoading(false)
      navigate("/login") // Redirect to login if no session
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php", {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.OfficeId, // Send OfficeId as userId
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
        setEmployeeData(result.data)
      } else {
        setError(result.message || "Failed to fetch employee data.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("An error occurred while fetching employee data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  // Filter and search logic
  const filteredEmployees = useMemo(() => {
    return employeeData.filter((employee) => {
      const matchesSearch =
        employee?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.EmpId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.Mail?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesOffice = !officeFilter || employee?.OfficeCode === officeFilter
      const matchesDate = !dateFilter || employee?.Date?.includes(dateFilter)

      return matchesSearch && matchesOffice && matchesDate
    })
  }, [employeeData, searchTerm, officeFilter, dateFilter])

  // Get unique office codes for filter
  const uniqueOfficeCodes = useMemo(() => {
    return [...new Set(employeeData.map((emp) => emp.OfficeCode).filter(Boolean))]
  }, [employeeData])

  // Pagination logic
  const paginatedEmployees = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredEmployees.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredEmployees, page, rowsPerPage])

  // Event handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setPage(0) // Reset to first page when searching
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget)
  }
  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }
  const clearFilters = () => {
    setOfficeFilter("")
    setDateFilter("")
    setSearchTerm("")
    setPage(0)
  }
  const exportData = () => {
    // Simple CSV export
    const csvContent = [
      ["Emp ID", "Name", "Email", "Office Code", "Date"],
      ...filteredEmployees.map((emp) => [emp.EmpId, emp.Name, emp.Mail, emp.OfficeCode, emp.Date]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }
  return (
    <Box sx={{ p: 0, maxWidth: "100%" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 1, mb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Employee Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all employee information
        </Typography>
      </Paper>
      {/* Stats Cards */}
      {/* Main Content */}
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search employees..."
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
                <Tooltip title="Filter">
                  <IconButton onClick={handleFilterClick} color="primary">
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchEmployeeData} color="primary">
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
                  onClick={() => setOpenAddEmployeeDialog(true)}
                  sx={{ ml: 1 }}
                >
                  Add Employee
                </Button>
              </Stack>
            </Grid>
          </Grid>
          {/* Active Filters */}
          {(officeFilter || dateFilter) && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Active filters:
                </Typography>
                {officeFilter && (
                  <Chip label={`Office: ${officeFilter}`} onDelete={() => setOfficeFilter("")} size="small" />
                )}
                {dateFilter && <Chip label={`Date: ${dateFilter}`} onDelete={() => setDateFilter("")} size="small" />}
                <Button size="small" onClick={clearFilters}>
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}
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
                    <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Office Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.map((employee, index) => (
                    <TableRow
                      key={employee.EmpId || index}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {employee.EmpId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: "primary.main" }}>
                            {employee.Name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{employee.Name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {employee.Mail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={employee.OfficeCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{employee.Date}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedEmployees.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No employees found
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
            count={filteredEmployees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{ sx: { minWidth: 250, p: 2 } }}
      >
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Office Code</InputLabel>
          <Select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)} label="Office Code">
            <MenuItem value="">All Offices</MenuItem>
            {uniqueOfficeCodes.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          size="small"
          label="Date Filter"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Menu>
      {/* Action Menu */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Employee</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          Delete Employee
        </MenuItem>
      </Menu>
      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
        refreshEmployees={fetchEmployeeData}
      />
    </Box>
  )
}

export default Employees
