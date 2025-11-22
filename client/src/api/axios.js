import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for Cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
