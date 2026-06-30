import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL;

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
