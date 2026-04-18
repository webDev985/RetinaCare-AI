import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Footer from "./components/Footer";
import Home from "./pages/Home";

import "./utils/fixLeafletIcons";

export default function App() {
  const location = useLocation();
  const [auth, setAuth] = useState(false);

  // ✅ Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(!!token);
  }, [location.pathname]);

  // ❌ REMOVED BAD REDIRECT (IMPORTANT)
  // useEffect(() => {
  //   if (performance.navigation.type === 1) {
  //     window.location.href = "/";
  //   }
  // }, []);

  // ✅ Hide footer on auth pages
  const hideFooterRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  const hideFooter = hideFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route
          path="/login"
          element={!auth ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!auth ? <Signup /> : <Navigate to="/dashboard" />}
        />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* DASHBOARD (PROTECTED) */}
        <Route
          path="/dashboard"
          element={auth ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}