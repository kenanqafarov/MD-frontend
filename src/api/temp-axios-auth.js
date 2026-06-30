import axios from "axios";
import useAuthStore from "../../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";

// Helper function to check if token is expired
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload || !payload.exp) return true;
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    return true;
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");

    // Check if token is expired before making the request
    if (token && isTokenExpired(token)) {
      // Token is expired, try to refresh it
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
        try {
          // Import auth store dynamically to avoid circular dependency
          const authStore = useAuthStore.getState();
          const newToken = await authStore.refreshAccessToken();
          token = newToken;
        } catch (error) {
          // Refresh failed, will be handled by response interceptor
          console.error(
            "Failed to refresh token in request interceptor:",
            error
          );
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle Content-Type based on request body type
    // If FormData, remove Content-Type header (browser will set it automatically with boundary)
    // If JSON or other, set appropriate Content-Type
    if (config.data instanceof FormData) {
      // Remove Content-Type header for FormData - browser will set it automatically
      delete config.headers["Content-Type"];
    } else if (config.data && typeof config.data === "object") {
      // For JSON objects, ensure Content-Type is application/json
      config.headers["Content-Type"] = "application/json";
    } else if (config.data) {
      // For other data types, keep default or set as needed
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Log request body for debugging
    if (config.data) {
      if (config.data instanceof FormData) {
        console.log("Request Body (FormData):", {
          url: config.url,
          method: config.method,
          formDataEntries: Array.from(config.data.entries()),
        });
      } else {
        console.log("Request Body:", {
          url: config.url,
          method: config.method,
          data: config.data,
          contentType: config.headers["Content-Type"],
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
        try {
          const authStore = useAuthStore.getState();
          const newToken = await authStore.refreshAccessToken();

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError, null);
          isRefreshing = false;

          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");

          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No valid refresh token, clear everything and redirect
        isRefreshing = false;
        processQueue(new Error("No valid refresh token"), null);

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
