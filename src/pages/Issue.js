import React, { useState, useEffect } from "react";
import { IconButton, TextField, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import IssueItemDialog from "../components/ItemIssueDialog";

function Issue() {
     const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [issueData, setIssueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get OfficeId from localStorage (userObject)
    const userObject = JSON.parse(localStorage.getItem("user"));
    const officeId = userObject?.OfficeId;

    if (officeId) {
      // Fetch issue data based on OfficeId
      const fetchIssueData = async () => {
        try {
          const response = await fetch(
            `https://namami-infotech.com/SatyaMicro/src/issue/get_issue.php?OfficeID=${officeId}`
          );
          const result = await response.json();

          if (result.success) {
            setIssueData(result.data);
          } else {
            setError(result.message);
          }
        } catch (err) {
          setError("Failed to fetch issue data.");
        } finally {
          setLoading(false);
        }
      };

      fetchIssueData();
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
          <span className="font-semibold px-4">Issued Items List</span>
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
                      <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => setOpenAddEmployeeDialog(true)}
              >
                Issue Item
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Office Code</th>
                  <th className="border p-2">Employee</th>
                  {/* <th className="border p-2">Name</th> */}
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-red-600">{error}</td>
                  </tr>
                ) : (
                  issueData
                    .filter((row) =>
                      row?.Item?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((row, index) => (
                      <tr key={index} className="text-center border-t">
                        <td className="border p-2">{row.OfficeCode}</td>
                            <td className="border p-2">{row.Name} - ({ row.EmpID})</td>
                        {/* <td className="border p-2">{row.Name}</td> */}
                        <td className="border p-2">{row.Item}</td>
                        <td className="border p-2">{row.Quantity}</td>
                        <td className="border p-2">{row.DateTime}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
          <IssueItemDialog
        open={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
      />
    </div>
  );
}

export default Issue;
