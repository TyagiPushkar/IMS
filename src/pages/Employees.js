import React, { useState, useEffect } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddEmployeeDialog from "../components/AddEmployeeDialog";

function Employees() {
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeData, setEmployeeData] = useState([]); // State for employee data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(""); // State for any error message

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/employees/get_employees.php"
      );
      const result = await response.json();

      if (result.success) {
        setEmployeeData(result.data); // Update employee data state
      } else {
        setError(result.message); // Set error message if any
      }
    } catch (err) {
      setError("Failed to fetch employee data.");
    } finally {
      setLoading(false); // Stop loading when the request is done
    }
  };

  useEffect(() => {
    // Fetch employee data when component mounts
    fetchEmployeeData();
  }, []); // Empty dependency array to run only once on component mount

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center" style={{ marginTop: "10px" }}>
      <div className="flex flex-col gap-5 w-11/12">
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4">Employees List</span>
        </div>

        {/* Employee Table with Buttons */}
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

            {/* Button to open the Add Employee dialog */}
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => setOpenAddEmployeeDialog(true)}
              >
                Add Employee
              </button>
            </div>
          </div>

          {/* Table displaying employee data */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Emp ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Office Code</th>
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
                  employeeData
                    .filter((employee) =>
                      employee?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || // Check if employee.Name exists
                      employee?.EmpId?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((row, index) => (
                      <tr key={index} className="text-center border-t">
                        <td className="border p-2">{row.EmpId}</td>
                        <td className="border p-2">{row.Name}</td>
                        <td className="border p-2">{row.Mail}</td>
                        <td className="border p-2">{row.OfficeCode}</td>
                        <td className="border p-2">{row.Date}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
  open={openAddEmployeeDialog}
  onClose={() => setOpenAddEmployeeDialog(false)}
  refreshEmployees={fetchEmployeeData} // Pass the function
/>

    </div>
  );
}

export default Employees;
