import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import SearchIcon from "@mui/icons-material/Search"; // Search icon
import { IconButton, TextField, Box } from "@mui/material";
import TransferItemDialog from "../components/TransferitemDialog";

ChartJS.register(ArcElement, Tooltip, Legend);

function Transfer() {
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const fetchOfficeData = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php"
        );
        const result = await response.json();

        if (result.success) {
          setOfficeData(result.data); // Update office data state
        } else {
          setError(result.message); // Set error message if any
        }
      } catch (err) {
        setError("Failed to fetch office data.");
      } finally {
        setLoading(false); // Stop loading when the request is done
      }
  };
  useEffect(() => {
    fetchOfficeData();
  }, []); 

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center" style={{ marginTop: "10px" }}>
          <div className="flex flex-col gap-5 w-11/12">
               <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Transfer List</span>
          
        </div>
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

            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={() => setOpenAddItemDialog(true)}
              >
               Transfer Item
              </button>
             
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Office Name</th>
                  <th className="border p-2">Office Code</th>
                  <th className="border p-2">Admin Name</th>
                  <th className="border p-2">Admin Email</th>
                  <th className="border p-2">Admin Phone</th>
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
                  officeData
                    .filter((office) =>
                      office?.OfficeName?.toLowerCase().includes(searchTerm.toLowerCase()) // Check if office.OfficeName exists
                    )
                    .map((row, index) => (
                      <tr key={index} className="text-center border-t">
                        <td className="border p-2">{row.OfficeName}</td>
                        <td className="border p-2">{row.OfficeCode}</td>
                        <td className="border p-2">{row.AdminName}</td>
                        <td className="border p-2">{row.AdminMail}</td>
                        <td className="border p-2">{row.AdminPhone}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      
      
<TransferItemDialog open={openAddItemDialog}
              onClose={() => setOpenAddItemDialog(false)}
              refreshOffice={fetchOfficeData}
          />
      
    </div>
  );
}

export default Transfer;
