import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Fade,
  Tooltip,
  Avatar,
  Stack,
  Divider,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import AddOfficeDialog from "../components/AddOfficeDialog";

function Offices() {
  const [openAddOfficeDialog, setOpenAddOfficeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const fetchOfficeData = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php"
      );
      const result = await response.json();

      if (result.success) {
        setOfficeData(result.data);
        setError("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to fetch office data.");
    } finally {
      setLoading(false);
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

    
  useEffect(() => {
    fetchOfficeData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredOffices = officeData.filter((office) =>
    office?.OfficeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office?.OfficeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedOffices = filteredOffices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  return (
    <Box sx={{ p: 0, maxWidth: '100%' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Office Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all office information
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search offices..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddOfficeDialog(true)}
                >
                  Add Office
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={0}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
                <Fade in={!loading}>
                  <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Office Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Office Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {paginatedOffices.map((office, index) => (
    <TableRow
      key={office.OfficeCode || index}
      hover
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>
        <Chip
          label={office.OfficeCode}
          color="primary"
          size="small"
          icon={<BusinessIcon fontSize="small" />}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {office.OfficeName}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <LocationIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {office.OfficeAddress}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'secondary.main' }}>
            {office.AdminName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2">{office.AdminName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {office.AdminMail}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center">
          <PhoneIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
          <Typography variant="body2">{office.AdminPhone}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  ))}

  {paginatedOffices.length === 0 && !loading && (
    <TableRow>
      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No offices found
        </Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>

                  </Table>
                  <TablePagination
  component="div"
  count={filteredOffices.length}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[5, 10, 25, 50]}
/>
</Box>
            </Fade>
          )}
        </TableContainer>
      </Paper>

      {/* Add Office Dialog */}
      <AddOfficeDialog
        open={openAddOfficeDialog}
        onClose={() => setOpenAddOfficeDialog(false)}
        refreshOffice={fetchOfficeData}
      />
    </Box>
  );
}

export default Offices;