"use client"

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
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
  Avatar,
  Stack,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  RestartAlt as RestartAltIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";

import AddOfficeDialog from "../components/AddOfficeDialog";
import { useNavigate } from "react-router-dom";
import { Download as DownloadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

function Offices() {
  const navigate = useNavigate();

  const [openAddOfficeDialog, setOpenAddOfficeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"

  const [resetting, setResetting] = useState(null);
  const [editOffice, setEditOffice] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ================= FETCH OFFICES =================
  const fetchOfficeData = async () => {
    setLoading(true);
    setError("");

    const userObject = JSON.parse(localStorage.getItem("user"));
    const sessionToken = localStorage.getItem("sessionToken");

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required. Please login again.");
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
      if (result.success) setOfficeData(result.data);
      else setError(result.message || "Failed to fetch offices");
    } catch (err) {
      console.error(err);
      setError("Server error while fetching offices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeData();
  }, []);

  // ================= RESET SESSION =================
  const handleResetSession = async (officeCode) => {
    if (!window.confirm("Terminate this user's session?")) return;

    setResetting(officeCode);
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/offices/session.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: officeCode }),
        }
      );
      const result = await response.json();
      alert(result.message || "Done");
    } catch (err) {
      alert("Server error");
    } finally {
      setResetting(null);
    }
  };

  // ================= DEACTIVATE/ACTIVATE OFFICE =================
  const handleToggleOfficeStatus = async (officeCode, currentStatus) => {
    const action = currentStatus == 1 ? "deactivate" : "activate";
    const confirmMessage =
      currentStatus == 1 ? "Deactivate this office?" : "Activate this office?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const endpoint =
        currentStatus == 1
          ? "https://namami-infotech.com/SatyaMicro/src/offices/deactivate_office.php"
          : "https://namami-infotech.com/SatyaMicro/src/offices/activate_office.php";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ OfficeCode: officeCode }),
      });
      const result = await response.json();

      if (result.success) {
        alert(`Office ${action}d successfully`);
        fetchOfficeData();
      } else {
        alert(result.message || `Failed to ${action} office`);
      }
    } catch {
      alert("Server error");
    }
  };

  // ================= EDIT ADMIN =================
  const handleEditAdmin = async () => {
    if (!editOffice?.AdminEmpId) {
      alert("Please select an employee");
      return;
    }

    setEditLoading(true);

    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/offices/edit_office_admin.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            OfficeCode: editOffice.ID,
            AdminEmpId: editOffice.AdminEmpId,
            AdminName: editOffice.AdminName,
            AdminMail: editOffice.AdminMail,
            AdminPhone: editOffice.AdminPhone,
            OfficeAddress: editOffice.OfficeAddress,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Admin updated successfully");
        setEditOffice(null);
        fetchOfficeData();
      } else {
        alert(result.message || "Update failed");
      }
    } catch {
      alert("Server error");
    } finally {
      setEditLoading(false);
    }
  };

  // ================= FILTER & PAGINATION =================
  const filteredOffices = officeData.filter((office) => {
    // Search filter
    const matchesSearch =
      office.OfficeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.OfficeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.AdminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.AdminEmpId?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    if (statusFilter === "active") {
      return matchesSearch && office.Status == 1;
    } else if (statusFilter === "inactive") {
      return matchesSearch && office.Status != 1;
    }

    return matchesSearch;
  });

  const paginatedOffices = filteredOffices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ================= EXPORT TO EXCEL =================
  const handleExportExcel = () => {
    const exportData = filteredOffices.map((office, index) => ({
      "S.No": index + 1,
      "Office Code": office.OfficeCode,
      "Office Name": office.OfficeName,
      "Office Address": office.OfficeAddress,
      "Employee ID": office.AdminEmpId || "N/A",
      "Admin Name": office.AdminName,
      "Admin Email": office.AdminMail,
      "Admin Phone": office.AdminPhone,
      Status: office.Status == 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Offices");
    XLSX.writeFile(workbook, "Office_Report.xlsx");
  };

  // ================= UI =================
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4">Office Management</Typography>
      </Paper>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Field */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search office, code, admin..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Offices</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Export Button */}
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                fullWidth
              >
                Export Excel
              </Button>
            </Grid>

            {/* Add Office Button */}
            <Grid item xs={12} md={3} textAlign="right">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddOfficeDialog(true)}
                fullWidth
              >
                Add Office
              </Button>
            </Grid>
          </Grid>

          {/* Status Filter Quick Toggle (Alternative) */}
          <Box sx={{ mt: 2, display: { xs: "none", md: "block" } }}>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(e, value) => value && setStatusFilter(value)}
              size="small"
              color="primary"
            >
              <ToggleButton value="all">
                <Typography variant="body2">
                  All ({officeData.length})
                </Typography>
              </ToggleButton>
              <ToggleButton value="active">
                <ActiveIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Active ({officeData.filter((o) => o.Status == 1).length})
                </Typography>
              </ToggleButton>
              <ToggleButton value="inactive">
                <InactiveIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Inactive ({officeData.filter((o) => o.Status != 1).length})
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <TableContainer>
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
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>State Admin</TableCell>
                  <TableCell>Branch Manager</TableCell>

                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedOffices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No offices found{" "}
                        {statusFilter !== "all" &&
                          `with status: ${statusFilter}`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOffices.map((office) => (
                    <TableRow key={office.OfficeCode}>
                      <TableCell>
                        <Chip
                          label={office.OfficeCode}
                          icon={<BusinessIcon />}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{office.OfficeName}</TableCell>
                      <TableCell>
                        <Tooltip title={office.OfficeAddress}>
                          <Typography
                            sx={{
                              maxWidth: 200,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {office.OfficeAddress}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{office.AdminName}</TableCell>
                      <TableCell>{office.BMName}</TableCell>
                      <TableCell>
                        {office.Status == 1 ? (
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                            icon={<ActiveIcon />}
                          />
                        ) : (
                          <Chip
                            label="Inactive"
                            color="error"
                            size="small"
                            icon={<InactiveIcon />}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Reset Session">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleResetSession(office.OfficeCode)
                              }
                              color="warning"
                            >
                              <RestartAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Admin">
                            <IconButton
                              size="small"
                              onClick={() => setEditOffice(office)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              office.Status == 1
                                ? "Deactivate Office"
                                : "Activate Office"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleToggleOfficeStatus(
                                  office.ID,
                                  office.Status
                                )
                              }
                              color={office.Status == 1 ? "error" : "success"}
                            >
                              {office.Status == 1 ? (
                                <BlockIcon fontSize="small" />
                              ) : (
                                <ActiveIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredOffices.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(+e.target.value)}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* ADD OFFICE DIALOG */}
      <AddOfficeDialog
        open={openAddOfficeDialog}
        onClose={() => setOpenAddOfficeDialog(false)}
        refreshOffice={fetchOfficeData}
      />

      {/* EDIT ADMIN DIALOG */}
      <Dialog
        open={!!editOffice}
        onClose={() => setEditOffice(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit Admin - {editOffice?.OfficeName} ({editOffice?.OfficeCode})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Employee ID"
              value={editOffice?.AdminEmpId || ""}
              onChange={(e) =>
                setEditOffice({ ...editOffice, AdminEmpId: e.target.value })
              }
              placeholder="Enter employee ID"
              helperText="Enter the employee ID for the admin"
            />

            <TextField
              label="Admin Name"
              value={editOffice?.AdminName || ""}
              onChange={(e) =>
                setEditOffice({ ...editOffice, AdminName: e.target.value })
              }
              required
            />

            <TextField
              label="Admin Email"
              type="email"
              value={editOffice?.AdminMail || ""}
              onChange={(e) =>
                setEditOffice({ ...editOffice, AdminMail: e.target.value })
              }
              required
            />

            <TextField
              label="Admin Phone"
              value={editOffice?.AdminPhone || ""}
              onChange={(e) =>
                setEditOffice({ ...editOffice, AdminPhone: e.target.value })
              }
              required
            />

            <TextField
              label="Office Address"
              multiline
              rows={3}
              value={editOffice?.OfficeAddress || ""}
              onChange={(e) =>
                setEditOffice({ ...editOffice, OfficeAddress: e.target.value })
              }
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOffice(null)} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditAdmin}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading && <CircularProgress size={20} />}
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Offices;