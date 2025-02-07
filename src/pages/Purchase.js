import React, { useState, useEffect } from "react";
import { IconButton, TextField, Box, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import PurchaseItemDialog from "../components/PurchaseItemDialog";
import CategoryIcon from '@mui/icons-material/Category';
function Purchase() {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
     const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);

  const userObject = JSON.parse(localStorage.getItem("user"));
  const officeId = userObject?.OfficeId;

  const fetchPurchaseData = async () => {
  try {
    const response = await fetch(
      `https://namami-infotech.com/SatyaMicro/src/purchase/get_purchase.php?OfficeID=${officeId}`
    );
    const result = await response.json();
    console.log(result); // Log the entire result

    if (result.success) {
      const groupedData = result.data.reduce((acc, item) => {
        const { InvoiceNumber, VendorName, VendorAddress, Invoice, Date, Items } = item;

        // Handle cases where InvoiceNumber is null
        const invoiceNumber = InvoiceNumber || "Unknown Invoice";  // Fallback for null InvoiceNumber

        if (!acc[invoiceNumber]) {
          acc[invoiceNumber] = {
            InvoiceNumber: invoiceNumber,
            VendorName: VendorName,
            VendorAddress: VendorAddress,
            Invoice: Invoice,
            Date: Date,
            Items: [],
          };
        }

        // Add items safely by checking if they exist
        Items.forEach(i => {
          acc[invoiceNumber].Items.push({
            Item: i.Item || "No Item",  // Fallback if Item is missing
            Quantity: i.Quantity || 0,  // Default to 0 if Quantity is missing
            Amount: i.Amount || 0,  // Default to 0 if Amount is missing
          });
        });

        return acc;
      }, {});

      setPurchaseData(Object.values(groupedData));
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError("Failed to fetch purchase data.");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    if (officeId) {
      fetchPurchaseData();
    } else {
      setError("OfficeId not found in localStorage.");
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

const handleRowClick = (invoice) => {
  console.log(invoice);  // Add this line to check what data is being passed
  setSelectedInvoice(invoice);
  setOpenDialog(true);
};


  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center" style={{ marginTop: "10px" }}>
      <div className="flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Purchase Items List</span>
        </div>
        <div className="bg-white rounded p-3">
          <div className="flex justify-between items-center mb-4">
            <Box display="flex" alignItems="center">
              <TextField
                label="Search"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ marginRight: "10px" }}
              />
              <IconButton color="primary">
                <SearchIcon />
              </IconButton>
                      </Box>
                       <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => setOpenAddEmployeeDialog(true)}
              >
                Purchase Item
              </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Invoice Number</th>
                  <th className="border p-2">Vendor Name</th>
                  <th className="border p-2">Vendor Address</th>
                  <th className="border p-2">Invoice</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-red-600">{error}</td>
                  </tr>
                ) : (
                  purchaseData.map((row, index) => (
                    <tr key={index} className="text-center border-t cursor-pointer">
                      <td className="border p-2" onClick={() => handleRowClick(row)}>{row.InvoiceNumber}</td>
                      <td className="border p-2" onClick={() => handleRowClick(row)}>{row.VendorName}</td>
                      <td className="border p-2" onClick={() => handleRowClick(row)}>{row.VendorAddress}</td>
                      <td className="border p-2">
                        <IconButton onClick={() => { setSelectedImage(row.Invoice); setOpenImageDialog(true); }} color="primary">
                          <ImageIcon />
                              </IconButton>
                              <IconButton  onClick={() => handleRowClick(row)} color="primary">
                          <CategoryIcon />
                        </IconButton>
                      </td>
                      <td className="border p-2">{row.Date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Invoice Items</DialogTitle>
  <DialogContent>
    {selectedInvoice ? (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedInvoice.Items && selectedInvoice.Items.length > 0 ? (
              selectedInvoice.Items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.Item}</TableCell>
                  <TableCell>{item.Quantity}</TableCell>
                  <TableCell>{item.Amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" className="text-center">No items available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <div>No invoice selected</div>
    )}
  </DialogContent>
</Dialog>

      {/* Image Modal */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
        <DialogContent>
          {selectedImage && (
            <img src={selectedImage} alt="Invoice" style={{ width: "100%", height: "auto" }} />
          )}
        </DialogContent>
          </Dialog>
          <PurchaseItemDialog
                      open={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
          />
    </div>
  );
}

export default Purchase;
