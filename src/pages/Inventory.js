import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import AddItemDialog from "../components/AddItemDialog"; // Import Add Item Dialog
import AddInventoryDialog from "../components/AddInventoryDialog"; // Import Add Inventory Dialog
import SearchIcon from "@mui/icons-material/Search"; // Search icon
import { IconButton, TextField, Box } from "@mui/material";
import UploadImage from "../components/UploadImage";

ChartJS.register(ArcElement, Tooltip, Legend);

function Inventory() {
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openAddInventoryDialog, setOpenAddInventoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState([]); // State for inventory data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(""); // State for any error message

  useEffect(() => {
    // Get OfficeId from localStorage (userObject)
    const userObject = JSON.parse(localStorage.getItem("user"));
    const officeId = userObject?.OfficeId;

    if (officeId) {
      // Fetch inventory data based on OfficeId
      const fetchInventoryData = async () => {
        try {
          const response = await fetch(
            `https://namami-infotech.com/SatyaMicro/src/stock/get_stock.php?OfficeId=${officeId}`
          );
          const result = await response.json();

          if (result.success) {
            setInventoryData(result.data); // Update inventory data state
          } else {
            setError(result.message); // Set error message if any
          }
        } catch (err) {
          setError("Failed to fetch inventory data.");
        } finally {
          setLoading(false); // Stop loading when the request is done
        }
      };

      fetchInventoryData();
    } else {
      setError("OfficeId not found in localStorage.");
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center" style={{ marginTop: "10px" }}>
      <div className="flex flex-col gap-5 w-11/12">
      
         <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Stock In Office</span>
          
        </div>
        {/* Inventory Table with Buttons */}
        <div className="bg-white rounded p-3">
          <div className="flex justify-between items-center mb-4">
            {/* Search Input */}
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

            {/* Buttons: Add Item & Add Inventory */}
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={() => setOpenAddItemDialog(true)}
              >
                Add Item
              </button>
              &nbsp;
              {/* <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={() => setOpenAddInventoryDialog(true)}
              >
                Add Inventory
              </button> */}
            </div>
          </div>

          {/* Table displaying inventory data */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center p-4">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-red-600">{error}</td>
                  </tr>
                ) : (
                  inventoryData
                    .filter((item) =>
                      item?.Item?.toLowerCase().includes(searchTerm.toLowerCase()) // Check if item.Item exists
                    )
                    .map((row, index) => (
                      <tr key={index} className="text-center border-t">
                        <td className="border p-2">{row.Item}</td>
                        <td className="border p-2">{row.Quantity}</td>
                        <td className="border p-2">{row.UpdateDateTime}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={openAddItemDialog}
        onClose={() => setOpenAddItemDialog(false)}
      />

      {/* Add Inventory Dialog */}
      <AddInventoryDialog
        open={openAddInventoryDialog}
        onClose={() => setOpenAddInventoryDialog(false)}
      />
    </div>
  );
}

export default Inventory;
