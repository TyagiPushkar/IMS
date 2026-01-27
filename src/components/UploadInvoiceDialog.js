// components/UploadInvoiceDialog.jsx
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
} from "@mui/material"
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material"

const UploadInvoiceDialog = ({ open, onClose, purchase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState(purchase?.InvoiceNumber || "")
  const [invoiceFile, setInvoiceFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, GIF, WebP, and PDF files are allowed")
        return
      }
      
      setInvoiceFile(file)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!invoiceNumber.trim()) {
      setError("Invoice number is required")
      return
    }
    
    if (!invoiceFile) {
      setError("Invoice file is required")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("PurchaseId", purchase.id)
      formData.append("InvoiceNumber", invoiceNumber.trim())
      formData.append("Invoice", invoiceFile)

      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/purchase/upload_invoice.php", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess("Invoice uploaded successfully!")
        setTimeout(() => {
          if (onSuccess) onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(result.message || "Failed to upload invoice")
      }
    } catch (err) {
      setError("An error occurred while uploading invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setInvoiceFile(null)
      setInvoiceNumber(purchase?.InvoiceNumber || "")
      setError("")
      setSuccess("")
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center">
          <CloudUploadIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Upload Invoice
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Purchase: <strong>{purchase?.VendorName}</strong> ({purchase?.OfficeName})
        </Typography>
        
        <Box mt={2}>
          <TextField
            required
            fullWidth
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            error={Boolean(error && !invoiceNumber.trim())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptIcon color="action" />
                </InputAdornment>
              ),
            }}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              border: "1px dashed rgba(0, 0, 0, 0.12)",
              borderRadius: 1,
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            }}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              onChange={handleFileChange}
              id="invoice-upload"
              style={{ display: "none" }}
              disabled={loading}
            />
            <label htmlFor="invoice-upload">
              <Button 
                variant="outlined" 
                component="span" 
                startIcon={<AttachFileIcon />} 
                disabled={loading}
                sx={{ mb: 1 }}
              >
                Select Invoice File
              </Button>
            </label>
            
            {invoiceFile && (
              <Chip 
                label={invoiceFile.name} 
                onDelete={() => setInvoiceFile(null)} 
                color="success"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Max file size: 5MB. Allowed formats: JPG, PNG, GIF, WebP, PDF
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={loading || !invoiceNumber.trim() || !invoiceFile}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          sx={{
            background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #43a047 0%, #1b5e20 100%)",
            },
          }}
        >
          {loading ? "Uploading..." : "Upload Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadInvoiceDialog