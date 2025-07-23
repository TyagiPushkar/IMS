"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete,
  IconButton,
} from "@mui/material"
import { AddCircle, RemoveCircle } from "@mui/icons-material"
import { useNavigate } from "react-router-dom" // Import useNavigate

const IssueItemDialog = ({ open, onClose, refreshData }) => {
  const navigate = useNavigate() // Initialize useNavigate

  const [form, setForm] = useState({
    EmpId: "",
    Name: "",
    OfficeID: "",
    OfficeCode: "",
    Items: [{ Item: "", Quantity: "" }],
  })
  const [items, setItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setForm((prev) => ({ ...prev, OfficeID: user.OfficeId, OfficeCode: user.OfficeCode }))
    }
    // Fetch data only when the dialog is open
    if (open) {
      fetchEmployees()
      fetchItems()
      // Reset form when dialog opens
      setForm((prev) => ({
        ...prev,
        EmpId: "",
        Name: "",
        Items: [{ Item: "", Quantity: "" }],
      }))
      setError("")
    }
  }, [open]) // Depend on 'open' to trigger fetch and reset

  const fetchEmployees = async () => {
    setError("") // Clear previous errors
    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required to fetch employee data. Please log in.")
      navigate("/login")
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.OfficeId,
          sessionToken: sessionToken,
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        setEmployees(result.data)
      } else {
        setError(result.message || "Failed to fetch employees.")
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err)
      setError("An error occurred while fetching employees.")
    }
  }

  const fetchItems = async () => {
    setError("") // Clear previous errors
    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required to fetch item data. Please log in.")
      navigate("/login")
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/item/get_item.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.OfficeId,
          sessionToken: sessionToken,
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        setItems(result.data)
      } else {
        setError(result.message || "Failed to fetch items.")
      }
    } catch (err) {
      console.error("Failed to fetch items:", err)
      setError("An error occurred while fetching items.")
    }
  }

  const handleAddMore = () => {
    setForm((prev) => ({
      ...prev,
      Items: [...prev.Items, { Item: "", Quantity: "" }],
    }))
  }

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      Items: prev.Items.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.EmpId || !form.Name || form.Items.some((i) => !i.Item || !i.Quantity)) {
      setError("All fields are required")
      return
    }
    setLoading(true)
    setError("")

    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required. Please log in.")
      setLoading(false)
      navigate("/login")
      return
    }

    const selectedEmployee = employees.find((emp) => emp.EmpId === form.EmpId)
    const payload = {
      ...form,
      OfficeID: form.OfficeID || selectedEmployee?.OfficeID,
      OfficeCode: form.OfficeCode || selectedEmployee?.OfficeCode,
      userId: userObject.OfficeId, // For session validation on backend
      sessionToken: sessionToken, // For session validation on backend
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/issue/add_issue.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        alert("Items issued successfully")
        onClose()
        refreshData() // Call refreshData from parent
      } else {
        setError(result.message || "Failed to issue items")
      }
    } catch (err) {
      console.error("Issue item error:", err)
      setError("An error occurred while issuing the items")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Issue Item</DialogTitle>
      <DialogContent>
        <TextField label="Office ID" value={form.OfficeID} fullWidth margin="normal" disabled />
        <TextField label="Office Code" value={form.OfficeCode} fullWidth margin="normal" disabled />

        <Autocomplete
          value={form.EmpId}
          onChange={(e, newValue) => {
            const selectedEmp = employees.find((emp) => emp.EmpId === newValue)
            setForm({ ...form, EmpId: newValue, Name: selectedEmp?.Name || "" })
          }}
          options={employees.map((emp) => emp.EmpId)}
          renderInput={(params) => <TextField {...params} label="Employee ID" fullWidth margin="normal" />}
        />
        <Autocomplete
          value={form.Name}
          onChange={(e, newValue) => {
            const selectedEmp = employees.find((emp) => emp.Name === newValue)
            setForm({ ...form, Name: newValue, EmpId: selectedEmp?.EmpId || "" })
          }}
          options={employees.map((emp) => emp.Name)}
          renderInput={(params) => <TextField {...params} label="Employee Name" fullWidth margin="normal" />}
        />
        {form.Items.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <Autocomplete
              value={item.Item}
              onChange={(e, newValue) => {
                const updatedItems = [...form.Items]
                updatedItems[index].Item = newValue
                setForm({ ...form, Items: updatedItems })
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
                const updatedItems = [...form.Items]
                updatedItems[index].Quantity = e.target.value
                setForm({ ...form, Items: updatedItems })
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Processing..." : "Issue"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IssueItemDialog
