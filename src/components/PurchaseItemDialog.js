import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Box,
  Grid,
  Typography,
  Alert,
  Divider,
  Fade,
  CircularProgress,
  InputAdornment,
  Chip,
  Paper,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  CalendarToday as DateIcon,
  AttachFile as AttachFileIcon,
  Inventory as InventoryIcon,
  Numbers as NumbersIcon,
  Paid as PaidIcon,
} from "@mui/icons-material";

const PurchaseItemDialog = ({ open, onClose, refreshPurchase }) => {
  const [form, setForm] = useState({
    VendorName: "",
    VendorAddress: "",
    InvoiceNumber: "",
    Invoice: null,
    Date: new Date().toISOString().split("T")[0],
    OfficeId: "",
    items: [{ Item: "", Quantity: "", Amount: "" }],
  });

  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm((prev) => ({ ...prev, OfficeId: user.OfficeId }));
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/get_item.php");
      const result = await response.json();
      if (result.success) {
        setItemsList(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch items.");
    }
  };

  const validateField = (name, value) => {
    if (!value) return "This field is required";
    return "";
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate main form fields
    const mainFields = ["VendorName", "VendorAddress", "InvoiceNumber"];
    mainFields.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) errors[field] = error;
    });

    // Validate invoice file
    if (!form.Invoice) {
      errors.Invoice = "Invoice image is required";
    }

    // Validate items
    form.items.forEach((item, index) => {
      if (!item.Item) errors[`item-${index}-Item`] = "Item is required";
      if (!item.Quantity) errors[`item-${index}-Quantity`] = "Quantity is required";
      if (!item.Amount) errors[`item-${index}-Amount`] = "Amount is required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e) => {
    setForm({ ...form, Invoice: e.target.files[0] });
    if (fieldErrors.Invoice) {
      setFieldErrors({ ...fieldErrors, Invoice: "" });
    }
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][key] = value;
    setForm({ ...form, items: updatedItems });

    // Clear field error when user types
    if (fieldErrors[`item-${index}-${key}`]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[`item-${index}-${key}`];
      setFieldErrors(newErrors);
    }
  };

  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { Item: "", Quantity: "", Amount: "" }] });
  };

  const removeItemRow = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updatedItems });
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
      const formData = new FormData();
      formData.append("VendorName", form.VendorName);
      formData.append("VendorAddress", form.VendorAddress);
      formData.append("InvoiceNumber", form.InvoiceNumber);
      formData.append("Invoice", form.Invoice);
      formData.append("Date", form.Date);
      formData.append("OfficeId", form.OfficeId);
      
      form.items.forEach((item, index) => {
        formData.append(`Item[]`, item.Item);
        formData.append(`Quantity[]`, item.Quantity);
        formData.append(`Amount[]`, item.Amount);
      });

      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/purchase/purchase_item.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setSuccess("Purchase recorded successfully!");
        setTimeout(() => {
          onClose();
          refreshPurchase();
        }, 1500);
      } else {
        setError(result.message || "Failed to record purchase");
      }
    } catch (err) {
      setError("An error occurred while processing the purchase");
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
            Record New Purchase
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
          {/* Vendor Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Vendor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              label="Vendor Name"
              value={form.VendorName}
              onChange={(e) => setForm({ ...form, VendorName: e.target.value })}
              fullWidth
              error={Boolean(fieldErrors.VendorName)}
              helperText={fieldErrors.VendorName}
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

          <Grid item xs={12} md={6}>
            <TextField
              required
              label="Vendor Address"
              value={form.VendorAddress}
              onChange={(e) => setForm({ ...form, VendorAddress: e.target.value })}
              fullWidth
              error={Boolean(fieldErrors.VendorAddress)}
              helperText={fieldErrors.VendorAddress}
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

          {/* Invoice Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Invoice Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              label="Invoice Number"
              value={form.InvoiceNumber}
              onChange={(e) => setForm({ ...form, InvoiceNumber: e.target.value })}
              fullWidth
              error={Boolean(fieldErrors.InvoiceNumber)}
              helperText={fieldErrors.InvoiceNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              label="Date"
              type="date"
              value={form.Date}
              onChange={(e) => setForm({ ...form, Date: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                border: fieldErrors.Invoice ? '1px solid red' : '1px dashed rgba(0, 0, 0, 0.12)',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="invoice-upload"
                style={{ display: 'none' }}
                disabled={loading}
              />
              <label htmlFor="invoice-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  disabled={loading}
                >
                  Upload Invoice Image
                </Button>
              </label>
              {form.Invoice && (
                <Chip
                  label={form.Invoice.name}
                  onDelete={() => setForm({ ...form, Invoice: null })}
                  sx={{ mt: 1 }}
                />
              )}
              {fieldErrors.Invoice && (
                <Typography variant="caption" color="error" display="block">
                  {fieldErrors.Invoice}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Purchase Items */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Purchase Items
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {form.items.map((item, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        value={item.Item}
                        onChange={(e, newValue) => handleItemChange(index, "Item", newValue)}
                        options={itemsList.map((item) => item.Name)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Item Name"
                            required
                            error={Boolean(fieldErrors[`item-${index}-Item`])}
                            helperText={fieldErrors[`item-${index}-Item`]}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InventoryIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        freeSolo
                        fullWidth
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.Quantity}
                        onChange={(e) => handleItemChange(index, "Quantity", e.target.value)}
                        fullWidth
                        required
                        error={Boolean(fieldErrors[`item-${index}-Quantity`])}
                        helperText={fieldErrors[`item-${index}-Quantity`]}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NumbersIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Amount"
                        type="number"
                        value={item.Amount}
                        onChange={(e) => handleItemChange(index, "Amount", e.target.value)}
                        fullWidth
                        required
                        error={Boolean(fieldErrors[`item-${index}-Amount`])}
                        helperText={fieldErrors[`item-${index}-Amount`]}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaidIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={1} sx={{ textAlign: 'center' }}>
                      {form.items.length > 1 && (
                        <IconButton 
                          onClick={() => removeItemRow(index)} 
                          color="error"
                          disabled={loading}
                        >
                          <RemoveCircleIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12}>
            <Button
              onClick={addItemRow}
              startIcon={<AddCircleIcon />}
              color="primary"
              variant="outlined"
              disabled={loading}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
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
          {loading ? "Processing..." : "Record Purchase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseItemDialog;