import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Force localhost API if running locally to avoid hitting production (Render) causing CORS/Auth mismatch
// This overrides .env VITE_API_URL if we are on localhost
const API_BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : (import.meta.env.VITE_API_URL || "https://darul-qaza-backend.onrender.com/api");

if (isLocal) {
  console.log("🔧 Localhost detected: Forcing API to http://localhost:5000/api");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let interceptorId = null;

export const attachClerkToken = (getToken) => {
  // Remove existing interceptor if it exists
  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId);
  }

  // Add new interceptor
  interceptorId = api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log("Attaching token:", token.substring(0, 10) + "...");
        } else {
          console.warn("No token available from Clerk");
        }
      } catch (error) {
        console.error("Error getting Clerk token:", error);
        // Continue without token if there's an error
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clerk will handle authentication redirects
      console.error("Unauthorized request - user may need to sign in");
    }
    return Promise.reject(error);
  }
);

export default api;
