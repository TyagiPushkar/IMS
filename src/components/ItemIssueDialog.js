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

const IssueItemDialog = ({ open, onClose }) => {
  const [form, setForm] = useState({ EmpId: "", Name: "", OfficeID: "", OfficeCode: "", Items: [{ Item: "", Quantity: "" }] });
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm((prev) => ({ ...prev, OfficeID: user.OfficeId, OfficeCode: user.OfficeCode }));
    }
    fetchEmployees();
    fetchItems();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php");
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees.");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/get_item.php");
      const result = await response.json();
      if (result.success) {
        setItems(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch items.");
    }
  };

  const handleAddMore = () => {
    setForm((prev) => ({
      ...prev,
      Items: [...prev.Items, { Item: "", Quantity: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      Items: prev.Items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.EmpId || !form.Name || form.Items.some((i) => !i.Item || !i.Quantity)) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");

    const selectedEmployee = employees.find(emp => emp.EmpId === form.EmpId);
    const payload = {
      ...form,
      OfficeID: form.OfficeID || selectedEmployee?.OfficeID,
      OfficeCode: form.OfficeCode || selectedEmployee?.OfficeCode,
    };

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/issue/issue_item.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        alert("Items issued successfully");
        onClose();
      } else {
        setError(result.message || "Failed to issue items");
      }
    } catch (err) {
      setError("An error occurred while issuing the items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Issue Item</DialogTitle>
      <DialogContent>
        <Autocomplete
          value={form.EmpId}
          onChange={(e, newValue) => {
            const selectedEmp = employees.find(emp => emp.EmpId === newValue);
            setForm({ ...form, EmpId: newValue, Name: selectedEmp?.Name || "" });
          }}
          options={employees.map((emp) => emp.EmpId)}
          renderInput={(params) => <TextField {...params} label="Employee ID" fullWidth margin="normal" />}
        />

        <Autocomplete
          value={form.Name}
          onChange={(e, newValue) => {
            const selectedEmp = employees.find(emp => emp.Name === newValue);
            setForm({ ...form, Name: newValue, EmpId: selectedEmp?.EmpId || "" });
          }}
          options={employees.map((emp) => emp.Name)}
          renderInput={(params) => <TextField {...params} label="Employee Name" fullWidth margin="normal" />}
        />

        {form.Items.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <Autocomplete
              value={item.Item}
              onChange={(e, newValue) => {
                const updatedItems = [...form.Items];
                updatedItems[index].Item = newValue;
                setForm({ ...form, Items: updatedItems });
              }}
              options={items.map((item) => item.Name)}
              renderInput={(params) => <TextField {...params} label="Item Name" fullWidth />}
              freeSolo
              disableClearable
              fullWidth
            />

            <TextField
              label="Quantity"
              type="number"
              value={item.Quantity}
              onChange={(e) => {
                const updatedItems = [...form.Items];
                updatedItems[index].Quantity = e.target.value;
                setForm({ ...form, Items: updatedItems });
              }}
              
            />

            {form.Items.length > 1 && (
              <IconButton onClick={() => handleRemoveItem(index)} color="error">
                <RemoveCircle />
              </IconButton>
            )}
          </div>
        ))}

        <Button onClick={handleAddMore} color="primary" startIcon={<AddCircle />}>
          Add More
        </Button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Processing..." : "Issue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueItemDialog;
