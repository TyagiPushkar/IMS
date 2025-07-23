"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete, // Used for the office list
  Box,
  Grid,
  Typography,
  Alert,
  Divider,
  IconButton,
  Fade,
  CircularProgress,
  Chip,
  InputAdornment,
} from "@mui/material"
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
} from "@mui/icons-material"

const AddEmployeeDialog = ({ open, onClose, refreshEmployees }) => {
  const [form, setForm] = useState({
    EmpId: "",
    Name: "",
    Mail: "",
    OfficeCode: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [officeData, setOfficeData] = useState([]) // State to hold office list
  const [officeLoading, setOfficeLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "EmpId":
        if (!value.trim()) return "Employee ID is required"
        if (value.length < 3) return "Employee ID must be at least 3 characters"
        return ""
      case "Name":
        if (!value.trim()) return "Employee name is required"
        if (value.length < 2) return "Name must be at least 2 characters"
        return ""
      case "Mail":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""
      case "OfficeCode":
        if (!value) return "Office code is required"
        return ""
      default:
        return ""
    }
  }

  // Fetch office data for dropdown
  const fetchOfficeData = async () => {
    setOfficeLoading(true)
    try {
      // This endpoint is already secured with session validation
      const userObject = JSON.parse(localStorage.getItem("user"))
      const sessionToken = localStorage.getItem("sessionToken")

      if (!userObject || !sessionToken || !userObject.OfficeId) {
        setError("Authentication required to fetch office data. Please log in.")
        setOfficeLoading(false)
        return
      }

      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.OfficeId,
          sessionToken: sessionToken,
        }),
      })
      const result = await response.json()
      if (response.status === 401) {
        setError("Session expired or invalid. Please log in again.")
        // Optionally redirect to login here if this dialog is not part of a protected route
        return
      }
      if (result.success) {
        setOfficeData(result.data)
      } else {
        setError("Failed to load office data: " + result.message)
      }
    } catch (err) {
      setError("Failed to fetch office data. Check console for details.")
    } finally {
      setOfficeLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchOfficeData()
      // Reset form and errors when dialog opens
      setForm({
        EmpId: "",
        Name: "",
        Mail: "",
        OfficeCode: "",
      })
      setError("")
      setSuccess("")
      setFieldErrors({})
    }
  }, [open])

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Real-time validation
    const fieldError = validateField(name, value)
    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }))
    // Clear general error when user starts typing
    if (error) setError("")
  }

  // Handle office code selection from Autocomplete
  const handleOfficeCodeChange = (event, newValue) => {
    // Extract just the code if the full string was selected (e.g., "OFF001 - Main Office")
    const code = newValue?.split(" - ")[0] || ""
    setForm({ ...form, OfficeCode: code })
    const fieldError = validateField("OfficeCode", code)
    setFieldErrors((prev) => ({
      ...prev,
      OfficeCode: fieldError,
    }))
    if (error) setError("")
  }

  // Validate entire form
  const validateForm = () => {
    const errors = {}
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key])
      if (error) errors[key] = error
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      setError("Please fix the errors above")
      return
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/employees/add_employees.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (result.success) {
        setSuccess("Employee added successfully!")
        setTimeout(() => {
          onClose()
          refreshEmployees() // Refresh employee list in parent component
        }, 1500)
      } else {
        setError(result.message || "Failed to add employee.")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

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
      {/* Header */}
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
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Add New Employee
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Success/Error Messages */}
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
        {/* Form Fields */}
        <Grid container spacing={3}>
          {/* Employee ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Employee ID"
              name="EmpId"
              fullWidth
              value={form.EmpId}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.EmpId)}
              helperText={fieldErrors.EmpId || "Enter a unique employee ID"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>
          {/* Employee Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Employee Name"
              name="Name"
              fullWidth
              value={form.Name}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.Name)}
              helperText={fieldErrors.Name || "Enter full name"}
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
          {/* Email */}
          <Grid item xs={12}>
            <TextField
              required
              type="email"
              label="Employee Email"
              name="Mail"
              fullWidth
              value={form.Mail}
              onChange={handleInputChange}
              error={Boolean(fieldErrors.Mail)}
              helperText={fieldErrors.Mail || "Enter a valid email address"}
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
          {/* Office Code */}
          <Grid item xs={12}>
            <Autocomplete
              value={form.OfficeCode}
              onChange={handleOfficeCodeChange}
              options={officeData.map((office) => `${office.OfficeCode} - ${office.OfficeName}`)}
              loading={officeLoading}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Office Code"
                  error={Boolean(fieldErrors.OfficeCode)}
                  helperText={fieldErrors.OfficeCode || "Select or enter office code"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {officeLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Chip label={option.split(" - ")[0]} size="small" sx={{ mr: 1 }} />
                  {option}
                </Box>
              )}
              getOptionLabel={(option) => {
                // For freeSolo, option might be just the code
                if (typeof option === "string" && option.includes(" - ")) {
                  return option
                }
                // Find the matching office to display name
                const office = officeData.find((o) => o.OfficeCode === option)
                return office ? `${office.OfficeCode} - ${office.OfficeName}` : option
              }}
              filterOptions={(options, state) => {
                // Search both code and name
                const inputValue = state.inputValue.toLowerCase()
                return options.filter((option) => option.toLowerCase().includes(inputValue))
              }}
              freeSolo
              disableClearable
            />
          </Grid>
        </Grid>
        {/* Form Info */}
        <Box mt={3}>
          <Divider />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> All fields marked with * are required. The employee will be notified via email once
            the account is created.
          </Typography>
        </Box>
      </DialogContent>
      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || Object.keys(fieldErrors).some((key) => fieldErrors[key])}
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            minWidth: 120,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          }}
        >
          {loading ? "Saving..." : "Save Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddEmployeeDialog
