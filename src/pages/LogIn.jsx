import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "../assets/style/login.css";
import axios from "axios";
import "./login.css";

// Components
import TitleUpdater from "../components/TitleUpdater";

// Icons
import { FiEye } from "react-icons/fi";
import { GoEyeClosed } from "react-icons/go";
import { FaCheck } from "react-icons/fa";

// Images
import loginBg from "../assets/images/login-page-images/login-background-now.jpg";

// Zustand store
import useAuthStore from "../../stores/authStore";

function LogIn() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const { login, error } = useAuthStore();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      const loginSuccess = await useAuthStore
        .getState()
        .login({ username, password });

      if (loginSuccess) {
        console.log("Login Success ✅");
        
        toast.success("Siz sistemə daxil oldunuz", {
          position: "top-right",
          autoClose: 3000,
        });

        // Orijinal route'a geri dön (eğer varsa)
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/login') {
          sessionStorage.removeItem('redirectAfterLogin');
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 800);
        } else {
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 800);
        }
      } else {
        console.log("Login failed ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div
      className="login-wrapper"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ overflow: "hidden" }}
    >
    <div className="login-container">
     <TitleUpdater title={"LogIn"} />

      <form className="login-form-container" onSubmit={handleLogin}>
        <div className="topPart">
          <p className="logo-title">
            Müasir <br />
            Stomatologiya
          </p>
        </div>
        <p className="logo-motto">Uğur təbəssümdən başlayır!</p>

        <div className="inputs-container">
          <div className="username-part">
            <input
              type="text"
              name="stamatoloq"
              placeholder="İstifadəçinin adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="password-part">
            <input
              type={passwordShown ? "text" : "password"}
              placeholder="Şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordShown ? (
              <GoEyeClosed
                className="eye-btn"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <FiEye className="eye-btn" onClick={togglePasswordVisibility} />
            )}
          </div>
        </div>

        <div className="remember-me" onClick={() => setRememberMe(!rememberMe)}>
          <div className={`custom-checkbox${rememberMe ? " checked" : ""}`}>
            {rememberMe && <FaCheck className="check-icon" />}
          </div>
          <label>Yadda saxla</label>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="login-btn">
          <button type="submit" disabled={localLoading}>
            {localLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div
                  style={{
                    border: "2px solid #ffffff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Yüklənir...
              </span>
            ) : (
              "Daxil ol"
            )}
          </button>
        </div>
      </form>
    </div>
    </motion.div>
  );
}

export default LogIn;
