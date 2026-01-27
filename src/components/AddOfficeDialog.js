"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Grid,
  Typography,
  Alert,
  Divider,
  IconButton,
  Fade,
  CircularProgress,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  VpnKey as PasswordIcon,
  SupervisorAccount as BranchManagerIcon,
} from "@mui/icons-material";

const AddOfficeDialog = ({ open, onClose, refreshOffice }) => {
  const [form, setForm] = useState({
    OfficeCode: "",
    OfficeName: "",
    OfficeAddress: "",
    AdminEmpId: "", // Store selected employee ID
    AdminName: "",
    AdminMail: "",
    AdminPhone: "",
    BMEmpId: "", // Branch Manager Employee ID
    BMName: "", // Branch Manager Name
    Password: "",
    Role: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      // Get user session data from localStorage
      const userData = localStorage.getItem("user");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!userData || !sessionToken) {
        throw new Error("User session not found");
      }

      const userObject = JSON.parse(userData);

      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userObject.OfficeId,
            sessionToken: sessionToken,
          }),
        }
      );

      if (response.status === 401) {
        // Handle unauthorized - clear session and show error
        localStorage.removeItem("user");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("lastActivity");
        setError("Session expired. Please login again.");
        return;
      }

      const result = await response.json();
      console.log("API Response:", result); // Debug: Check API response

      if (result.success) {
        // Set real employee data from API
        setEmployees(result.data || []);
        console.log("Employees loaded:", result.data); // Debug
      } else {
        setError("Failed to load employees. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    if (error) setError("");
  };

  const handleAdminSelect = (event, value) => {
    console.log("Admin selected:", value); // Debug

    if (value) {
      setForm({
        ...form,
        AdminEmpId: value.EmpId || "",
        AdminName: value.Name || "",
        AdminMail: value.Mail || "",
        AdminPhone: value.Phone || "", // Your API doesn't have Phone field
      });
      console.log("Updated form:", {
        // Debug
        AdminEmpId: value.EmpId,
        AdminName: value.Name,
        AdminMail: value.Mail,
        AdminPhone: value.Phone,
      });

      // Clear any related field errors
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors.AdminName;
      delete newFieldErrors.AdminMail;
      delete newFieldErrors.AdminPhone;
      setFieldErrors(newFieldErrors);
    } else {
      // Clear selection
      console.log("Clearing admin selection"); // Debug
      setForm({
        ...form,
        AdminEmpId: "",
        AdminName: "",
        AdminMail: "",
        AdminPhone: "",
      });
    }
  };

  const handleBranchManagerSelect = (event, value) => {
    console.log("Branch Manager selected:", value); // Debug

    if (value) {
      setForm({
        ...form,
        BMEmpId: value.EmpId || "",
        BMName: value.Name || "",
      });
      console.log("Updated BM form:", {
        // Debug
        BMEmpId: value.EmpId,
        BMName: value.Name,
      });

      // Clear field error
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors.BMEmpId;
      setFieldErrors(newFieldErrors);
    } else {
      // Clear selection
      console.log("Clearing BM selection"); // Debug
      setForm({
        ...form,
        BMEmpId: "",
        BMName: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "OfficeCode",
      "OfficeName",
      "OfficeAddress",
      "AdminEmpId",
      "BMEmpId", // Branch Manager is also required
      "Password",
      "Role",
    ];

    requiredFields.forEach((field) => {
      if (!form[field]) {
        errors[field] = "This field is required";
      }
    });

    // Email validation
    if (form.AdminMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.AdminMail)) {
      errors.AdminMail = "Please enter a valid email address";
    }

    // Check if Admin and BM are the same person
    if (form.AdminEmpId && form.BMEmpId && form.AdminEmpId === form.BMEmpId) {
      errors.BMEmpId = "Admin and Branch Manager cannot be the same person";
    }

    setFieldErrors(errors);
    console.log("Form validation errors:", errors); // Debug
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    console.log("Form before save:", form); // Debug

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    // Create the payload with all required fields
    const payload = {
      OfficeCode: form.OfficeCode,
      OfficeName: form.OfficeName,
      OfficeAddress: form.OfficeAddress,
      AdminEmpId: form.AdminEmpId,
      AdminName: form.AdminName,
      AdminMail: form.AdminMail,
      AdminPhone: form.AdminPhone,
      BMEmpId: form.BMEmpId,
      BMName: form.BMName,
      Password: form.Password,
      Role: form.Role,
    };

    console.log("Saving payload:", payload); // Debug

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/offices/add_offices.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      console.log("Save response:", result); // Debug

      if (result.success) {
        setSuccess("Office added successfully!");
        // Reset form
        setForm({
          OfficeCode: "",
          OfficeName: "",
          OfficeAddress: "",
          AdminEmpId: "",
          AdminName: "",
          AdminMail: "",
          AdminPhone: "",
          BMEmpId: "",
          BMName: "",
          Password: "",
          Role: "",
        });
        setTimeout(() => {
          onClose();
          refreshOffice();
        }, 1500);
      } else {
        setError(result.message || "Failed to add office.");
      }
    } catch (err) {
      console.error("Save error:", err); // Debug
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form on close
      setForm({
        OfficeCode: "",
        OfficeName: "",
        OfficeAddress: "",
        AdminEmpId: "",
        AdminName: "",
        AdminMail: "",
        AdminPhone: "",
        BMEmpId: "",
        BMName: "",
        Password: "",
        Role: "",
      });
      setError("");
      setSuccess("");
      setFieldErrors({});
      onClose();
    }
  };

  // Find selected employee object
  const getSelectedAdmin = () => {
    return employees.find((emp) => emp.EmpId === form.AdminEmpId) || null;
  };

  const getSelectedBM = () => {
    return employees.find((emp) => emp.EmpId === form.BMEmpId) || null;
  };

  // Filter out admin from branch manager options
  const getBranchManagerOptions = () => {
    return employees.filter((emp) => emp.EmpId !== form.AdminEmpId);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600,
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
          <BusinessIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Add New Office
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Fade in={Boolean(success)}>
          <Box mb={2}>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </Fade>
        <Fade in={Boolean(error)}>
          <Box mb={2}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Fade>

        {/* Debug Info - Remove in production */}
        <Box
          sx={{
            mb: 2,
            p: 1,
            bgcolor: "#f5f5f5",
            borderRadius: 1,
            fontSize: "12px",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Debug Info: Employees loaded: {employees.length} | Selected Admin
            ID: {form.AdminEmpId || "None"} | Selected BM ID:{" "}
            {form.BMEmpId || "None"}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Office Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Office Code"
              name="OfficeCode"
              fullWidth
              value={form.OfficeCode}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.OfficeCode)}
              helperText={fieldErrors.OfficeCode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          {/* Office Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Office Name"
              name="OfficeName"
              fullWidth
              value={form.OfficeName}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.OfficeName)}
              helperText={fieldErrors.OfficeName}
              disabled={loading}
            />
          </Grid>

          {/* Office Address */}
          <Grid item xs={12}>
            <TextField
              required
              label="Office Address"
              name="OfficeAddress"
              fullWidth
              multiline
              rows={2}
              value={form.OfficeAddress}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.OfficeAddress)}
              helperText={fieldErrors.OfficeAddress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          {/* ================= ADMIN SECTION ================= */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary"
              sx={{ mb: 1 }}
            >
              Admin Details
            </Typography>
          </Grid>

          {/* Admin Selection Dropdown */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={Boolean(fieldErrors.AdminEmpId)}
            >
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  `${option.EmpId || ""} - ${option.Name || ""} (${
                    option.Mail || ""
                  })`
                }
                value={getSelectedAdmin()}
                onChange={handleAdminSelect}
                loading={loadingEmployees}
                isOptionEqualToValue={(option, value) =>
                  option.EmpId === value.EmpId
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Admin *"
                    required
                    error={Boolean(fieldErrors.AdminEmpId)}
                    helperText={
                      fieldErrors.AdminEmpId ||
                      "Select an employee to be the Admin"
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {loadingEmployees ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.ID || option.EmpId}>
                    <Box>
                      <Typography variant="body1">
                        {option.Name || "No Name"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {option.EmpId || "N/A"} � Email:{" "}
                        {option.Mail || "N/A"} � Office:{" "}
                        {option.OfficeCode || "N/A"}
                      </Typography>
                    </Box>
                  </li>
                )}
                disabled={loading}
              />
            </FormControl>
          </Grid>

          {/* Display selected admin info (read-only) */}
          {form.AdminEmpId && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Admin Name"
                  fullWidth
                  value={form.AdminName}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Admin Email"
                  fullWidth
                  value={form.AdminMail}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Admin Phone"
                  fullWidth
                  value={form.AdminPhone}
                  placeholder="No phone in API"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={loading}
                />
              </Grid>
            </>
          )}

          {/* ================= BRANCH MANAGER SECTION ================= */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
            >
              Branch Manager Details
            </Typography>
          </Grid>

          {/* Branch Manager Selection Dropdown */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={Boolean(fieldErrors.BMEmpId)}
            >
              <Autocomplete
                options={getBranchManagerOptions()}
                getOptionLabel={(option) =>
                  `${option.EmpId || ""} - ${option.Name || ""} (${
                    option.Mail || ""
                  })`
                }
                value={getSelectedBM()}
                onChange={handleBranchManagerSelect}
                loading={loadingEmployees}
                isOptionEqualToValue={(option, value) =>
                  option.EmpId === value.EmpId
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Branch Manager *"
                    required
                    error={Boolean(fieldErrors.BMEmpId)}
                    helperText={
                      fieldErrors.BMEmpId ||
                      "Select an employee to be the Branch Manager"
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <BranchManagerIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {loadingEmployees ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.ID || option.EmpId}>
                    <Box>
                      <Typography variant="body1">
                        {option.Name || "No Name"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {option.EmpId || "N/A"} � Email:{" "}
                        {option.Mail || "N/A"} � Office:{" "}
                        {option.OfficeCode || "N/A"}
                      </Typography>
                    </Box>
                  </li>
                )}
                disabled={loading}
              />
            </FormControl>
          </Grid>

          {/* Display selected Branch Manager info (read-only) */}
          {form.BMEmpId && (
            <Grid item xs={12}>
              <TextField
                label="Branch Manager Name"
                fullWidth
                value={form.BMName}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <BranchManagerIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
          )}

          {/* ================= PASSWORD & ROLE ================= */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Password"
              name="Password"
              type="password"
              fullWidth
              value={form.Password}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.Password)}
              helperText={
                fieldErrors.Password || "Set password for admin login"
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PasswordIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={Boolean(fieldErrors.Role)}>
              <InputLabel>Role *</InputLabel>
              <Select
                label="Role *"
                name="Role"
                value={form.Role}
                onChange={handleInputChange}
                disabled={loading}
              >
                <MenuItem value="Admin">State Admin</MenuItem>
                <MenuItem value="SuperAdmin">HO Admin</MenuItem>
              </Select>
              {fieldErrors.Role && (
                <Typography variant="caption" color="error">
                  {fieldErrors.Role}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={3}>
          <Divider />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> All fields marked with * are required. Admin
            will receive login credentials. Admin and Branch Manager must be
            different employees.
          </Typography>

          {/* Display real employee count */}
          {employees.length > 0 && (
            <Typography
              variant="caption"
              color="info.main"
              sx={{ display: "block", mt: 1 }}
            >
              Loaded {employees.length} employees from database
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            loading ||
            loadingEmployees ||
            Object.keys(fieldErrors).some((key) => fieldErrors[key])
          }
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            minWidth: 120,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          }}
        >
          {loading ? "Saving..." : "Save Office"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddOfficeDialog;