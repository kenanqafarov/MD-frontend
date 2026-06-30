// src/components/Redirecter.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

function Redirecter({ children }) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    const authStore = useAuthStore.getState();
    let countdownTimer = null;

    const clearCountdown = () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    };

    const goToLogin = () => {
      clearCountdown();
      const location = window.location;
      // HashRouter kullanıldığında hash'ten path'i al
      const currentPath = location.hash ? location.hash.replace('#', '') : location.pathname;
      
      // Orijinal route'u sakla (login sonrası geri dönmek için)
      if (currentPath && currentPath !== '/login' && !currentPath.startsWith('/login')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      
      // HashRouter kullanıldığında hash'i temizleyerek login'e git
      navigate("/login", { replace: true });
    };

    const decodeToken = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (err) {
        return null;
      }
    };

    const startCountdown = (accessToken) => {
      clearCountdown();
      const payload = decodeToken(accessToken);
      if (!payload?.exp || !payload?.iat) {
        goToLogin();
        return;
      }

      // exp - iat = tokenin ümumi ömrü (saniyə). 60 saniyə öncə refresh et.
      const lifetimeMs = (payload.exp - payload.iat) * 1000;
      const refreshMomentMs = payload.iat * 1000 + (lifetimeMs - 60_000);
      const refreshInMs = refreshMomentMs - Date.now();

      const triggerRefresh = () => handleRefresh(accessToken);

      if (refreshInMs <= 0) {
        triggerRefresh();
        return;
      }

      const tick = () => {
        const remainingSec = Math.max(
          Math.floor((refreshMomentMs - Date.now()) / 1000),
          0
        );
        setSecondsLeft(remainingSec);

        if (remainingSec <= 0) {
          clearCountdown();
          triggerRefresh();
        }
      };

      tick();
      countdownTimer = setInterval(tick, 1000);
    };

    const handleRefresh = async (currentAccessToken) => {
      try {
        const newToken = await authStore.refreshAccessToken(currentAccessToken);
        if (newToken) {
          startCountdown(newToken);
        }
      } catch (refreshError) {
        console.error("Failed to refresh access token:", refreshError);
        goToLogin();
      }
    };

    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = localStorage.getItem("userId");

      if (!token || !refreshToken || !user) {
        goToLogin();
        return;
      }

      const payload = decodeToken(token);
      const refreshPayload = decodeToken(refreshToken);
      const isAccessExpired = !payload || payload.exp * 1000 < Date.now();
      const isRefreshExpired =
        !refreshPayload || refreshPayload.exp * 1000 < Date.now();

      if (isRefreshExpired) {
        goToLogin();
        return;
      }

      if (isAccessExpired) {
        await handleRefresh(token);
        return;
      }

      startCountdown(token);
    };

    checkAndRefreshToken();

    return () => {
      clearCountdown();
    };
  }, [navigate]);

  return <>{children}</>;
}

export default Redirecter;
