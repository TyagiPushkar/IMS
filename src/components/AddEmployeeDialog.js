import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Autocomplete } from "@mui/material";

const AddEmployeeDialog = ({ open, onClose }) => {
  const [form, setForm] = useState({
    EmpId: "",
    Name: "",
    Mail: "",
    OfficeCode: "", // Store selected OfficeCode
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [officeData, setOfficeData] = useState([]); // State for fetched office data

  // Fetch office data for dropdown
  const fetchOfficeData = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php");
      const result = await response.json();

      if (result.success) {
        setOfficeData(result.data); // Update office data state
      } else {
        setError(result.message); // Set error message if any
      }
    } catch (err) {
      setError("Failed to fetch office data.");
    }
  };

  useEffect(() => {
    // Fetch office data when the dialog opens
    if (open) {
      fetchOfficeData();
    }
  }, [open]);

  // Handle input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError("");

    // Validate if all fields are filled
    const requiredFields = ["EmpId", "Name", "Mail", "OfficeCode"];

    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill in the ${field}`);
        setLoading(false);
        return;
      }
    }

    const requestData = { ...form };

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/employees/add_employees.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Employee added successfully!");
        setForm({
          EmpId: "",
          Name: "",
          Mail: "",
          OfficeCode: "", // Reset OfficeCode
        }); // Clear form after success
        onClose();
      } else {
        setError(result.message || "Failed to add employee.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Employee</DialogTitle>
      <DialogContent>
        <TextField
          required
          label="Employee ID"
          name="EmpId"
          fullWidth
          margin="normal"
          value={form.EmpId}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Employee Name"
          name="Name"
          fullWidth
          margin="normal"
          value={form.Name}
          onChange={handleInputChange}
        />
        <TextField
          required
          type="email"
          label="Employee Email"
          name="Mail"
          fullWidth
          margin="normal"
          value={form.Mail}
          onChange={handleInputChange}
        />

        {/* Autocomplete for OfficeCode */}
        <Autocomplete
          value={form.OfficeCode}
          onChange={(e, newValue) => setForm({ ...form, OfficeCode: newValue })}
          options={officeData.map((office) => office.OfficeCode)} // Map office codes from the fetched data
          renderInput={(params) => <TextField {...params} label="Office Code" fullWidth margin="normal" />}
          getOptionLabel={(option) => option} // Ensure the dropdown displays the office code
          freeSolo
          disableClearable
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

export default AddEmployeeDialog;
