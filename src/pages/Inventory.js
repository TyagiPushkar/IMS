import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import AddItemDialog from "../components/AddItemDialog"; // Import Add Item Dialog
import AddInventoryDialog from "../components/AddInventoryDialog"; // Import Add Inventory Dialog
import SearchIcon from "@mui/icons-material/Search"; // Search icon
import { IconButton, TextField, Box, Button } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ["Apple", "Knorr", "Shoop", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [0, 1, 5, 8, 9, 15],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

function Inventory() {
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openAddInventoryDialog, setOpenAddInventoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample inventory data
  const inventoryData = [
    { item: "Apple", quantity: 10, updatedAt: "2024-01-30" },
    { item: "Knorr", quantity: 5, updatedAt: "2024-01-29" },
    { item: "Shoop", quantity: 8, updatedAt: "2024-01-28" },
    { item: "Green", quantity: 12, updatedAt: "2024-01-27" },
    { item: "Purple", quantity: 15, updatedAt: "2024-01-26" },
    // Add more items here...
  ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center" style={{ marginTop: "10px" }}>
      <div className="flex flex-col gap-5 w-11/12">
        {/* Overall Inventory Stats Section */}
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Overall Inventory</span>
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="flex flex-col p-10 w-full md:w-3/12">
              <span className="font-semibold text-blue-600 text-base">Total Products</span>
              <span className="font-semibold text-gray-600 text-base">0</span>
              <span className="font-thin text-gray-400 text-xs">Last 7 days</span>
            </div>
            <div className="flex flex-col gap-3 p-10 w-full md:w-3/12 sm:border-y-2 md:border-x-2 md:border-y-0">
              <span className="font-semibold text-yellow-600 text-base">Stores</span>
              <span className="font-semibold text-gray-600 text-base">0</span>
              <span className="font-thin text-gray-400 text-xs">Last 7 days</span>
            </div>
            <div className="flex flex-col gap-3 p-10 w-full md:w-3/12 sm:border-y-2 md:border-x-2 md:border-y-0">
              <span className="font-semibold text-purple-600 text-base">Top Selling</span>
              <span className="font-semibold text-gray-600 text-base">0</span>
              <span className="font-thin text-gray-400 text-xs">Last 7 days</span>
            </div>
            <div className="flex flex-col gap-3 p-10 w-full md:w-3/12 border-y-2 md:border-x-2 md:border-y-0">
              <span className="font-semibold text-red-600 text-base">Low Stocks</span>
              <span className="font-semibold text-gray-600 text-base">0</span>
              <span className="font-thin text-gray-400 text-xs">Ordered</span>
            </div>
          </div>
        </div>

        {/* Inventory Table with Buttons */}
        <div className="bg-white rounded p-3">
          {/* <span className="font-semibold px-4">Overall Inventory</span> */}
          <div className="flex justify-between items-center mb-4">
            {/* Search Input */}
            <Box display="flex" alignItems="center">
              <TextField
                label="Search"
                // variant="outlined"
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
                variant="contained"
                color="primary"
                sx={{ marginRight: "10px" }}
                onClick={() => setOpenAddItemDialog(true)}
              >
                Add Item
              </button>
              &nbsp;
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                variant="contained"
                color="secondary"
                onClick={() => setOpenAddInventoryDialog(true)}
              >
                Add Inventory
              </button>
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
                {inventoryData
                  .filter((item) =>
                    item.item.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((row, index) => (
                    <tr key={index} className="text-center border-t">
                      <td className="border p-2">{row.item}</td>
                      <td className="border p-2">{row.quantity}</td>
                      <td className="border p-2">{row.updatedAt}</td>
                    </tr>
                  ))}
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
