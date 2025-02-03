import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";

const AddItemDialog = ({ open, onClose }) => {
  const [itemName, setItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!itemName.trim()) {
      setError("Item Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/add_item.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Name: itemName }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Item added successfully");
        onClose();
      } else {
        setError(result.message || "Failed to add item");
      }
    } catch (err) {
      setError("An error occurred while adding the item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogContent>
        <TextField
          label="Item Name"
          fullWidth
          margin="normal"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          error={!!error}
          helperText={error}
        />
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

export default AddItemDialog;
