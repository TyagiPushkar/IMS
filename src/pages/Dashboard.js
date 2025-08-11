"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  alpha,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/material"
import { Store, CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useNavigate } from "react-router-dom" // Import useNavigate

const Dashboard = () => {
  const theme = useTheme()
  const navigate = useNavigate() // Initialize useNavigate

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offices, setOffices] = useState([])
  const [selectedOffices, setSelectedOffices] = useState([])
  const [officesLoading, setOfficesLoading] = useState(false)
 const [userRole, setUserRole] = useState(null)
  const [user, setUser] = useState({
    username: "Guest",
    AdminName: "Guest User",
    image: "",
    Role: null,
    OfficeId: null
  })

  useEffect(() => {
    const initializeUser = async () => {
      const userData = JSON.parse(localStorage.getItem("user")) || {
        username: "Guest",
        AdminName: "Guest User",
        image: "",
        Role: null,
        OfficeId: null
      }
      setUser(userData)
      await fetchUserRole()
      await verifySession()
    }
    initializeUser()
  }, [navigate])

  const fetchUserRole = async () => {
    const user = JSON.parse(localStorage.getItem("user"))
    const sessionToken = localStorage.getItem("sessionToken")

    if (!user || !sessionToken) {
      setUserRole(null)
      return
    }

    try {
      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/role/get_roles.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OfficeCode: user.OfficeCode,
          sessionToken
        }),
      })

      const result = await response.json()
      if (result.success) {
        setUserRole(result.role)
        // Update user object with the role from API
        setUser(prev => ({
          ...prev,
          Role: result.role
        }))
      }
    } catch (error) {
      console.error("Error fetching role:", error)
      setUserRole(null)
    }
  }
  
  
  // Memoize the selected office IDs to prevent unnecessary re-renders of the dashboard data fetch
  const selectedOfficeIdsForFetch = useMemo(() => {
    return selectedOffices.map((office) => office.ID)
  }, [selectedOffices])

 const userData = useMemo(() => {
    return {
      userObject: JSON.parse(localStorage.getItem("user")),
      sessionToken: localStorage.getItem("sessionToken"),
      OfficeId: JSON.parse(localStorage.getItem("user"))?.OfficeId,
      role: JSON.parse(localStorage.getItem("user"))?.Role
    }
  }, [])

  // Fetch offices data - wrapped in useCallback with stable dependencies
  const fetchOffices = useCallback(async () => {
    setOfficesLoading(true)
    setError(null)

    if (!userData.userObject || !userData.sessionToken || !userData.OfficeId) {
      setError("Authentication required or Office ID not found. Please log in.")
      setOfficesLoading(false)
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
          userId: userData.OfficeId,
          sessionToken: userData.sessionToken,
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        setOffices(result.data)
        // Set initial selected offices (first time only)
        if (selectedOffices.length === 0 && result.data.length > 0) {
          setSelectedOffices([result.data[0]]) // Select first office by default
        }
      } else {
        setError(result.message || "Failed to fetch offices.")
      }
    } catch (err) {
      console.error("Error fetching offices:", err)
      setError("An error occurred while fetching offices.")
    } finally {
      setOfficesLoading(false)
    }
  }, [navigate, userData.userObject, userData.sessionToken, userData.OfficeId])

  // Fetch dashboard data - wrapped in useCallback with stable dependencies
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!userData.userObject || !userData.sessionToken || !userData.OfficeId) {
      setError("Authentication required or Office ID not found. Please log in.")
      setLoading(false)
      navigate("/login")
      return
    }

    try {
      const payload = {
        userId: userData.OfficeId,
        sessionToken: userData.sessionToken,
        role: userData.role,
        selectedOfficeIds: selectedOfficeIdsForFetch,
      }

      const response = await fetch("https://namami-infotech.com/SatyaMicro/src/dashboard/dashboard.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        setError("Session expired or invalid. Please log in again.")
        navigate("/login")
        return
      }

      const result = await response.json()
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.message || "Failed to fetch dashboard data.")
      }
    } catch (err) {
      setError("Error connecting to server.")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [navigate, userData, selectedOfficeIdsForFetch])

  // Effect for fetching offices - runs only once on mount
  useEffect(() => {
    fetchOffices()
  }, [fetchOffices])

  // Effect for fetching dashboard data
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData()
    }, 100) // Small delay to prevent immediate fetch

    return () => clearTimeout(timer) // Cleanup
  }, [fetchDashboardData, selectedOfficeIdsForFetch]) // Only re-run when these change

  // Prepare chart data
  const prepareMonthlyData = () => {
    if (!dashboardData?.monthly_purchases) return []
    return dashboardData.monthly_purchases.map((item) => ({
      month: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      amount: Number.parseFloat(item.monthly_total),
    }))
  }
  const prepareStockData = () => {
    if (!dashboardData?.stock_status) return []
    return dashboardData.stock_status.map((item, index) => ({
      name: item.item_name,
      value: Number.parseInt(item.total_quantity),
      category: item.Category || "Uncategorized",
    }))
  }
  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]
  // Metric cards data
  const getMetricCards = () => [
    {
      title: "Total Purchase",
      value: `₹${dashboardData?.total_purchase || "0"}`,
      icon: "₹",
      color: theme.palette.success.main,
    },
    {
      title: "Total Offices",
      value: dashboardData?.total_offices || "0",
      icon: <Store />,
      color: theme.palette.warning.main,
    },
  ]
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }
  const monthlyData = prepareMonthlyData()
  const stockData = prepareStockData()
  const metricCards = getMetricCards()
  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50], minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold", color: theme.palette.text.primary }}>
        Dashboard Overview
      </Typography>
      <Box style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(card.color, 0.1)} 0%, ${alpha(card.color, 0.05)} 100%)`,
                  border: `1px solid ${alpha(card.color, 0.2)}`,
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: theme.palette.text.primary }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {userRole === "HO" && (
          <Autocomplete
            multiple
            id="office-select"
            options={offices}
            disableCloseOnSelect
            loading={officesLoading}
            getOptionLabel={(option) => `${option.OfficeName} (${option.OfficeCode})`}
            value={selectedOffices}
            onChange={(event, newValue) => {
              setSelectedOffices(newValue)
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {option.OfficeCode} • {option.OfficeName}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Offices"
                placeholder={selectedOffices.length === 0 ? "Choose offices to filter data" : ""}
                helperText={
                  selectedOffices.length > 0
                    ? `${selectedOffices.length} office(s) selected`
                    : "Select one or more offices to filter dashboard data"
                }
              />
            )}
            sx={{ minWidth: 300 }}
          />
        )}
      </Box>
      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Purchases Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Monthly Purchases
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[3],
                  }}
                  formatter={(value) => [`₹${value}`, "Amount"]}
                />
                <Bar dataKey="amount" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Stock Status Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 0 }}>
              Stock Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[3],
                  }}
                  formatter={(value, name) => [value, "Quantity"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary, fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
export default Dashboard
