import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/AdminUsers/editadmin.css";
import AddPhotoIcon from "../../assets/icons/AddPhoto";
import CloseIcon from "../../assets/icons/Close";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";

function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [permissionsList, setPermissionsList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    permissions: [],
  });

  // Fetch all available permissions and initial admin data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("refreshToken");
      if (!token) {
        setError("Avtorizasiya tokeni tapılmadı.");
        setLoading(false);
        setPermissionsLoading(false);
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        // Fetch permissions list
        const permissionsResponse = await fetch(
          `${API_BASE_URL}/permission/read`,
          { headers }
        );
        if (!permissionsResponse.ok) {
          throw new Error(`İcazələr yüklənmədi! Status: ${permissionsResponse.status}`);
        }
        const permissionsData = await permissionsResponse.json();
        setPermissionsList(
          permissionsData.map((p) => ({
            value: p.permissionName,
            label: p.permissionName.replace(/_/g, " "),
          }))
        );
      } catch (err) {
        console.error("İcazələr Sorğusu Xətası:", err);
        setError(`İcazələri yükləmə zamanı xəta baş verdi: ${err.message}`);
      } finally {
        setPermissionsLoading(false);
      }

      try {
        // Fetch specific admin info
        const workerInfoResponse = await fetch(
          `${API_BASE_URL}/add-worker/info/${id}`,
          { headers }
        );
        if (!workerInfoResponse.ok) {
          throw new Error(`İstifadəçi məlumatları yüklənmədi! Status: ${workerInfoResponse.status}`);
        }
        const workerInfoData = await workerInfoResponse.json();
        setFormData({
          username: workerInfoData.username || "",
          password: "",
          name: workerInfoData.name || "",
          surname: workerInfoData.surname || "",
          phone: workerInfoData.phone || "",
          permissions: workerInfoData.permissions || [],
        });
      } catch (err) {
        console.error("API Sorğu Xətası:", err);
        setError(`Xəta baş verdi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...imageUrls]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDeleteImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, value]
        : prev.permissions.filter((perm) => perm !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    const token = localStorage.getItem("refreshToken");
    if (!token) {
      toast.error("Avtorizasiya tokeni tapılmadı.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        id: id,
        username: formData.username,
        name: formData.name,
        surname: formData.surname,
        permissions: formData.permissions,
        phone: formData.phone,
        // password is only sent if a new value is provided
        ...(formData.password && { password: formData.password }),
      };

      const response = await fetch(
        `${API_BASE_URL}/add-worker/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        if (errorData) {
          setFormErrors(errorData);
        }
        const errorMessage = errorData.message || `HTTP xətası! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast.success("Admin uğurla yeniləndi");
      navigate("/admin-users");
    } catch (err) {
      console.error("API Sorğu Xətası:", err);
      toast.error(`Yenilənmə zamanı xəta baş verdi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || permissionsLoading) {
    return <div className="loading-state">Məlumatlar yüklənir...</div>;
  }

  if (error) {
    return <div className="error-state">Xəta: {error}</div>;
  }

  return (
    <div className="editAdminFormContainer">
      <form onSubmit={handleSubmit}>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">
            Status <span className="required">*</span>
          </label>
          <span className={`editAdminStatus active`}>Aktiv</span>
        </div>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">
            İstifadəçi adı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="editAdminField"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">Şifrə</label>
          <div className="editAdminPasswordBox">
            <input
              type={showPassword ? "text" : "password"}
              className={`editAdminField ${formErrors.password ? "input-error" : ""}`}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Şifrəni yeniləmək üçün daxil edin"
            />
            <span
              className="editAdminPasswordIcon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              role="button"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {formErrors.password && (
            <span className="error-message">{formErrors.password}</span>
          )}
        </div>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">
            Adı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="editAdminField"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">
            Soyadı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="editAdminField"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="editAdminFormRow">
          <label className="editAdminLabel">Mobil nömrə</label>
          <input
            type="tel"
            className={`editAdminField ${formErrors.phone ? "input-error" : ""}`}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {formErrors.phone && (
            <span className="error-message">{formErrors.phone}</span>
          )}
        </div>
        <div className="editAdminCheckboxBlock">
          <label className="editAdminLabel">İcazələri</label>
          <div className="editAdminCheckboxGroup">
            {permissionsList.map((perm) => (
              <label key={perm.value}>
                <input
                  type="checkbox"
                  value={perm.value}
                  checked={formData.permissions.includes(perm.value)}
                  onChange={handlePermissionChange}
                />{" "}
                {perm.label}
              </label>
            ))}
          </div>
        </div>
        <div className="editAdminFormRow editAdminImageUploadRow">
          <label className="editAdminLabel">Şəkil</label>
          <div className="editAdminPhotoWrapper">
            <div className="editAdminUploadContainer">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
                style={{ display: "none" }}
              />
              <button
                className="editAdminUploadButton"
                onClick={handleUploadClick}
                type="button"
              >
                <AddPhotoIcon />
                <span>Müvafiq sənədləri yükləyin</span>
              </button>
              {files.length > 0 && (
                <div className="editAdminImagePreviewContainer">
                  {files.map((file, index) => (
                    <div key={index} className="editAdminImagePreview">
                      <img
                        src={file}
                        alt={`file-${index}`}
                        onClick={() => handleImageClick(file)}
                      />
                      <button
                        className="editAdminDeleteButton"
                        onClick={() => handleDeleteImage(index)}
                        type="button"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedImage && (
          <div
            className="editAdminModalOverlay"
            onClick={() => setSelectedImage(null)}
          >
            <div className="editAdminModalContent">
              <img src={selectedImage} alt="full-size" />
            </div>
          </div>
        )}
        <div className="editAdminActions">
          <button
            type="button"
            className="editAdminCancelBtn"
            onClick={() => navigate("/admin-users")}
            disabled={isSubmitting}
          >
            İmtina et
          </button>
          <button
            type="submit"
            className="editAdminSaveBtn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yüklənir..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAdmin;