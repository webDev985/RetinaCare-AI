import axios from "axios";

// change 5000 to 5001 if your backend runs on 5001
const api = axios.create({
  baseURL: "https://dr-detection-frontend.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
