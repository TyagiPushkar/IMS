"use client"

import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  Chip,
} from "@mui/material"
import {
  Home,
  Menu as MenuIcon,
 
  Logout,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material"
import BusinessIcon from "@mui/icons-material/Business"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import PeopleIcon from "@mui/icons-material/People"
import InventoryIcon from "@mui/icons-material/Inventory"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import MoveDownIcon from "@mui/icons-material/MoveDown"
import CallMissedOutgoingIcon from "@mui/icons-material/CallMissedOutgoing"

const drawerWidth = 280
const collapsedDrawerWidth = 70

const Layout = ({ children }) => {
  const userObject = JSON.parse(localStorage.getItem("user"));
  const role = userObject?.Role;
  // const OfficeId = userObject?.OfficeId;
  const theme = useTheme()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
    AdminName: "Guest User",
    image: "",
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  // const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget)
  const handleNotificationClose = () => setNotificationAnchor(null)

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleDrawerCollapse = () => setDrawerCollapsed(!drawerCollapsed)

  const menuItems = [
    { to: "/dashboard", icon: <Home />, text: "Dashboard", badge: null },
    { to: "/inventory", icon: <InventoryIcon />, text: "Inventory", badge: null },
    role === "HO" && { to: "/employees", icon: <PeopleIcon />, text: "Employees", badge: null },
    role === "HO" && { to: "/offices", icon: <BusinessIcon />, text: "Offices", badge: null },
    { to: "/purchase", icon: <ShoppingCartIcon />, text: "Purchases", badge: null },
    { to: "/transfer", icon: <MoveDownIcon />, text: "Stock Transfer", badge: null },
    { to: "/issue", icon: <CallMissedOutgoingIcon />, text: "Issue Item", badge: null },
  ].filter(Boolean);
  

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: drawerCollapsed ? "center" : "space-between",
          minHeight: 64,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {!drawerCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
              SatyaMicro
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={handleDrawerCollapse}
          sx={{
            display: { xs: "none", sm: "flex" },
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map(({ to, icon, text, badge }) => (
            <NavLink key={to} to={to} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Tooltip title={drawerCollapsed ? text : ""} placement="right">
                  <ListItem
                    sx={{
                      mb: 0.5,
                      borderRadius: 2,
                      transition: "all 0.2s ease-in-out",
                      backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        transform: "translateX(4px)",
                      },
                      justifyContent: drawerCollapsed ? "center" : "flex-start",
                      px: drawerCollapsed ? 1 : 2,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: drawerCollapsed ? "auto" : 40,
                        justifyContent: "center",
                      }}
                    >
                      {badge && !drawerCollapsed ? (
                        <Badge badgeContent={badge} color="error" variant="dot">
                          {icon}
                        </Badge>
                      ) : (
                        icon
                      )}
                    </ListItemIcon>
                    {!drawerCollapsed && (
                      <ListItemText
                        primary={text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: "0.9rem",
                          },
                        }}
                      />
                    )}
                    {!drawerCollapsed && badge && (
                      <Chip
                        label={badge}
                        size="small"
                        color="error"
                        sx={{
                          height: 20,
                          fontSize: "0.75rem",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              )}
            </NavLink>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      {!drawerCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.image}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {user.AdminName?.charAt(0) || "G"}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.AdminName || "Guest User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.Role || "Guest User"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: "flex", overflowX: "hidden" }}>
      <CssBaseline />

      {/* Enhanced AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "#000000", // Changed to black
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
          {/* Left side - Mobile Menu Button + Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Mobile Menu Button */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{
                display: { sm: "none" },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo - Always visible on left */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: 40,
                  width: "auto",
                  cursor: "pointer",
                }}
              />
              
            </Box>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
         
            
            {/* User Profile */}
            <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "block" },
                  fontWeight: 500,
                }}
              >
                {user.AdminName || "Guest"}
              </Typography>
              <Tooltip title="Profile">
                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    alt={user.AdminName}
                    src={user.image}
                    sx={{
                      width: 36,
                      height: 36,
                      border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                      "&:hover": {
                        border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                      },
                    }}
                  >
                    {user.AdminName?.charAt(0) || "G"}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          [`& .MuiDrawer-paper`]: {
            width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: "border-box",
            background: theme.palette.background.paper,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: theme.palette.background.paper,
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 200,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <Logout fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              New inventory alert
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Low stock items need attention
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Purchase order approved
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Order #12345 has been approved
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          mt: 0,
          overflowX: "hidden",
          background: theme.palette.grey[50],
          minHeight: "100vh",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet /> {/* This replaces {children} */}
      </Box>
    </Box>
  )
}

export default Layout
