import React, { useState } from "react";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  VpnKey as PasswordIcon,
} from "@mui/icons-material";

const AddOfficeDialog = ({ open, onClose, refreshOffice }) => {
  const [form, setForm] = useState({
    OfficeCode: "",
    OfficeName: "",
    OfficeAddress: "",
    AdminName: "",
    AdminMail: "",
    AdminPhone: "",
    Password: "",
    Role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    if (error) setError("");
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "OfficeCode",
      "OfficeName",
      "OfficeAddress",
      "AdminName",
      "AdminMail",
      "AdminPhone",
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

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
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess("Office added successfully!");
        setForm({
          OfficeCode: "",
          OfficeName: "",
          OfficeAddress: "",
          AdminName: "",
          AdminMail: "",
          AdminPhone: "",
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
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
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
          minHeight: 500,
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
        <IconButton onClick={handleClose} disabled={loading} sx={{ color: "white" }}>
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

          {/* Admin Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Admin Name"
              name="AdminName"
              fullWidth
              value={form.AdminName}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.AdminName)}
              helperText={fieldErrors.AdminName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          {/* Admin Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              type="email"
              label="Admin Email"
              name="AdminMail"
              fullWidth
              value={form.AdminMail}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.AdminMail)}
              helperText={fieldErrors.AdminMail || "Enter a valid email address"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          {/* Admin Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Admin Phone"
              name="AdminPhone"
              fullWidth
              value={form.AdminPhone}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.AdminPhone)}
              helperText={fieldErrors.AdminPhone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          {/* Password */}
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
              helperText={fieldErrors.Password}
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

          {/* Role */}
          <Grid item xs={12}>
            <FormControl fullWidth required error={Boolean(fieldErrors.Role)}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                name="Role"
                value={form.Role}
                onChange={handleInputChange}
                disabled={loading}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
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
            <strong>Note:</strong> All fields marked with * are required. The admin will receive login credentials via email.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || Object.keys(fieldErrors).some((key) => fieldErrors[key])}
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
};

export default AddOfficeDialog;