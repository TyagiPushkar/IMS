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
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterAlt as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import AddEmployeeDialog from "../components/AddEmployeeDialog"
import { useNavigate } from "react-router-dom";

// Utility to format date to dd/mm/yyyy
const formatDate = (datetime) => {
  if (!datetime) return "";
  const d = new Date(datetime);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function Employees() {
  const navigate = useNavigate();

  // State
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [officeFilter, setOfficeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [openBulkDeactivate, setOpenBulkDeactivate] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const downloadSampleExcel = () => {
    const csv = [
      ["EmpId", "Name", "Mail", "OfficeCode"],
      ["EMP001", "John Doe", "john@company.com", "HQ"],
      ["EMP002", "Jane Smith", "jane@company.com", "BR1"],
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_bulk_sample.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    setBulkLoading(true);
    try {
      const res = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/upload_bulk_employees.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setOpenBulkUpload(false);
        fetchEmployeeData();
      }
    } catch {
      alert("Server error during bulk upload");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!bulkFile) {
      alert("Please select Excel file with EmpId column");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    setBulkLoading(true);
    try {
      const res = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/bulk_deactivate_employees.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setOpenBulkDeactivate(false);
        fetchEmployeeData();
      }
    } catch {
      alert("Server error during bulk deactivate");
    } finally {
      setBulkLoading(false);
    }
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    setLoading(true);
    setError("");
    const user = JSON.parse(localStorage.getItem("user"));
    const sessionToken = localStorage.getItem("sessionToken");
    if (!user || !sessionToken) {
      setError("Authentication required. Please log in.");
      navigate("/login");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.OfficeId, sessionToken }),
        }
      );
      if (res.status === 401) {
        localStorage.clear();
        setError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }
      const result = await res.json();
      if (result.success) setEmployeeData(result.data);
      else setError(result.message || "Failed to fetch employees");
    } catch (err) {
      setError("Server error while fetching employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employeeData.filter((emp) => {
      const matchesSearch =
        emp?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp?.EmpId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp?.Mail?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOffice = !officeFilter || emp?.OfficeCode === officeFilter;
      const matchesDate = !dateFilter || emp?.Date?.includes(dateFilter);

      const matchesStatus =
        statusFilter === "" || String(emp?.Status) === statusFilter;

      return matchesSearch && matchesOffice && matchesDate && matchesStatus;
    });
  }, [employeeData, searchTerm, officeFilter, dateFilter, statusFilter]);

  const uniqueOfficeCodes = useMemo(
    () => [...new Set(employeeData.map((e) => e.OfficeCode).filter(Boolean))],
    [employeeData]
  );

  const paginatedEmployees = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredEmployees.slice(start, start + rowsPerPage);
  }, [filteredEmployees, page, rowsPerPage]);

  // Handlers
  const handleChangePage = (e, p) => setPage(p);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setOfficeFilter("");
    setDateFilter("");
    setStatusFilter("");
    setPage(0);
  };

  const handleExport = () => {
    const csv = [
      ["Emp ID", "Name", "Email", "Office", "Date", "Status"],
      ...filteredEmployees.map((e) => [
        e.EmpId,
        e.Name,
        e.Mail,
        e.OfficeCode,
        formatDate(e.Date),
        e.Status === 1 ? "Active" : "Inactive",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ========== EDIT EMPLOYEE ==========
  const handleEditEmployee = async () => {
    if (!editEmployee) return;
    setEditLoading(true);
    try {
      const res = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/edit_employee.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editEmployee),
        }
      );
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setEditEmployee(null);
        fetchEmployeeData();
      }
    } catch {
      alert("Server error while updating employee");
    } finally {
      setEditLoading(false);
    }
  };

  // ========== DEACTIVATE EMPLOYEE ==========
  const handleDeactivateEmployee = async (empId) => {
    if (!window.confirm("Deactivate this employee?")) return;
    try {
      const res = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/deactivate_employee.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ EmpId: empId }),
        }
      );
      const result = await res.json();
      alert(result.message);
      if (result.success) fetchEmployeeData();
    } catch {
      alert("Server error while deactivating employee");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4">Employee Management</Typography>
      </Paper>

      {/* Filter Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Office Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Office</InputLabel>
                <Select
                  label="Office"
                  value={officeFilter}
                  onChange={(e) => {
                    setOfficeFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Offices</MenuItem>
                  {uniqueOfficeCodes.map((office) => (
                    <MenuItem key={office} value={office}>
                      {office}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                label="Date"
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Clear Filters">
                  <IconButton
                    size="small"
                    onClick={clearFilters}
                    color="secondary"
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={fetchEmployeeData}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton size="small" onClick={handleExport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Bulk Operations
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSampleExcel}
                  size="small"
                >
                  Sample Template
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setOpenBulkUpload(true)}
                  size="small"
                >
                  Bulk Upload
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenBulkDeactivate(true)}
                  size="small"
                >
                  Bulk Deactivate
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddEmployeeDialog(true)}
                size="small"
              >
                Add Employee
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredEmployees.length} employees
          {(searchTerm || officeFilter || dateFilter || statusFilter) &&
            " (filtered)"}
        </Typography>
        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          size="small"
        />
      </Box>

      {/* Employee Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Emp ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Office</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((e) => (
                <TableRow key={e.EmpId} hover>
                  <TableCell>{e.EmpId}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                      >
                        {e.Name?.charAt(0)}
                      </Avatar>
                      <Typography>{e.Name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{e.Mail}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.OfficeCode}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(e.Date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.Status === 1 ? "Active" : "Inactive"}
                      color={e.Status === 1 ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setEditEmployee({ ...e })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeactivateEmployee(e.EmpId)}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No employees found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Edit Employee Dialog */}
      <Dialog
        open={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editEmployee?.Name || ""}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, Name: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={editEmployee?.Mail || ""}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, Mail: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Office Code"
              value={editEmployee?.OfficeCode || ""}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, OfficeCode: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEmployee(null)}>Cancel</Button>
          <Button onClick={handleEditEmployee} variant="contained">
            {editLoading ? <CircularProgress size={22} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={openBulkUpload}
        onClose={() => setOpenBulkUpload(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bulk Upload Employees</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload an Excel or CSV file with the following columns:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>EmpId</strong> - Employee ID
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Name</strong> - Employee Name
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Mail</strong> - Email Address
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>OfficeCode</strong> - Office Location Code
              </Typography>
            </li>
          </Box>
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              style={{ width: "100%" }}
            />
            {bulkFile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Selected: {bulkFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkUpload(false)}>Cancel</Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!bulkFile || bulkLoading}
          >
            {bulkLoading ? <CircularProgress size={22} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Deactivate Dialog */}
      <Dialog
        open={openBulkDeactivate}
        onClose={() => setOpenBulkDeactivate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bulk Deactivate Employees</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will deactivate all employees listed in the uploaded
            file.
          </Alert>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload an Excel or CSV file with a single column:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>EmpId</strong> - Employee ID
              </Typography>
            </li>
          </Box>
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              p: 2,
              borderRadius: 1,
            }}
          >
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              style={{ width: "100%" }}
            />
            {bulkFile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Selected: {bulkFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeactivate(false)}>Cancel</Button>
          <Button
            onClick={handleBulkDeactivate}
            variant="contained"
            color="error"
            disabled={!bulkFile || bulkLoading}
          >
            {bulkLoading ? <CircularProgress size={22} /> : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
        refreshEmployees={fetchEmployeeData}
      />
    </Box>
  );
}

export default Employees;