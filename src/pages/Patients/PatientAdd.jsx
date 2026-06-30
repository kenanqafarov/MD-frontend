import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/style/PatientsPage/addpatient.css";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import verifyButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import usePatientStore from "../../../stores/patiendStore";
import useBlackListResultStore from "../../../stores/blacklistReasonStore";
import usePriceCategoryStore from "../../../stores/priceCategoryStore";
import useSpecializationStore from "../../../stores/useSpecializationStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientAdd = () => {
  const navigate = useNavigate();
  const { addPatient } = usePatientStore();
  const { results: blacklistOptions, fetchResults: fetchBlacklistOptions } =
    useBlackListResultStore();
  const { categories: priceCategories, fetchCategories: fetchPriceCategories } =
    usePriceCategoryStore();
  const { specializations, fetchSpecializations } = useSpecializationStore();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    patronymic: "",
    finCode: "",
    genderStatus: "",
    dateOfBirth: "",
    priceCategoryName: "",
    specializationName: "",
    doctorId: null,
    isVip: false,
    isBlacklisted: false,
    blacklistCategory: "",
    phone: "",
    whatsapp: "",
    workPhone: "",
    homePhone: "",
    email: "",
    homeAddress: "",
    workAddress: "",
    recommender: "",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/general-calendar/read-doctors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDoctors(response.data);
      } catch (error) {
        console.error("Doktorları alarkən xəta:", error);
        toast.error("Doktor məlumatları yüklənərkən xəta baş verdi.");
      }
    };
    fetchAllData();
    fetchBlacklistOptions();
    fetchPriceCategories();
    fetchSpecializations();
  }, [fetchBlacklistOptions, fetchPriceCategories, fetchSpecializations]);

  const formatPhoneNumber = (value) => {
    const cleaned = ("" + value).replace(/\D/g, "");
    let formattedNumber = "";
    if (cleaned.length > 0) {
      formattedNumber += `(${cleaned.substring(0, 3)}`;
    }
    if (cleaned.length >= 4) {
      formattedNumber += `)-${cleaned.substring(3, 6)}`;
    }
    if (cleaned.length >= 7) {
      formattedNumber += `-${cleaned.substring(6, 10)}`;
    }
    return formattedNumber;
  };

  const formatDateInput = (value) => {
    const cleaned = value.replace(/[^\d-]/g, "");
    if (!cleaned) return "";

    let formattedDate = cleaned;

    if (cleaned.length > 4 && cleaned.charAt(4) !== "-") {
      formattedDate = `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
    }

    if (cleaned.length > 7 && formattedDate.charAt(7) !== "-") {
      formattedDate = `${formattedDate.substring(
        0,
        7
      )}-${formattedDate.substring(7)}`;
    }

    if (formattedDate.length > 10) {
      formattedDate = formattedDate.substring(0, 10);
    }

    return formattedDate;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "checkbox") {
      newValue = checked;
    } else if (name === "finCode") {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      // Clear error when user types
      if (errors.finCode) {
        setErrors((prev) => ({ ...prev, finCode: undefined }));
      }
    } else if (["phone", "whatsapp", "workPhone", "homePhone"].includes(name)) {
      newValue = formatPhoneNumber(value);
    } else if (name === "dateOfBirth") {
      newValue = formatDateInput(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Ad tələb olunur";
    if (!formData.surname) newErrors.surname = "Soyad tələb olunur";
    if (!formData.patronymic) newErrors.patronymic = "Ata adı tələb olunur";
    if (!formData.genderStatus)
      newErrors.genderStatus = "Cinsiyyət tələb olunur";
    if (!formData.priceCategoryName)
      newErrors.priceCategoryName = "Qiymət kateqoriyası tələb olunur";
    if (!formData.doctorId) newErrors.doctorId = "Həkimi seçin";
    if (!formData.specializationName)
      newErrors.specializationName = "İxtisası seçin";

    const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/;
    if (!formData.phone) newErrors.phone = "Mobil nömrə tələb olunur";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Nömrə formatı (XXX)-XXX-XXXX şəklində olmalıdır";

    if (formData.workPhone && !phoneRegex.test(formData.workPhone))
      newErrors.workPhone = "Nömrə formatı (XXX)-XXX-XXXX şəklində olmalıdır";
    if (formData.homePhone && !phoneRegex.test(formData.homePhone))
      newErrors.homePhone = "Nömrə formatı (XXX)-XXX-XXXX şəklində olmalıdır";
    if (formData.whatsapp && !phoneRegex.test(formData.whatsapp))
      newErrors.whatsapp = "Nömrə formatı (XXX)-XXX-XXXX şəklində olmalıdır";

    if (formData.dateOfBirth && formData.dateOfBirth !== "") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = "Tarix formatı YYYY-MM-DD şəklində olmalıdır";
      } else {
        const date = new Date(formData.dateOfBirth);
        if (isNaN(date.getTime())) {
          newErrors.dateOfBirth = "Etibarlı tarix daxil edin";
        }
      }
    }

    // FIN code validation - only validate format if provided
    if (formData.finCode && formData.finCode !== "") {
      if (!/^[A-Z0-9]{7}$/.test(formData.finCode)) {
        newErrors.finCode =
          "FIN kod yalnız böyük hərflər və rəqəmlərdən ibarət 7 simvol olmalıdır";
      }
    }

    if (formData.isBlacklisted && !formData.blacklistCategory)
      newErrors.blacklistCategory = "Qara siyahı kateqoriyası seçin";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Göndərilən formData:", formData);

    if (!validateForm()) {
      toast.error(
        "Zəhmət olmasa, tələb olunan sahələri doldurun və formatları düzəldin.",
        { toastId: "validation-error" }
      );
      return;
    }

    const dataToSend = {
      ...formData,
      specializationName: formData.specializationName,
      doctorId: formData.doctorId ? formData.doctorId.toString() : "",
      priceCategoryName: formData.priceCategoryName,
      blacklistCategory:
        formData.isBlacklisted && formData.blacklistCategory
          ? parseInt(formData.blacklistCategory, 10)
          : null,
      finCode: formData.finCode === "" ? null : formData.finCode,
    };

    dataToSend.dateOfBirth =
      formData.dateOfBirth === "" ? null : formData.dateOfBirth;
    dataToSend.email = formData.email === "" ? null : formData.email;
    dataToSend.homeAddress =
      formData.homeAddress === "" ? null : formData.homeAddress;
    dataToSend.workAddress =
      formData.workAddress === "" ? null : formData.workAddress;
    dataToSend.recommender =
      formData.recommender === "" ? null : formData.recommender;

    setLoading(true);
    try {
      const response = await addPatient(dataToSend);
      console.log("Pasiyent uğurla əlavə olundu:", response);
      toast.success("Pasiyent uğurla əlavə olundu!");
      
      // Cache-i temizlə ki yeni pasiyent göstərilsin
      localStorage.removeItem("patients_cache");
      localStorage.removeItem("patients_cache_timestamp");
      
      setTimeout(() => {
        navigate("/patients");
      }, 1500);
    } catch (err) {
      console.error("Xəta baş verdi:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || "Xəta baş verdi. Məlumatları yoxlayın.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patientsGroupWrapper">
      <ToastContainer position="top-right" autoClose={2000} />
      <form onSubmit={handleSubmit} className="patientsGroupContainer">
        <div className="patientsGroupLeft">
          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Adı <span className="patientsGroupRequired">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={errors.name || "Ad daxil edin"}
              className={`patientsGroupInputText placeholder:text-xs ${
                errors.name ? "border-red-500 border-2" : ""
              } ${
                errors.name && !formData.name.trim()
                  ? "bg-red-50 placeholder-red-500"
                  : ""
              }`}
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Soyadı <span className="patientsGroupRequired">*</span>
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder={errors.surname || "Soyad daxil edin"}
              className={`patientsGroupInputText placeholder:text-xs ${
                errors.surname ? "border-red-500 border-2" : ""
              } ${
                errors.surname && !formData.surname.trim()
                  ? "bg-red-50 placeholder-red-500"
                  : ""
              }`}
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Ata adı <span className="patientsGroupRequired">*</span>
            </label>
            <input
              type="text"
              name="patronymic"
              value={formData.patronymic}
              onChange={handleChange}
              placeholder={errors.patronymic || "Ata adı daxil edin"}
              className={`patientsGroupInputText placeholder:text-xs ${
                errors.patronymic ? "border-red-500 border-2" : ""
              } ${
                errors.patronymic && !formData.patronymic.trim()
                  ? "bg-red-50 placeholder-red-500"
                  : ""
              }`}
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Fin kodu</label>
            <div>
               {errors.finCode && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.finCode}
              </span>
            )}
            <input
              type="text"
              name="finCode"
              value={formData.finCode}
              onChange={handleChange}
              maxLength={7}
              placeholder="Fin kod daxil edin (məs: ABC1234)"
              className={`patientsGroupInputText placeholder:text-xs ${
                errors.finCode ? "border-red-500 border-2 bg-red-50" : ""
              }`}
            />
           
            </div>
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Cinsiyyət <span className="patientsGroupRequired">*</span>
            </label>
            <div className="patientsGroupGender">
              <label
                className={`${
                  errors.genderStatus && !formData.genderStatus
                    ? "border-2 border-red-500 bg-red-50 px-3 py-2 rounded"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="genderStatus"
                  value="MAN"
                  checked={formData.genderStatus === "MAN"}
                  onChange={handleChange}
                  className="patientsGroupCheckbox"
                />{" "}
                Kişi
              </label>
              <label
                className={`${
                  errors.genderStatus && !formData.genderStatus
                    ? "border-2 border-red-500 bg-red-50 px-3 py-2 rounded"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="genderStatus"
                  value="WOMAN"
                  checked={formData.genderStatus === "WOMAN"}
                  onChange={handleChange}
                  className="patientsGroupCheckbox"
                />{" "}
                Qadın
              </label>
            </div>
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Doğum tarixi</label>
            <input
              type="text"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`patientsGroupInputText text-xs ${
                errors.dateOfBirth ? "border-red-500 border-2 bg-red-50" : ""
              }`}
              placeholder="YYYY-MM-DD"
            />
            {errors.dateOfBirth && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.dateOfBirth}
              </span>
            )}
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Qiymət kateqoriyası{" "}
              <span className="patientsGroupRequired">*</span>
            </label>
            <select
              name="priceCategoryName"
              value={formData.priceCategoryName}
              onChange={handleChange}
              className={`patientsGroupSelect text-xs ${
                errors.priceCategoryName ? "border-red-500 border-2" : ""
              } ${
                errors.priceCategoryName && !formData.priceCategoryName
                  ? "bg-red-50"
                  : ""
              }`}
              style={
                errors.priceCategoryName && !formData.priceCategoryName
                  ? { color: "#ef4444" }
                  : { color: "#000" }
              }
            >
              <option
                value=""
                style={{
                  color:
                    errors.priceCategoryName && !formData.priceCategoryName
                      ? "#ef4444"
                      : "#9ca3af",
                }}
              >
                {errors.priceCategoryName || "seçin"}
              </option>
              {priceCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.name}
                  style={{ color: "#000" }}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              İxtisası <span className="patientsGroupRequired">*</span>
            </label>
            <select
              name="specializationName"
              value={formData.specializationName}
              onChange={handleChange}
              className={`patientsGroupSelect text-xs ${
                errors.specializationName ? "border-red-500 border-2" : ""
              } ${
                errors.specializationName && !formData.specializationName
                  ? "bg-red-50"
                  : ""
              }`}
              style={
                errors.specializationName && !formData.specializationName
                  ? { color: "#ef4444" }
                  : { color: "#000" }
              }
            >
              <option
                value=""
                style={{
                  color:
                    errors.specializationName && !formData.specializationName
                      ? "#ef4444"
                      : "#9ca3af",
                }}
              >
                {errors.specializationName || "seçin"}
              </option>
              {specializations.map((spec) => (
                <option
                  key={spec.id}
                  value={spec.name}
                  style={{ color: "#000" }}
                >
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Həkim <span className="patientsGroupRequired">*</span>
            </label>
            <select
              name="doctorId"
              value={formData.doctorId || ""}
              onChange={handleChange}
              className={`patientsGroupSelect text-xs ${
                errors.doctorId ? "border-red-500 border-2" : ""
              } ${errors.doctorId && !formData.doctorId ? "bg-red-50" : ""}`}
              style={
                errors.doctorId && !formData.doctorId
                  ? { color: "#ef4444" }
                  : { color: "#000" }
              }
            >
              <option
                value=""
                style={{
                  color:
                    errors.doctorId && !formData.doctorId
                      ? "#ef4444"
                      : "#9ca3af",
                }}
              >
                {errors.doctorId || "Həkim seçin"}
              </option>
              {doctors.map((doctor) => (
                <option
                  key={doctor.doctorId}
                  value={doctor.doctorId}
                  style={{ color: "#000" }}
                >
                  {doctor.name} {doctor.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Qara siyahı</label>
            <div className="patientsGroupBlacklist">
              <input
                type="checkbox"
                name="isBlacklisted"
                checked={formData.isBlacklisted}
                onChange={handleChange}
                className="patientsGroupCheckbox"
              />
              <select
                name="blacklistCategory"
                value={formData.blacklistCategory}
                onChange={handleChange}
                className={`patientsGroupBlacklistSelect text-xs ${
                  errors.blacklistCategory
                    ? "border-red-500 border-2 bg-red-50 text-xs"
                    : ""
                }`}
                disabled={!formData.isBlacklisted}
              >
                <option value="">seçin</option>
                {blacklistOptions.data &&
                  blacklistOptions.data.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.statusName}
                    </option>
                  ))}
              </select>
            </div>
            {errors.blacklistCategory && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.blacklistCategory}
              </span>
            )}
          </div>
        </div>

        <div className="patientsGroupRight">
          <div className="patientsGroupField">
            <label className="patientsGroupLabel">
              Mobil nömrə 1 <span className="patientsGroupRequired">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={errors.phone || "(XXX)-XXX-XXXX"}
              className={`patientsGroupInputText placeholder:text-xs ${
                errors.phone ? "border-red-500 border-2" : ""
              } ${
                errors.phone && !formData.phone.trim()
                  ? "bg-red-50 placeholder-red-500"
                  : "placeholder-gray-400"
              }`}
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Whatsapp</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className={`patientsGroupInputText text-xs ${
                errors.whatsapp ? "border-red-500 border-2 bg-red-50" : ""
              }`}
              placeholder="(XXX)-XXX-XXXX"
            />
            {errors.whatsapp && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.whatsapp}
              </span>
            )}
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">İş nömrəsi</label>
            <input
              type="tel"
              name="workPhone"
              value={formData.workPhone}
              onChange={handleChange}
              className={`patientsGroupInputText text-xs ${
                errors.workPhone ? "border-red-500 border-2 bg-red-50" : ""
              }`}
              placeholder="(XXX)-XXX-XXXX"
            />
            {errors.workPhone && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.workPhone}
              </span>
            )}
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Ev nömrəsi</label>
            <input
              type="tel"
              name="homePhone"
              value={formData.homePhone}
              onChange={handleChange}
              className={`patientsGroupInputText text-xs ${
                errors.homePhone ? "border-red-500 border-2 bg-red-50" : ""
              }`}
              placeholder="(XXX)-XXX-XXXX"
            />
            {errors.homePhone && (
              <span className="text-red-600 text-xs mt-1 block">
                {errors.homePhone}
              </span>
            )}
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">E-poçt</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="patientsGroupInputText text-xs"
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Ev ünvanı</label>
            <input
              type="text"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              className="patientsGroupInputText text-xs"
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">İş ünvanı</label>
            <input
              type="text"
              name="workAddress"
              value={formData.workAddress}
              onChange={handleChange}
              className="patientsGroupInputText text-xs"
            />
          </div>

          <div className="patientsGroupField">
            <label className="patientsGroupLabel">Tövsiyə edən şəxs</label>
            <input
              type="text"
              name="recommender"
              value={formData.recommender}
              onChange={handleChange}
              className="patientsGroupInputText text-xs"
            />
          </div>
        </div>
      </form>

      <div className="submitAddPatientForm">
        <button
          type="button"
          className="addPatientCancelButton"
          onClick={() => {
            setErrors({});
            setFormData({
              name: "",
              surname: "",
              patronymic: "",
              finCode: "",
              genderStatus: "",
              dateOfBirth: "",
              priceCategoryName: "",
              specializationName: "",
              doctorId: null,
              isVip: false,
              isBlacklisted: false,
              blacklistCategory: "",
              phone: "",
              whatsapp: "",
              workPhone: "",
              homePhone: "",
              email: "",
              homeAddress: "",
              workAddress: "",
              recommender: "",
            });
            navigate(-1);
          }}
        >
          <img
            src={cancelButton}
            className="addPatientCancelBTN"
            alt="Cancel"
          />
          İmtina et
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="addPatientVerifyButton"
          disabled={loading}
        >
          <img src={verifyButton} className="addPatientVerifyBTN" alt="Save" />
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Yüklənir...
            </>
          ) : (
            "Yadda saxla"
          )}
        </button>
      </div>
    </div>
  );
};

export default PatientAdd;