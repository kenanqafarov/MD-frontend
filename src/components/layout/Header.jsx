// Header.js
import { useState, useEffect } from "react";
import { LuCalendarPlus } from "react-icons/lu";
import { AiOutlineUserAdd } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { FiLock, FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/temp-axios-auth";
import useAuthStore from "../../../stores/authStore";

import adminUser from "../../assets/images/header-component-images/adminPFP.jpeg";
import "../../assets/style/header.css";

function Header() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [workerInfo, setWorkerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerInfo = async () => {
      if (user?.id && !workerInfo) {
        // Əvvəlcə cache-dən oxu
        const cacheKey = `worker_info_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            // Cache'in tarixini yoxla (məsələn 5 dəqiqə)
            const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
            if (cacheTimestamp) {
              const cacheAge = Date.now() - parseInt(cacheTimestamp);
              const maxAge = 5 * 60 * 1000; // 5 dəqiqə
              if (cacheAge < maxAge) {
                // Cache varsa və yenidirsə, direkt istifadə et - istek atma
                setWorkerInfo(parsedData);
                setLoading(false);
                return;
              }
            } else {
              // Timestamp yoxdursa da cache'i istifadə et
              setWorkerInfo(parsedData);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Cache parse xətası:", e);
            // Parse xətası varsa, cache'i sil və davam et
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_timestamp`);
          }
        }

        // Cache yoxdursa və ya köhnəlmişdirsə, API-dən gətir
        try {
          const response = await axiosInstance.get(
            `/add-worker/info/${user.id}`
          );
          const data = response.data;
          setWorkerInfo(data);
          
          // Cache-ə yaddaşa saxla
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        } catch (error) {
          console.error("Failed to fetch worker data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWorkerInfo();
  }, [user?.id, workerInfo]);

  const handleLogout = () => {
    logout();
    toast.info("Siz sistemdən çıxdınız", {
      position: "top-right",
      autoClose: 3000,
    });
    setTimeout(() => {
      window.location.href = "/#/login";
    }, 500);
  };

  const showNotificationDot = localStorage.getItem("notification") !== "false";

  return (
    <header className="headerContainer">
      <div className="headerElements">
        <Link to={"/appointments/add"}>
          <LuCalendarPlus className="headerCalendarIcon headerIcon" />
        </Link>
        <Link to={"/patients/add-patient"}>
          <AiOutlineUserAdd className="headerIcon" />
        </Link>
        {showNotificationDot && <div className="notificationDot"></div>}
        <div
          className="headerUserProfileLink"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <img src={adminUser} alt="Admin" loading="lazy" decoding="async" />
          <div className="headerRightPart">
            <div className="headerTitle">
              <p className="headerNamePart">
                {workerInfo
                  ? `${workerInfo.name} ${workerInfo.surname}`
                  : "Məlumat tapılmadı"}
              </p>
              <p className="headerRolePart">
                {workerInfo?.permissions?.length > 0
                  ? workerInfo.permissions.join(", ")
                  : "Vəzifə"}
              </p>
            </div>
            <IoIosArrowBack className="headerArrowIcon" />
          </div>

          {menuOpen && (
            <div className="headerDropdownMenu">
              <div className="headerDropdownItem">
                <FiLock className="headerDropdownIcon" />
                <Link to="/change-password">Şifrəni dəyiş</Link>
              </div>
              <div
                className="headerDropdownItem"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                <FiLogOut className="headerDropdownIcon" />
                <span>Çıxış</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;