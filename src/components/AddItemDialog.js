import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";

const AddItemDialog = ({ open, onClose }) => {
  const handleSave = () => {
    // Handle saving the new item here
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogContent>
        <TextField label="Item Name" fullWidth margin="normal" />
        <TextField label="Quantity" type="number" fullWidth margin="normal" />
        <TextField label="Price" type="number" fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;
