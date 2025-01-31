import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import Layout from "./components/Layout";
import "./index.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with Layout */}
        <Route path="*" element={<LayoutWrapper />} />
      </Routes>
    </BrowserRouter>
  );
};

// Wrapper component to conditionally apply Layout
const LayoutWrapper = () => {
  const location = useLocation();

  // Check if the current route is either login or register
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  // If it's an auth route, render the route without Layout
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Otherwise, render the routes with Layout
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchase-details" element={<PurchaseDetails />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/manage-store" element={<Store />} />
        <Route path="*" element={<NoPageFound />} />
      </Routes>
    </Layout>
  );
};

export default App;