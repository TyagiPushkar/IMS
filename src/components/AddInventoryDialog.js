import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";

const AddInventoryDialog = ({ open, onClose }) => {
  const handleSave = () => {
    // Handle saving the new inventory data here
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Inventory</DialogTitle>
      <DialogContent>
        <TextField label="Item Name" fullWidth margin="normal" />
        <TextField label="Quantity" type="number" fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInventoryDialog;
