import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",   // ✅ CORRECT
});

export const analyzePrompt = (prompt) => {
  return API.post("/analyze", { prompt });
};

export const getHistory = () => {
  return API.get("/history");
};

export const deleteHistory = (id) => {
  return API.delete(`/history/${id}`);
};

export default API;