import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Autocomplete } from "@mui/material";

const AddInventoryDialog = ({ open, onClose }) => {
  const [form, setForm] = useState({
    Item: "",
    Quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);  // Store items from API

  // Fetch items from API
  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/get_item.php");
      const result = await response.json();
      if (result.success) {
        setItems(result.data);  // Set items if fetch is successful
      } else {
        setError(result.message || "Failed to fetch items.");
      }
    } catch (err) {
      setError("An error occurred while fetching items.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError("");

    // Check if Item is selected
    if (!form.Item) {
      setError("Please select an item.");
      setLoading(false);
      return;
    }

    // Get OfficeId from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.OfficeId) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    const requestData = {
      OfficeId: user.OfficeId,
      Item: form.Item,
      Quantity: form.Quantity,
    };

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/stock/add_stock.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Stock added successfully!");
        setForm({ Item: "", Quantity: "" }); // Clear form after success
        onClose();
      } else {
        setError(result.message || "Failed to add stock.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Inventory</DialogTitle>
      <DialogContent>
        {/* Autocomplete for Item with search functionality */}
        <Autocomplete
          value={form.Item}
          onChange={(e, newValue) => setForm({ ...form, Item: newValue })}
          options={items.map((item) => item.Name)}  // Map item names from the fetched items
          renderInput={(params) => <TextField {...params} label="Item Name" fullWidth margin="normal" />}
          getOptionLabel={(option) => option}  // Ensure the dropdown displays the item name
          freeSolo
          disableClearable
        />

        {/* Quantity Input */}
        <TextField
          label="Quantity"
          name="Quantity"
          type="number"
          fullWidth
          margin="normal"
          value={form.Quantity}
          onChange={handleInputChange}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInventoryDialog;
