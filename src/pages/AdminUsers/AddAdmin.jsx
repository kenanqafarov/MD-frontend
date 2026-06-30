import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/AdminUsers/addadmin.css";
import AddPhotoIcon from "../../assets/icons/AddPhoto";
import CloseIcon from "../../assets/icons/Close";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PERMISSIONS = [
  { value: "FULL_PERMISSION", label: "TAM İCAZƏ" },
  { value: "RECEPTIONIST", label: "RESEPSIONIST" },
  { value: "NURSE", label: "TİBB BACISI" },
  { value: "DENTAL_TECHNICIAN", label: "DİŞ TEXNİKLƏRİ" },
  { value: "FINANCIAL_REPORT", label: "MALİYYƏ HESABAT" },
  { value: "WAREHOUSE", label: "ANBAR" },
  { value: "DOCTOR_FULL", label: "Həkim tam icazə" },
  { value: "DOCTOR_LIMITED", label: "Həkim limitli" },
];

function AddAdmin() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    permissions: [],
  });

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
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, value],
        };
      } else {
        return {
          ...prev,
          permissions: prev.permissions.filter((perm) => perm !== value),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success("Admin uğurla əlavə edildi");
        navigate("/admin-users");
      }, 1000);
    } catch (error) {
      toast.error("Xəta baş verdi");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addAdminFormContainer">
      <form onSubmit={handleSubmit}>
        <div className="addAdminFormRow">
          <label className="addAdminLabel">
            İstifadəçi adı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="addAdminField"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="addAdminFormRow">
          <label className="addAdminLabel">Şifrə</label>
          <div className="addAdminPasswordBox">
            <input
              type={showPassword ? "text" : "password"}
              className="addAdminField"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <span
              className="addAdminPasswordIcon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              role="button"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="addAdminFormRow">
          <label className="addAdminLabel">
            Adı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="addAdminField"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="addAdminFormRow">
          <label className="addAdminLabel">
            Soyadı <span className="required">*</span>
          </label>
          <input
            type="text"
            className="addAdminField"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="addAdminFormRow">
          <label className="addAdminLabel">Mobil nömrə</label>
          <input
            type="tel"
            className="addAdminField"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="addAdminCheckboxBlock">
          <label className="addAdminLabel">İcazələri</label>
          <div className="addAdminCheckboxGroup">
            {PERMISSIONS.map((perm) => (
              <label key={perm.value}>
                <input
                  type="checkbox"
                  value={perm.value}
                  checked={formData.permissions.includes(perm.value)}
                  onChange={handlePermissionChange}
                /> {perm.label}
              </label>
            ))}
          </div>
        </div>
        <div className="addAdminFormRow addAdminImageUploadRow">
          <label className="addAdminLabel">Şəkil</label>
          <div className="addAdminPhotoWrapper">
            <div className="addAdminUploadContainer">
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
                className="addAdminUploadButton"
                onClick={handleUploadClick}
                type="button"
              >
                <AddPhotoIcon />
                <span>Müvafiq sənədləri yükləyin</span>
              </button>
              {files.length > 0 && (
                <div className="addAdminImagePreviewContainer">
                  {files.map((file, index) => (
                    <div key={index} className="addAdminImagePreview">
                      <img
                        src={file}
                        alt={`file-${index}`}
                        onClick={() => handleImageClick(file)}
                      />
                      <button
                        className="addAdminDeleteButton"
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
          <div className="addAdminModalOverlay" onClick={() => setSelectedImage(null)}>
            <div className="addAdminModalContent">
              <img src={selectedImage} alt="full-size" />
            </div>
          </div>
        )}
        <div className="addAdminActions">
          <button
            type="button"
            className="addAdminCancelBtn"
            onClick={() => navigate("/admin-users")}
            disabled={isSubmitting}
          >
            İmtina et
          </button>
          <button
            type="submit"
            className="addAdminSaveBtn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yüklənir..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAdmin;
