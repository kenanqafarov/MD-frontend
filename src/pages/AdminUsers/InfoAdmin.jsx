import React, { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import EditIcon from "../../assets/icons/Edit";
import { Link, useParams } from "react-router-dom";
import "../../assets/style/AdminUsers/infoadmin.css";

const InfoAdmin = ({ showEdit = true }) => {
  const { id } = useParams();

  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("ID dəyəri URL-də tapılmadı.");
      setLoading(false);
      return;
    }

    const fetchWorkerInfo = async () => {
      setLoading(true);
      const token = localStorage.getItem("refreshToken");
      if (!token) {
        setError("Avtorizasiya tokeni tapılmadı.");
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
        const response = await fetch(
          `${API_BASE_URL}/add-worker/info/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP xətası! Status: ${response.status}`);
        }

        const data = await response.json();
        setInfoData(data);
      } catch (err) {
        console.error("API Sorğu Xətası:", err);
        setError(`Xəta baş verdi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerInfo();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Yüklənir...</div>;
  }

  if (error) {
    return <div className="error-state">Xəta: {error}</div>;
  }

  if (!infoData) {
    return <div className="no-data-state">Məlumat tapılmadı.</div>;
  }

  // Sahələrin adlarını API cavabına uyğunlaşdırın
  const avatarName = `${infoData.name} ${infoData.surname}`;
  const avatarUrl = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(avatarName)}`;

  return (
    <div className="infoAdminFormContainer h-screen">
      {showEdit && (
        <div className="infoAdminEditIcon">
          <Link to={`../admin-users/edit/${id}`} title="Redaktə et">
            <EditIcon style={{ cursor: "pointer" }} />
          </Link>
        </div>
      )}
      <form className="infoAdminForm">
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">Status</label>
          <span className="infoAdminStatus active">Aktiv</span>
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">İstifadəçi adı</label>
          <input
            type="text"
            className="infoAdminField"
            value={infoData.username || ""}
            readOnly
          />
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">Şifrə</label>
          <input
            type="password"
            className="infoAdminField"
            value=""
            readOnly
          />
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">Adı</label>
          <input
            type="text"
            className="infoAdminField"
            value={infoData.name || ""}
            readOnly
          />
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">Soyadı</label>
          <input
            type="text"
            className="infoAdminField"
            value={infoData.surname || ""}
            readOnly
          />
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">İcazələri</label>
          <input
            type="text"
            className="infoAdminField"
            value={infoData.permissions ? infoData.permissions.join(", ") : ""}
            readOnly
          />
        </div>
        <div className="infoAdminFormRow">
          <label className="infoAdminLabel">Mobil nömrə</label>
          <input
            type="text"
            className="infoAdminField"
            value={infoData.phone || ""}
            readOnly
          />
        </div>
        <div className="infoAdminFormRow infoAdminImageUploadRow">
          <label className="infoAdminLabel">Şəkil</label>
          <div className="infoAdminPhotoWrapper">
            <div className="infoAdminImagePreview">
              <img src={avatarUrl} alt="admin avatar" />
              <a
                href={avatarUrl}
                download
                className="infoAdminDownloadIcon"
                title="Yüklə"
              >
                <FaDownload />
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InfoAdmin;