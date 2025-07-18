import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography,
  IconButton
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

const AddItemDialog = ({ open, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Sample categories - replace with your actual categories or fetch from API
  const categories = [
    "Electronics",
    "Furniture",
    "Stationery",
    "Tools",
    "Consumables",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const validValue = value.replace(/[^a-zA-Z0-9. ]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: validValue
    }));
  };

  const handleSave = async () => {
    if (!formData.itemName.trim()) {
      setError("Item Name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const userObject = JSON.parse(localStorage.getItem("user"));
      const officeId = userObject?.OfficeId;

      if (!officeId) {
        throw new Error("Office ID not found");
      }

      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/item/add_item.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            Name: formData.itemName,
            Category: formData.category,
            OfficeId: officeId
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setFormData({ itemName: "", category: "" });
        refreshData(); // Refresh the parent component's data
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.message || "Failed to add item");
      }
    } catch (err) {
      setError(err.message || "An error occurred while adding the item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ itemName: "", category: "" });
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add New Inventory Item
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Item added successfully!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
         
         <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
            disabled={loading}
          >
            <MenuItem value="">
              <em>Select a category</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Item Name"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          required
          disabled={loading}
        />

        
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {loading ? "Adding..." : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;