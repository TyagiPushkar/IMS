import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import Layout from "./components/Layout";
import "./index.css";
import Offices from "./pages/Offices";
import Employees from "./pages/Employees";
import Issue from "./pages/Issue";
import Purchase from "./pages/Purchase";
import Transfer from "./pages/Transfer";
import Unauthorized from "./pages/Unauthorized";

const ROLES = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
  HO: 'HO'
};

const isAuthenticated = () => {
  return localStorage.getItem("user") !== null;
};

const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.Role || null;
};

const RequireAuth = ({ allowedRoles, children }) => {
  const location = useLocation();
  const userRole = getUserRole();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
          {/* <Route 
            path="/transfer" 
            element={
              <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HO]}>
                <Transfer />
              </RequireAuth>
            } 
          /> */}
          <Route path="*" element={<NoPageFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;