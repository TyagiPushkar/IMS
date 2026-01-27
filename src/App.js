"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import Layout from "./components/Layout";
import Offices from "./pages/Offices";
import Employees from "./pages/Employees";
import Issue from "./pages/Issue";
import Purchase from "./pages/Purchase";
import Transfer from "./pages/Transfer";
import Vendor from "./pages/Vendor";
import Unauthorized from "./pages/Unauthorized";

const App = () => {
  return (
    <Router basename="/frontend">
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* MAIN LAYOUT */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/offices" element={<Offices />} />
          <Route path="/issue" element={<Issue />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="*" element={<NoPageFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
