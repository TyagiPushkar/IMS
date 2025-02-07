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

const TransferItemDialog = ({ open, onClose, refreshTransfer }) => {
  const [form, setForm] = useState({
    FromOfficeID: "", // This will be set from localStorage user object
    ToOfficeID: "",   // Selected from offices autocomplete
    EmpId:"",
    ModeOfTransfer: "",
    CourierName: "",
    DocketNumber: "",
    CourierDate: new Date().toISOString().split("T")[0],
    items: [{ Item: "", Quantity: "" }], // Dynamic items array
  });

  const [officesList, setOfficesList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On mount, set the FromOfficeID from local storage and fetch offices and items
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.OfficeId) {
      setForm(prev => ({ ...prev, FromOfficeID: user.OfficeId }));
    }
    fetchOffices();
    fetchItems();
  }, []);

  // Fetch Offices for the autocomplete (using the provided API URL)
  const fetchOffices = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php");
      const result = await response.json();
      if (result.success) {
        setOfficesList(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch offices.", err);
    }
  };

  // Fetch Items for the autocomplete
  const fetchItems = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/get_item.php");
      const result = await response.json();
      if (result.success) {
        setItemsList(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch items.", err);
    }
  };

  // Handle change for dynamic items
  const handleItemChange = (index, key, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][key] = value;
    setForm({ ...form, items: updatedItems });
  };

  // Add a new row for items
  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { Item: "", Quantity: "" }] });
  };

  // Remove a row from items array
  const removeItemRow = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updatedItems });
  };

  const handleSave = async () => {
  if (
    !form.FromOfficeID ||
    !form.ToOfficeID ||
    !form.ModeOfTransfer ||
     // If CourierName is optional, remove this check
     // If DocketNumber is optional, remove this check
    form.items.length === 0 ||
    form.items.some(item => !item.Item || !item.Quantity)
  ) {
    setError("All fields are required");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Constructing the JSON in the required format
    const payload = {
      FromOfficeID: form.FromOfficeID,
      ToOfficeID: form.ToOfficeID,
      ModeOfTransfer: form.ModeOfTransfer,
      EmpId: form.EmpId, // Fetch EmpId from localStorage
      Item: form.items.map(item => item.Item), // Extracting only Item names
      Quantity: form.items.map(item => Number(item.Quantity)), // Extracting only Quantity as numbers
    };

    const response = await fetch(
      "https://namami-infotech.com/SatyaMicro/src/transfer/stock_transfer.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensuring JSON format
        },
        body: JSON.stringify(payload), // Convert payload to JSON string
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Transfer recorded successfully!");
      onClose();
      refreshTransfer();
    } else {
      setError(result.message || "Failed to record transfer");
    }
  } catch (err) {
    setError("An error occurred while processing the transfer");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Transfer Item</DialogTitle>
      <DialogContent>
        {/* Display From Office (read-only) */}
        <TextField
          label="From Office ID"
          value={form.FromOfficeID}
          fullWidth
          margin="normal"
          disabled
        />

        {/* To Office Autocomplete */}
        <Autocomplete
          options={officesList}
          getOptionLabel={(option) => option.OfficeName}
          onChange={(e, newValue) => {
            // Save the selected Office ID into form state
            setForm({ ...form, ToOfficeID: newValue ? newValue.ID : "" });
          }}
          renderInput={(params) => <TextField {...params} label="To Office" margin="normal" fullWidth />}
        />

        {/* Mode Of Transfer */}
        <TextField
          label="Mode Of Transfer"
          value={form.ModeOfTransfer}
          onChange={(e) => setForm({ ...form, ModeOfTransfer: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Courier Name */}
        <TextField
          label="Courier Name"
          value={form.CourierName}
          onChange={(e) => setForm({ ...form, CourierName: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Docket Number */}
        <TextField
          label="Docket Number"
          value={form.DocketNumber}
          onChange={(e) => setForm({ ...form, DocketNumber: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Courier Date */}
        <TextField
          label="Courier Date"
          type="date"
          value={form.CourierDate}
          onChange={(e) => setForm({ ...form, CourierDate: e.target.value })}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        {/* Dynamic Items List */}
        {form.items.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <Autocomplete
              options={itemsList}
              getOptionLabel={(option) => option.Name}
              onChange={(e, newValue) =>
                handleItemChange(index, "Item", newValue ? newValue.ID : "")
              }
              renderInput={(params) => <TextField {...params} label="Item" fullWidth />}
              fullWidth
              value={
                // Find the item object by matching the ID stored in form.items[index].Item
                itemsList.find(itemObj => itemObj.ID === item.Item) || null
              }
              freeSolo={false}
            />
            <TextField
              label="Quantity"
              type="number"
              value={item.Quantity}
              onChange={(e) => handleItemChange(index, "Quantity", e.target.value)}
              fullWidth
            />
            {form.items.length > 1 && (
              <IconButton onClick={() => removeItemRow(index)} color="error">
                <RemoveCircle />
              </IconButton>
            )}
          </div>
        ))}
        <Button onClick={addItemRow} startIcon={<AddCircle />} color="primary">
          Add More
        </Button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Processing..." : "Transfer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferItemDialog;
