"use client"

import { useEffect, useState } from "react" // Import useState
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Inventory from "./pages/Inventory"
import NoPageFound from "./pages/NoPageFound"
import Layout from "./components/Layout"
import "./index.css"
import Offices from "./pages/Offices"
import Employees from "./pages/Employees"
import Issue from "./pages/Issue"
import Purchase from "./pages/Purchase"
import Transfer from "./pages/Transfer"
import Unauthorized from "./pages/Unauthorized"

const ROLES = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  HO: "ADHMOISUNPER",
}

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000

const isAuthenticated = async () => {
  const user = localStorage.getItem("user")
  const sessionToken = localStorage.getItem("sessionToken")
  if (!user || !sessionToken) return false

  try {
    const response = await fetch("https://namami-infotech.com/SatyaMicro/src/auth/authMiddleware.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: JSON.parse(user).OfficeId,
        sessionToken,
      }),
    })
    const result = await response.json()
    return result.valid
  } catch (error) {
    console.error("Authentication check failed:", error)
    return false
  }
}

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    return user?.Role || null
  } catch (error) {
    console.error("Error parsing user from localStorage:", error)
    return null
  }
}

const RequireAuth = ({ allowedRoles, children }) => {
  const location = useLocation()
  const userRole = getUserRole()

  if (!localStorage.getItem("user") || !localStorage.getItem("sessionToken")) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return children
}

// New component to handle root path redirection
const HomeRedirect = () => {
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated()
      setAuthenticated(authStatus)
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  if (!authChecked) {
    // Optionally render a loading spinner here
    return null
  }

  return authenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

function App() {
  useEffect(() => {
    // Set up activity trackers
    const updateLastActivity = () => {
      localStorage.setItem("lastActivity", Date.now())
    }

    // Initial activity timestamp
    updateLastActivity()

    // Events that indicate user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, updateLastActivity)
    })

    // Check for inactivity periodically
    const inactivityCheck = setInterval(async () => {
      const lastActivity = localStorage.getItem("lastActivity")
      if (lastActivity && Date.now() - lastActivity > SESSION_TIMEOUT) {
        console.log("Session timed out due to inactivity. Logging out...")
        const user = JSON.parse(localStorage.getItem("user"))
        const sessionToken = localStorage.getItem("sessionToken")

        if (user && sessionToken) {
          try {
            await fetch("https://namami-infotech.com/SatyaMicro/src/auth/logout.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: user.OfficeId,
                sessionToken,
              }),
            })
            console.log("Backend logout successful.")
          } catch (error) {
            console.error("Error calling logout backend during inactivity timeout:", error)
          }
        }

        localStorage.removeItem("user")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("lastActivity")
        window.location.href = "/login" // Force reload to clear state
      }
    }, 1000 * 60) // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity)
      })
      clearInterval(inactivityCheck)
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root redirect based on authentication status */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/inventory"
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Inventory />
              </RequireAuth>
            }
          />
          <Route
            path="/employees"
            element={
              <RequireAuth allowedRoles={[ROLES.HO]}>
                <Employees />
              </RequireAuth>
            }
          />
          <Route
            path="/offices"
            element={
              <RequireAuth allowedRoles={[ROLES.HO]}>
                <Offices />
              </RequireAuth>
            }
          />
          <Route
            path="/issue"
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Issue />
              </RequireAuth>
            }
          />
          <Route
            path="/purchase"
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Purchase />
              </RequireAuth>
            }
          />
          <Route
            path="/transfer"
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Transfer />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NoPageFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
