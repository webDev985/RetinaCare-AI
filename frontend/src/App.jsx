import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import "./utils/fixLeafletIcons";

export default function App() {
  const location = useLocation();
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));

  // Re-check token whenever route changes
  useEffect(() => {
    setAuth(!!localStorage.getItem("token"));
  }, [location.pathname]);

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={auth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />

      {/* Auth Routes */}
      <Route path="/login" element={!auth ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!auth ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={auth ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
