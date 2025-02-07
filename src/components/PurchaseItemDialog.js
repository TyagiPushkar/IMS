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
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";

const PurchaseItemDialog = ({ open, onClose, refreshPurchase }) => {
  const [form, setForm] = useState({
    VendorName: "",
    VendorAddress: "",
    InvoiceNumber: "",
    Invoice: null, // File
    Date: new Date().toISOString().split("T")[0],
    OfficeId: "",
    items: [{ Item: "", Quantity: "", Amount: "" }], // Dynamic items array
  });

  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleFileChange = (e) => {
    setForm({ ...form, Invoice: e.target.files[0] });
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][key] = value;
    setForm({ ...form, items: updatedItems });
  };

  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { Item: "", Quantity: "", Amount: "" }] });
  };

  const removeItemRow = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updatedItems });
  };

  const handleSave = async () => {
    if (!form.VendorName || !form.VendorAddress || !form.InvoiceNumber || !form.Invoice || form.items.length === 0) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

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
        alert("Purchase recorded successfully!");
          onClose();
          refreshPurchase()
      } else {
        setError(result.message || "Failed to record purchase");
      }
    } catch (err) {
      setError("An error occurred while processing the purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Purchase Item</DialogTitle>
      <DialogContent>
        {/* Vendor Details */}
        <TextField label="Vendor Name" value={form.VendorName} onChange={(e) => setForm({ ...form, VendorName: e.target.value })} fullWidth margin="normal" />
        <TextField label="Vendor Address" value={form.VendorAddress} onChange={(e) => setForm({ ...form, VendorAddress: e.target.value })} fullWidth margin="normal" />
        <TextField label="Invoice Number" value={form.InvoiceNumber} onChange={(e) => setForm({ ...form, InvoiceNumber: e.target.value })} fullWidth margin="normal" />
        <span>Invoice Image</span> &nbsp;
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: "16px", marginBottom: "16px" }} />
        <TextField label="Date" type="date" value={form.Date} onChange={(e) => setForm({ ...form, Date: e.target.value })} fullWidth margin="normal" />
        
        {/* Dynamic Items */}
        {form.items.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <Autocomplete value={item.Item} onChange={(e, newValue) => handleItemChange(index, "Item", newValue)} options={itemsList.map((item) => item.Name)} renderInput={(params) => <TextField {...params} label="Item Name" fullWidth />} freeSolo fullWidth />
            <TextField label="Quantity" type="number" value={item.Quantity} onChange={(e) => handleItemChange(index, "Quantity", e.target.value)} fullWidth />
            <TextField label="Amount" type="number" value={item.Amount} onChange={(e) => handleItemChange(index, "Amount", e.target.value)} fullWidth />
            {form.items.length > 1 && (
              <IconButton onClick={() => removeItemRow(index)} color="error"><RemoveCircle /></IconButton>
            )}
          </div>
        ))}
        <Button onClick={addItemRow} startIcon={<AddCircle />} color="primary">Add More</Button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>{loading ? "Processing..." : "Purchase"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseItemDialog;
