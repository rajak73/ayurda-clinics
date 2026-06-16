import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`,
});

// Automatically inject JWT token into headers (admin or patient)
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const patientToken = localStorage.getItem("patientToken");
    
    // Prioritize patientToken for patient-facing endpoints to avoid admin context overrides
    const isPatientEndpoint = config.url && (
      (config.url.includes("/appointments") && config.method?.toLowerCase() === "post") || 
      config.url.includes("/payments") || 
      (config.url.includes("/users") && !config.url.includes("/admin"))
    );

    if (isPatientEndpoint && patientToken) {
      config.headers.Authorization = `Bearer ${patientToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (patientToken) {
      config.headers.Authorization = `Bearer ${patientToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
