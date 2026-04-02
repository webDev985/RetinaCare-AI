import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus(res.data.msg || "Email verified");
        showToast("success", "Email verified! You can login now.");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setStatus(
          err.response?.data?.msg || "Verification link invalid or expired."
        );
        showToast("error", "Verification failed.");
      }
    };
    verify();
  }, [token, navigate, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="bg-white p-6 rounded-xl shadow border border-sky-100">
        <p className="text-sky-700 font-semibold text-center">{status}</p>
      </div>
    </div>
  );
}
