import axios from "axios";
let API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;

if (API_BASE_URL === undefined || API_BASE_URL === "undefined" || !API_BASE_URL) {
  console.warn("⚠️ Environment variables VITE_API_URL and VITE_BASE_URL are not defined in login.js. Falling back to '/api/v1'.");
  API_BASE_URL = "/api/v1";
}

export const login = async ({ username, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response || error.message);
    throw error;
  }
};

export const refreshToken = async (refreshTokenValue, accessToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {
        refreshToken: refreshTokenValue,
      },
      accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined
    );

    // Full response is returned so callers can also inspect status codes
    return response;
  } catch (error) {
    console.error("Refresh token error:", error.response || error.message);
    throw error;
  }
};
