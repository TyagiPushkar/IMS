"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  alpha,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/material"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Store,
  Inventory,
  AttachMoney,
  CheckBoxOutlineBlank,
  CheckBox,
} from "@mui/icons-material"
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

const Dashboard = () => {
  const theme = useTheme()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offices, setOffices] = useState([])
  const [selectedOffices, setSelectedOffices] = useState([])
  const [officesLoading, setOfficesLoading] = useState(false)
  const userObject = JSON.parse(localStorage.getItem("user"));
  const role = userObject?.Role;
  const OfficeId = userObject?.OfficeId;
  // Fetch offices data
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setOfficesLoading(true)
        const response = await fetch("https://namami-infotech.com/SatyaMicro/src/offices/get_offices.php")
        const result = await response.json()

        if (result.success) {
          setOffices(result.data)
        } else {
          console.error("Failed to fetch offices")
        }
      } catch (err) {
        console.error("Error fetching offices:", err)
      } finally {
        setOfficesLoading(false)
      }
    }

    fetchOffices()
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Build URL with OfficeId parameter
        let url = "https://namami-infotech.com/SatyaMicro/src/dashboard/dashboard.php"
        if (role !== "HO") {
          url += `?OfficeId=${OfficeId}`
        } else if (selectedOffices.length > 0) {
          const officeIds = selectedOffices.map((office) => office.ID).join(",")
          url += `?OfficeId=${officeIds}`
        }

        const response = await fetch(url)
        const result = await response.json()

        if (result.success) {
          setDashboardData(result.data)
        } else {
          setError("Failed to fetch dashboard data")
        }
      } catch (err) {
        setError("Error connecting to server")
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedOffices]) // Add selectedOffices as dependency

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
      // change: "+12.5%",
      trend: "up",
      icon: "₹",
      color: theme.palette.success.main,
    },
    // {
    //   title: "Total Items",
    //   value: dashboardData?.total_items || "0",
    //   change: "+8.2%",
    //   trend: "up",
    //   icon: <Inventory />,
    //   color: theme.palette.info.main,
    // },
    {
      title: "Total Offices",
      value: dashboardData?.total_offices || "0",
      // change: "-2.1%",
      trend: "up",
      icon: <Store />,
      color: theme.palette.warning.main,
    },
    // {
    //   title: "Active Stock Items",
    //   value: dashboardData?.stock_status?.filter((item) => Number.parseInt(item.total_quantity) > 0).length || "0",
    //   change: "+5.3%",
    //   trend: "up",
    //   icon: <ShoppingCart />,
    //   color: theme.palette.primary.main,
    // },
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

      
<Box style={{display: "flex", gap:"20px", alignItems: "center", marginBottom: "20px"}}>
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
                  <Chip
                    label={card.change}
                    size="small"
                    icon={card.trend === "up" ? <TrendingUp /> : <TrendingDown />}
                    sx={{
                      backgroundColor:
                        card.trend === "up"
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                      color: card.trend === "up" ? theme.palette.success.main : theme.palette.error.main,
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
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
        {role === "HO" && (
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
                  {/* <Typography variant="body2" color="text.secondary">
                    {option.OfficeCode} • {option.OfficeAddress}
                  </Typography> */}
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
