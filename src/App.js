import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import Store from "./pages/Store";
import Layout from "./components/Layout";
import "./index.css";
import Offices from "./pages/Offices";
import Employees from "./pages/Employees";

// Function to check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("user") !== null; // Check if user data exists in localStorage
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Require Authentication */}
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

// Protected Routes Wrapper
const ProtectedRoutes = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />; // Redirect to login if not authenticated
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/offices" element={<Offices/>} />
        <Route path="/manage-store" element={<Store />} />
        <Route path="*" element={<NoPageFound />} />
      </Routes>
    </Layout>
  );
};

export default App;
