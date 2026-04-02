import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 p-4 flex justify-between">
      <p className="font-semibold text-sky-700">RetinaCare AI</p>
      <button
        onClick={logout}
        className="text-sm text-red-500 hover:underline"
      >
        Logout
      </button>
    </header>
  );
};

export default NavBar;
