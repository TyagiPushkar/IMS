import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const AddOfficeDialog = ({ open, onClose,refreshOffice }) => {
  const [form, setForm] = useState({
    OfficeCode: "",
    OfficeName: "",
    OfficeAddress: "",
    AdminName: "",
    AdminMail: "",
    AdminPhone: "",
    Password: "",
    Role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError("");

    // Validate if all fields are filled
    const requiredFields = [
      "OfficeCode",
      "OfficeName",
      "OfficeAddress",
      "AdminName",
      "AdminMail",
      "AdminPhone",
      "Password",
      "Role",
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill in the ${field}`);
        setLoading(false);
        return;
      }
    }

    const requestData = { ...form };

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/add_offices.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Office added successfully!");
        setForm({
          OfficeCode: "",
          OfficeName: "",
          OfficeAddress: "",
          AdminName: "",
          AdminMail: "",
          AdminPhone: "",
          Password: "",
          Role: "",
        }); // Clear form after success
          onClose();
          refreshOffice()
      } else {
        setError(result.message || "Failed to add office.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Office</DialogTitle>
      <DialogContent>
        <TextField
          required
          label="Office Code"
          name="OfficeCode"
          fullWidth
          margin="normal"
          value={form.OfficeCode}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Office Name"
          name="OfficeName"
          fullWidth
          margin="normal"
          value={form.OfficeName}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Office Address"
          name="OfficeAddress"
          fullWidth
          margin="normal"
          value={form.OfficeAddress}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Admin Name"
          name="AdminName"
          fullWidth
          margin="normal"
          value={form.AdminName}
          onChange={handleInputChange}
        />
        <TextField
          required
          type="email"
          label="Admin Email"
          name="AdminMail"
          fullWidth
          margin="normal"
          value={form.AdminMail}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Admin Phone"
          name="AdminPhone"
          type="number"
          fullWidth
          margin="normal"
          value={form.AdminPhone}
          onChange={handleInputChange}
        />
        <TextField
          required
          label="Password"
          name="Password"
          type="password"
          fullWidth
          margin="normal"
          value={form.Password}
          onChange={handleInputChange}
        />
        
        {/* Role dropdown (Admin, SuperAdmin) */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            name="Role"
            value={form.Role}
            onChange={handleInputChange}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="SuperAdmin">Super Admin</MenuItem>
          </Select>
        </FormControl>

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

export default AddOfficeDialog;
