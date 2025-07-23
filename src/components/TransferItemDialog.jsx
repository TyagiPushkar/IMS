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
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material"
import {
  AddCircle,
  RemoveCircle,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  CalendarToday as CalendarTodayIcon,
  Numbers as NumbersIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

const TransferItemDialog = ({ open, onClose, refreshTransfer }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    FromOfficeID: "", // This will be set from localStorage user object
    ToOfficeID: "", // Selected from offices autocomplete
    EmpId: "", // Employee ID from localStorage
    ModeOfTransfer: "",
    CourierName: "",
    DocketNumber: "",
    CourierDate: new Date().toISOString().split("T")[0],
    items: [{ Item: "", Quantity: "" }], // Dynamic items array (Item will store ID)
  })
  const [officesList, setOfficesList] = useState([])
  const [itemsList, setItemsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [officeLoading, setOfficeLoading] = useState(false)
  const [itemLoading, setItemLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Validation rules
  const validateField = (name, value) => {
    if (!value) return "This field is required"
    return ""
  }

  // On mount or when dialog opens, set the FromOfficeID and EmpId from local storage and fetch offices and items
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setForm((prev) => ({
        ...prev,
        FromOfficeID: user.OfficeId,
        EmpId: user.EmpId, // Assuming EmpId is available in the user object
      }))
    }

    if (open) {
      fetchOffices()
      fetchItems()
      // Reset form and errors when dialog opens
      setForm((prev) => ({
        ...prev,
        ToOfficeID: "",
        ModeOfTransfer: "",
        CourierName: "",
        DocketNumber: "",
        CourierDate: new Date().toISOString().split("T")[0],
        items: [{ Item: "", Quantity: "" }],
      }))
      setError("")
      setFieldErrors({})
    }
  }, [open])

  // Fetch Offices for the autocomplete (using POST with session validation)
  const fetchOffices = async () => {
    setOfficeLoading(true)
    setError("")
    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required to fetch office data. Please log in.")
      setOfficeLoading(false)
      navigate("/login")
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php", {
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
        setOfficesList(result.data)
      } else {
        setError(result.message || "Failed to load office data.")
      }
    } catch (err) {
      console.error("Failed to fetch offices:", err)
      setError("An error occurred while fetching office data.")
    } finally {
      setOfficeLoading(false)
    }
  }

  // Fetch Items for the autocomplete (using POST with session validation)
  const fetchItems = async () => {
    setItemLoading(true)
    setError("")
    const userObject = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!userObject || !sessionToken || !userObject.OfficeId) {
      setError("Authentication required to fetch item data. Please log in.")
      setItemLoading(false)
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
        setItemsList(result.data)
      } else {
        setError(result.message || "Failed to load item data.")
      }
    } catch (err) {
      console.error("Failed to fetch items:", err)
      setError("An error occurred while fetching item data.")
    } finally {
      setItemLoading(false)
    }
  }

  // Handle change for dynamic items
  const handleItemChange = (index, key, value) => {
    const updatedItems = [...form.items]
    updatedItems[index][key] = value
    setForm({ ...form, items: updatedItems })
    // Clear field error when user types
    if (fieldErrors[`item-${index}-${key}`]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[`item-${index}-${key}`]
      setFieldErrors(newErrors)
    }
  }

  // Add a new row for items
  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { Item: "", Quantity: "" }] })
  }

  // Remove a row from items array
  const removeItemRow = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index)
    setForm({ ...form, items: updatedItems })
  }

  // Handle mode of transfer change
  const handleModeChange = (e) => {
    const mode = e.target.value
    setForm({
      ...form,
      ModeOfTransfer: mode,
      // Clear courier fields when switching to "By Hand"
      ...(mode === "By Hand" && {
        CourierName: "",
        DocketNumber: "",
        CourierDate: new Date().toISOString().split("T")[0],
      }),
    })
  }

  const handleSave = async () => {
    const errors = {}

    // Validate main fields
    if (!form.ToOfficeID) errors.ToOfficeID = "To Office is required"
    if (!form.ModeOfTransfer) errors.ModeOfTransfer = "Mode of Transfer is required"

    // Validate items
    form.items.forEach((item, index) => {
      if (!item.Item) errors[`item-${index}-Item`] = "Item is required"
      if (!item.Quantity) errors[`item-${index}-Quantity`] = "Quantity is required"
    })

    // Additional validation for courier fields if mode is "By Courier"
    if (form.ModeOfTransfer === "By Courier") {
      if (!form.CourierName) errors.CourierName = "Courier Name is required"
      if (!form.DocketNumber) errors.DocketNumber = "Docket Number is required"
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors above.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Constructing the JSON in the required format
      const payload = {
        FromOfficeID: form.FromOfficeID,
        ToOfficeID: form.ToOfficeID,
        ModeOfTransfer: form.ModeOfTransfer,
        EmpId: form.EmpId,
        Item: form.items.map((item) => item.Item), // This will now be an array of Item IDs
        Quantity: form.items.map((item) => Number(item.Quantity)),
        ...(form.ModeOfTransfer === "By Courier" && {
          CourierName: form.CourierName,
          DocketNumber: form.DocketNumber,
          CourierDate: form.CourierDate,
        }),
      }

      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/transfer/stock_transfer.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      if (result.success) {
        alert("Transfer recorded successfully!")
        onClose()
        refreshTransfer()
      } else {
        setError(result.message || "Failed to record transfer")
      }
    } catch (err) {
      setError("An error occurred while processing the transfer")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Transfer Item</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {/* Display From Office (read-only) */}
        <TextField
          label="From Office ID"
          value={form.FromOfficeID}
          fullWidth
          margin="normal"
          disabled
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        {/* To Office Autocomplete */}
        <Autocomplete
          options={officesList}
          getOptionLabel={(option) => option.OfficeName || ""}
          isOptionEqualToValue={(option, value) => option.ID === value.ID}
          value={officesList.find((office) => office.ID === form.ToOfficeID) || null}
          onChange={(e, newValue) => {
            setForm({ ...form, ToOfficeID: newValue ? newValue.ID : "" })
            setFieldErrors((prev) => ({ ...prev, ToOfficeID: "" }))
          }}
          loading={officeLoading}
          disabled={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="To Office"
              margin="normal"
              fullWidth
              required
              error={Boolean(fieldErrors.ToOfficeID)}
              helperText={fieldErrors.ToOfficeID}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {officeLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {/* Employee ID (read-only) */}
        {/* <TextField
          label="Employee ID"
          value={form.EmpId}
          fullWidth
          margin="normal"
          disabled
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        /> */}
        {/* Mode Of Transfer - now a select field */}
        <TextField
          select
          label="Mode Of Transfer"
          value={form.ModeOfTransfer}
          onChange={handleModeChange}
          fullWidth
          margin="normal"
          required
          error={Boolean(fieldErrors.ModeOfTransfer)}
          helperText={fieldErrors.ModeOfTransfer}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalShippingIcon color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="By Courier">By Courier</MenuItem>
          <MenuItem value="By Hand">By Hand</MenuItem>
        </TextField>
        {/* Show courier fields only when mode is "By Courier" */}
        {form.ModeOfTransfer === "By Courier" && (
          <>
            <TextField
              label="Courier Name"
              value={form.CourierName}
              onChange={(e) => {
                setForm({ ...form, CourierName: e.target.value })
                setFieldErrors((prev) => ({ ...prev, CourierName: "" }))
              }}
              fullWidth
              margin="normal"
              required
              error={Boolean(fieldErrors.CourierName)}
              helperText={fieldErrors.CourierName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Docket Number"
              value={form.DocketNumber}
              onChange={(e) => {
                setForm({ ...form, DocketNumber: e.target.value })
                setFieldErrors((prev) => ({ ...prev, DocketNumber: "" }))
              }}
              fullWidth
              margin="normal"
              required
              error={Boolean(fieldErrors.DocketNumber)}
              helperText={fieldErrors.DocketNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Courier Date"
              type="date"
              value={form.CourierDate}
              onChange={(e) => setForm({ ...form, CourierDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}
        {/* Dynamic Items List */}
        {form.items.map((item, index) => (
          <Box key={index} sx={{ display: "flex", gap: "10px", alignItems: "center", mb: "10px" }}>
            <Autocomplete
              options={itemsList}
              getOptionLabel={(option) => option.Name || ""}
              isOptionEqualToValue={(option, value) => option.ID === value.ID}
              onChange={(e, newValue) => handleItemChange(index, "Item", newValue ? newValue.ID : "")} // Store ID
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Item"
                  fullWidth
                  required
                  error={Boolean(fieldErrors[`item-${index}-Item`])}
                  helperText={fieldErrors[`item-${index}-Item`]}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <InventoryIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {itemLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              fullWidth
              value={itemsList.find((itemObj) => itemObj.ID === item.Item) || null} // Display Name based on stored ID
              freeSolo={false}
              disabled={loading}
            />
            <TextField
              label="Quantity"
              type="number"
              value={item.Quantity}
              onChange={(e) => {
                handleItemChange(index, "Quantity", e.target.value)
                setFieldErrors((prev) => ({ ...prev, [`item-${index}-Quantity`]: "" }))
              }}
              fullWidth
              required
              error={Boolean(fieldErrors[`item-${index}-Quantity`])}
              helperText={fieldErrors[`item-${index}-Quantity`]}
              disabled={loading}
            />
            {form.items.length > 1 && (
              <IconButton onClick={() => removeItemRow(index)} color="error" disabled={loading}>
                <RemoveCircle />
              </IconButton>
            )}
          </Box>
        ))}
        <Button onClick={addItemRow} startIcon={<AddCircle />} color="primary" disabled={loading}>
          Add More
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Transfer"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransferItemDialog
