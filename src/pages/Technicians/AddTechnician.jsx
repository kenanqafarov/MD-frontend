import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Technicians/addtechnician.css";
import AddPhotoIcon from "../../assets/icons/AddPhoto";
import CloseIcon from "../../assets/icons/Close";
import useTechnicianStore from "../../../stores/technicianStore";
import usePermissionStore from "../../../stores/permissionStore";

function AddTechnician({ onClose }) {
  const { addTechnician } = useTechnicianStore();
  const { permissions: rawPermissions, fetchPermissions } = usePermissionStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    finCode: "",
    dateOfBirth: "",
    phone: "(000)-000-00-00",
    genderStatus: "MAN",
    patronymic: "",
    email: "",
    phone2: "(000)-000-00-00",
    phone3: "(000)-000-00-00",
    homePhone: "(000)-000-00-00",
    address: "",
    authorities: [],
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    finCode: "",
    phone: "",
    patronymic: "",
  });

  const authorityOptions = rawPermissions
    .filter(permission => permission.status === "ACTIVE")
    .map((permission) => ({
      value: permission.id.toString(),
      label: permission.permissionName,
    }));

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        await fetchPermissions();
        setPermissionsLoading(false);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setPermissionsLoading(false);
      }
    };
    loadPermissions();
  }, [fetchPermissions]);

  const handleDeleteImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...imageUrls]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7)
      return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8, 10)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      genderStatus: e.target.value === "male" ? "MAN" : "WOMAN",
    }));
  };

  const handleAuthorityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          authorities: [...prev.authorities, value],
        };
      } else {
        return {
          ...prev,
          authorities: prev.authorities.filter((auth) => auth !== value),
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "İstifadəçi adı mütləq doldurulmalıdır";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Şifrə mütləq doldurulmalıdır";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Ad mütləq doldurulmalıdır";
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = "Soyad mütləq doldurulmalıdır";
    }
    
    if (!formData.patronymic.trim()) {
      newErrors.patronymic = "Ata adı mütləq doldurulmalıdır";
    }
    
    if (!formData.finCode.trim()) {
      newErrors.finCode = "Fin kodu mütləq doldurulmalıdır";
    }
    
    if (!formData.phone.trim() || formData.phone === "(000)-000-00-00") {
      newErrors.phone = "Mobil nömrə mütləq doldurulmalıdır";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.warn("Zəhmət olmasa bütün mütləq sahələri doldurun");
      return;
    }

    // Doğum tarixi validasiyası
    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      const year = date.getFullYear();
      if (year < 1800 || year > 3000) {
        toast.warn("Doğum tarixi ilini 1800 ilə 3000 arasında daxil edin.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const profileImage =
        files.length > 0
          ? files[0]
          : `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
              formData.name
            )}+${encodeURIComponent(formData.surname)}`;

      const technicianData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        finCode: formData.finCode,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        genderStatus: formData.genderStatus,
        patronymic: formData.patronymic,
        email: formData.email,
        phone2: formData.phone2 === "(000)-000-00-00" ? "" : formData.phone2,
        phone3: formData.phone3 === "(000)-000-00-00" ? "" : formData.phone3,
        homePhone:
          formData.homePhone === "(000)-000-00-00" ? "" : formData.homePhone,
        address: formData.address,
        authorities: formData.authorities,
        profileImage,
      };

      await addTechnician(technicianData);

      toast.success("İşçi uğurla əlavə edildi!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/technicians");

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("İşçi əlavə edilərkən xəta:", error);
      toast.error(
        `Xəta: ${error.response?.data?.message || "İşçi əlavə edilərkən xəta baş verdi"}`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addTechnicianFormContainer">
      <form onSubmit={handleSubmit}>
        <div className="addTechFormPart">
          <div className="addTechnicianLeft">
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                İstifadəçi adı <span className="requiredStar">*</span>
              </p>
              <input
                type="text"
                className={`addTechnicianInput ${errors.username ? 'placeholder:!text-red-400' : ''}`}
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={errors.username || "İstifadəçi adı"}
                style={{ borderColor: errors.username ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Adı <span className="requiredStar">*</span>
              </p>
              <input
                type="text"
                className={`addTechnicianInput ${errors.name ? 'placeholder:!text-red-500' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={errors.name || "Ad"}
                style={{ borderColor: errors.name ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Soyadı <span className="requiredStar">*</span>
              </p>
              <input
                type="text"
                className={`addTechnicianInput ${errors.surname ? 'placeholder:!text-red-500' : ''}`}
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                placeholder={errors.surname || "Soyad"}
                style={{ borderColor: errors.surname ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Ata adı <span className="requiredStar">*</span>
              </p>
              <input
                type="text"
                className={`addTechnicianInput ${errors.patronymic ? 'placeholder:!text-red-500' : ''}`}
                name="patronymic"
                value={formData.patronymic}
                onChange={handleInputChange}
                placeholder={errors.patronymic || "Ata adı"}
                style={{ borderColor: errors.patronymic ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputGender">
              <p className="leftPartInputTitle">
                Cinsiyyət <span className="requiredStar">*</span>
              </p>
              <div className="genderOptions">
                <label className="genderLabel">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.genderStatus === "MAN"}
                    onChange={handleGenderChange}
                  />
                  Kişi
                </label>
                <label className="genderLabel">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.genderStatus === "WOMAN"}
                    onChange={handleGenderChange}
                  />
                  Qadın
                </label>
              </div>
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Fin kodu <span className="requiredStar">*</span>
              </p>
              <input
                type="text"
                className={`addTechnicianInput ${errors.finCode ? 'placeholder:!text-red-500' : ''}`}
                name="finCode"
                value={formData.finCode}
                onChange={handleInputChange}
                placeholder={errors.finCode || "Fin kodu"}
                style={{ borderColor: errors.finCode ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Şifrə <span className="requiredStar">*</span>
              </p>
              <input
                type="password"
                className={`addTechnicianInput ${errors.password ? 'placeholder:!text-red-500' : ''}`}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={errors.password || "Şifrə"}
                style={{ borderColor: errors.password ? '#ef4444' : '' }}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">Doğum tarixi</p>
              <input
                type="date"
                className="addTechnicianInput"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">
                Mobil nömrə 1 <span className="requiredStar">*</span>
              </p>
              <input
                type="tel"
                className={`addTechnicianInput ${errors.phone ? 'placeholder:!text-red-500' : ''}`}
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={errors.phone || "(000)-000-00-00"}
                style={{ borderColor: errors.phone ? '#ef4444' : '' }}
              />
            </div>
          </div>

          <div className="addTechnicianRight">
            <div className="leftPartInputData">
              <p className="leftPartInputTitle">Mobil nömrə 2</p>
              <input
                type="tel"
                className="addTechnicianInput"
                name="phone2"
                value={formData.phone2}
                onChange={handlePhoneChange}
                placeholder="(000)-000-00-00"
              />
            </div>

            <div className="leftPartInputData">
              <p className="leftPartInputTitle">Mobil nömrə 3</p>
              <input
                type="tel"
                className="addTechnicianInput"
                name="phone3"
                value={formData.phone3}
                onChange={handlePhoneChange}
                placeholder="(000)-000-00-00"
              />
            </div>

            <div className="leftPartInputData">
              <p className="leftPartInputTitle">Ev telefonu</p>
              <input
                type="tel"
                className="addTechnicianInput"
                name="homePhone"
                value={formData.homePhone}
                onChange={handlePhoneChange}
                placeholder="(000)-000-00-00"
              />
            </div>

            <div className="leftPartInputData">
              <p className="leftPartInputTitle">E-poçt ünvanı</p>
              <input
                type="email"
                className="addTechnicianInput"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-poçt ünvanı"
              />
            </div>

            <div className="leftPartInputData">
              <p className="leftPartInputTitle">Ünvan</p>
              <input
                type="text"
                className="addTechnicianInput"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ünvan"
              />
            </div>

            <div className="leftPartInputData">
              <p className="leftPartInputTitle">İcazələr</p>
              <div className="addTechnicianCheckboxGroup">
                {permissionsLoading ? (
                  <div>İcazələr yüklənir...</div>
                ) : authorityOptions.length === 0 ? (
                  <div>İcazə tapılmadı</div>
                ) : (
                  authorityOptions.map((option) => (
                    <label key={option.value}>
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formData.authorities.includes(option.value)}
                        onChange={handleAuthorityChange}
                      />
                      {option.label}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="addTechnicianUpload">
          <p className="leftPartInputTitle">Şəkil</p>
          <div className="uploadContainer">
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
              className="uploadButton"
              onClick={handleUploadClick}
              type="button"
            >
              <AddPhotoIcon />
              <span>Şəkil yüklə</span>
            </button>

            {files.length > 0 && (
              <div className="imagePreviewContainer">
                {files.map((file, index) => (
                  <div key={index} className="imagePreview">
                    <img
                      src={file}
                      alt={`file-${index}`}
                      onClick={() => handleImageClick(file)}
                    />
                    <button
                      className="deleteButton"
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

        {selectedImage && (
          <div className="modalOverlay" onClick={() => setSelectedImage(null)}>
            <div className="modalContent">
              <img src={selectedImage} alt="full-size" />
            </div>
          </div>
        )}

        <div className="addTechnicianActions">
          <button
            type="button"
            className="addTechnicianCancelBtn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            İmtina et
          </button>
          <button
            type="submit"
            className="addTechnicianSaveBtn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yüklənir..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTechnician;