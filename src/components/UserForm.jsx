import React, { useState, useEffect } from "react";
import "../assets/style/form.css";
import ProfileImage from "./ProfileImage";
import { LuPenLine } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "./Modal";
import CustomDropdown from "./CustomDropdown";
import useWorkerStore from "../../stores/workerStore";
import usePermissionStore from "../../stores/permissionStore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

function UserForm({ mode: initialMode, userData = null, onSubmit, onDelete }) {
  const { addWorker } = useWorkerStore();
  const {
    permissions: rawPermissions,
    fetchPermissions,
    loading: permissionsLoading,
  } = usePermissionStore();
  const [mode, setMode] = useState(initialMode);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const permissionList = rawPermissions
    .filter((permission) => permission.status === "ACTIVE")
    .map((permission) => ({
      label: permission.permissionName,
      value: permission.id.toString(),
      name: permission.permissionName,
    }));

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const getDefaultPermissions = () => {
    if (!userData || !userData.permissions) return [];
    return userData.permissions.map((permissionName) => {
      const permission = rawPermissions.find(
        (p) => p.permissionName === permissionName
      );
      return permission ? permission.id.toString() : permissionName;
    });
  };

  const validationSchema = yup.object().shape({
    username: yup
      .string()
      .min(3, "İstifadəçi Adı 3-20 simvol arasında olmalıdır")
      .max(20, "İstifadəçi Adı 3-20 simvol arasında olmalıdır")
      .required("İstifadəçi adı tələb olunur"),
    password:
      mode === "view"
        ? yup.string()
        : yup
            .string()
            .matches(
              /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$/,
              "Şifrə minimum 8 simvol olmalı, böyük/kiçik hərf, rəqəm və xüsusi simvol içerməlidir"
            )
            .required("Şifrə tələb olunur"),
    name: yup
      .string()
      .min(3, "Ad 3-20 simvol arasında olmalıdır")
      .max(20, "Ad 3-20 simvol arasında olmalıdır")
      .required("Ad tələb olunur"),
    surname: yup
      .string()
      .min(3, "Soyad 3-20 simvol arasında olmalıdır")
      .max(20, "Soyad 3-20 simvol arasında olmalıdır")
      .required("Soyad tələb olunur"),
    patronymic: yup
      .string()
      .min(3, "Ata Adı 3-20 simvol arasında olmalıdır")
      .max(20, "Ata Adı 3-20 simvol arasında olmalıdır")
      .required("Ata Adı tələb olunur"),
    finCode: yup
      .string()
      .nullable()
      .matches(
        /^$|^[A-Z0-9]{7}$/,
        "FIN kod boş və ya yalnız böyük hərflər və rəqəmlərdən ibarət 7 simvol olmalıdır"
      ),
    genderStatus: yup.string().required("Cinsiyyət seçilməlidir"),
    dateOfBirth: yup
      .date()
      .min("1800-01-01", "Doğum tarixi 1800-cü ildən əvvəl ola bilməz")
      .max("3000-12-31", "Doğum tarixi 3000-ci ildən sonra ola bilməz")
      .required("Doğum tarixi tələb olunur"),
    phone: yup
      .string()
      .matches(
        /^\(\d{3}\)-\d{3}-\d{2}-\d{2}$/,
        "Telefon nömrəsini (000)-000-00-00 formatında daxil edin"
      )
      .required("Telefon nömrəsi tələb olunur"),
    phone2:
      mode === "create"
        ? yup
            .string()
            .matches(
              /^\(\d{3}\)-\d{3}-\d{2}-\d{2}$/,
              "Telefon nömrəsini (000)-000-00-00 formatında daxil edin"
            )
            .required("Mobil nömrə 2 tələb olunur")
        : yup.string().nullable(),
    homePhone: yup
      .string()
      .nullable()
      .test(
        "homePhone-format",
        "Telefon nömrəsini (000)-000-00-00 formatında daxil edin",
        function (value) {
          if (!value) return true;
          return /^\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(value);
        }
      ),
    phone3: yup
      .string()
      .nullable()
      .test(
        "phone3-format",
        "Telefon nömrəsini (000)-000-00-00 formatında daxil edin",
        function (value) {
          if (!value) return true;
          return /^\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(value);
        }
      ),
    email: yup
      .string()
      .nullable()
      .matches(
        /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Düzgün e-poçt ünvanı daxil edin"
      ),
    address: yup.string().nullable(),
    experience: yup
      .number()
      .nullable()
      .typeError("Təcrübə rəqəm olmalıdır"),
    degree: yup.string().nullable(),
    permissions:
      mode !== "view"
        ? yup.array().min(1, "Ən azı bir icazə seçilməlidir")
        : yup.array(),
    colorCode: yup.string().required("Rəng kodu tələb olunur"),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
      name: "",
      surname: "",
      patronymic: "",
      finCode: "",
      colorCode: "#ffffff",
      genderStatus: "",
      dateOfBirth: "",
      phone: "",
      phone2: "",
      homePhone: "",
      phone3: "",
      email: "",
      address: "",
      degree: "",
      experience: 0,
      permissions: [],
    },
  });

  // Reset form when userData changes (async load fix)
  useEffect(() => {
    if (userData) {
      reset({
        username: userData.username || "",
        password: "",
        name: userData.name || "",
        surname: userData.surname || "",
        patronymic: userData.patronymic || "",
        finCode: userData.finCode || "",
        colorCode: userData.colorCode || "#ffffff",
        genderStatus: userData.genderStatus || "",
        dateOfBirth: userData.dateOfBirth || "",
        degree: userData.degree || "",
        phone: userData.phone || "",
        phone2: userData.phone2 || "",
        phone3: userData.phone3 || "",
        homePhone: userData.homePhone || "",
        email: userData.email || "",
        address: userData.address || "",
        experience: userData.experience ?? 0,
        permissions: getDefaultPermissions(),
      });
    }
  }, [userData]);

  const handleEditButton = () => setMode("edit");
  const handleCancelButton = () =>
    mode === "edit" ? setMode("view") : navigate(-1);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  const handleFormSubmit = async (data) => {
    setErrorMessage(null);

    const permissionsWithNames = data.permissions.map((permissionId) => {
      const permission = rawPermissions.find(
        (p) => p.id.toString() === permissionId
      );
      return permission ? permission.permissionName : permissionId;
    });

    const transformedData = {
        username: data.username || "",
        password: data.password || "",
        name: data.name || "",
        surname: data.surname || "",
        patronymic: data.patronymic || "",
        finCode: data.finCode || "",
        colorCode: (data.colorCode && data.colorCode.trim() !== "") ? data.colorCode : "#ffffff",
        genderStatus: data.genderStatus || "",
        dateOfBirth: data.dateOfBirth || "",
        degree: data.degree || "",
        phone: data.phone || "",
        phone2: data.phone2 || "",
        phone3: data.phone3 || "",
        homePhone: data.homePhone || "",
        email: data.email || "",
        address: (data.address && data.address.trim() !== "") ? data.address : "",
        experience: (data.experience !== undefined && data.experience !== null && data.experience !== "") ? Number(data.experience) : 0,
        permissions: permissionsWithNames,
      };

    console.log("🔍 Transformasyon əvvəl (data):", data);
    console.log("🔍 Transformasyon sonra (transformedData):", JSON.stringify(transformedData, null, 2));

    try {
      if (mode === "edit") {
        const updateData = Object.keys(transformedData).reduce((acc, key) => {
          if (
            JSON.stringify(transformedData[key]) !==
            JSON.stringify(userData[key])
          ) {
            acc[key] = transformedData[key];
          }
          return acc;
        }, {});

        // password həmişə göndərilməlidir - backend tələb edir
        updateData.password = transformedData.password;

        await onSubmit(updateData);
      } else {
        await onSubmit(transformedData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      console.error("Error details:", error.response);
      const apiErrorMessage =
        error?.response?.message ||
        "Xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.";
      setErrorMessage(apiErrorMessage);
    }
  };

  return (
    <div className="main-form-container">
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Əminsinizmi?"
        message="İşçi silinəcək!"
        onConfirm={onDelete}
      />
      <h3 className="main-form-title">
        {mode === "create"
          ? "İşçi əlavə et"
          : mode === "edit"
          ? "İşçi məlumatlarını yenilə"
          : "İşçi məlumatları"}
      </h3>
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="main-form" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className={`${mode === "view" ? "profile-buttons" : ""}`}>
          <ProfileImage userId={watch("username")} mode={mode} />
          {mode === "view" && (
            <div className="profile-button-group">
              <button
                type="button"
                className="color-success"
                onClick={handleEditButton}>
                <LuPenLine className="color-success" />
                Redaktə et
              </button>
              <button
                type="button"
                className="color-danger"
                onClick={() => setShowModal(true)}>
                <FaRegTrashAlt className="color-danger" />
                Sil
              </button>
            </div>
          )}
        </div>
        <div className="input-container">
          <div className="left">
            <div className="main-form-group">
              <label htmlFor="username">
                İstifadəçi adı <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                placeholder={
                  errors.username
                    ? errors.username.message
                    : "İstifadəçi adını daxil edin"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.username && !watch("username")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            {(mode === "create" || mode === "edit") && (
              <div className="main-form-group password-field-group">
                <label htmlFor="password">
                  Şifrə <span className="text-red-500">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder={
                      errors.password
                        ? errors.password.message
                        : "Şifrəni daxil edin"
                    }
                    className={
                      errors.password && !watch("password")
                        ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                        : ""
                    }
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={togglePasswordVisibility}>
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </span>
                </div>
              </div>
            )}

            <div className="main-form-group">
              <label htmlFor="name">
                Ad <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder={
                  errors.name ? errors.name.message : "Adı daxil edin"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.name && !watch("name")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="surname">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input
                id="surname"
                type="text"
                {...register("surname")}
                placeholder={
                  errors.surname ? errors.surname.message : "Soyadı daxil edin"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.surname && !watch("surname")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="patronymic">
                Ata adı <span className="text-red-500">*</span>
              </label>
              <input
                id="patronymic"
                type="text"
                {...register("patronymic")}
                placeholder={
                  errors.patronymic
                    ? errors.patronymic.message
                    : "Ata adını daxil edin"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.patronymic && !watch("patronymic")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group items-center flex">
              <label htmlFor="genderStatus">
                Cinsiyyət <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex gap-4 rounded-lg -ml-10 ${
                  errors.genderStatus && !watch("genderStatus") ? "" : ""
                }`}>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    value="MAN"
                    {...register("genderStatus")}
                    disabled={mode === "view"}
                    className={` ${
                      errors.genderStatus && !watch("genderStatus")
                        ? "accent-red-500"
                        : "accent-blue-600"
                    }`}
                  />
                  <span
                    className={
                      errors.genderStatus && !watch("genderStatus")
                        ? "text-red-500"
                        : "text-gray-900"
                    }>
                    Kişi
                  </span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    value="WOMAN"
                    {...register("genderStatus")}
                    disabled={mode === "view"}
                    className={` ${
                      errors.genderStatus && !watch("genderStatus")
                        ? "accent-red-500"
                        : "accent-blue-600"
                    }`}
                  />
                  <span
                    className={
                      errors.genderStatus && !watch("genderStatus")
                        ? "text-red-500"
                        : "text-gray-900"
                    }>
                    Qadın
                  </span>
                </label>
              </div>
            </div>

            <div className="main-form-group">
              <label htmlFor="finCode">FIN kod</label>
              <div className="-ml-11">
                {errors.finCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.finCode.message}
                  </p>
                )}
                <input
                  id="finCode"
                  type="text"
                  {...register("finCode")}
                  placeholder="FIN kodu daxil edin"
                  readOnly={mode === "view"}
                  className={`!w-[457px] ${
                    mode === "view" ? "readonly" : ""
                  } ${
                    errors.finCode ? "border-2 border-red-500 bg-red-50" : ""
                  }`}
                />
              </div>
            </div>

            <div className="main-form-group">
              <label htmlFor="colorCode">
                Rəng kodu <span className="text-red-500">*</span>
              </label>
              <input
                id="colorCode"
                type="color"
                {...register("colorCode")}
                disabled={mode === "view"}
                className={`${mode === "view" ? "readonly-color" : ""} ${
                  errors.colorCode ? "error" : ""
                }`}
              />
              {errors.colorCode && (
                <p className="error-message">{errors.colorCode.message}</p>
              )}
            </div>

            <div className="main-form-group">
              <label htmlFor="dateOfBirth">
                Doğum tarixi <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                readOnly={mode === "view"}
                min="1800-01-01"
                max="3000-12-31"
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.dateOfBirth && !watch("dateOfBirth")
                    ? "border-2 border-red-500 bg-red-50"
                    : ""
                }`}
              />
            </div>
          </div>

          <div className="right">
            <div className="main-form-group">
              <label htmlFor="phone">
                Mobil nömrə 1 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone", {
                  onChange: (e) => {
                    const value = e.target.value;
                    const formattedValue = formatPhoneNumber(value);
                    setValue("phone", formattedValue);
                  },
                })}
                placeholder={
                  errors.phone ? errors.phone.message : "(000)-000-00-00"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.phone && !watch("phone")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="phone2">
                Mobil nömrə 2
                {mode === "create" && <span className="text-red-500">*</span>}
              </label>
              <input
                id="phone2"
                type="tel"
                {...register("phone2", {
                  onChange: (e) => {
                    const value = e.target.value;
                    const formattedValue = formatPhoneNumber(value);
                    setValue("phone2", formattedValue);
                  },
                })}
                placeholder={
                  errors.phone2 ? errors.phone2.message : "(000)-000-00-00"
                }
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.phone2 && !watch("phone2")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="phone3">Mobil nömrə 3</label>
              <input
                id="phone3"
                type="tel"
                {...register("phone3", {
                  onChange: (e) => {
                    const value = e.target.value;
                    const formattedValue = formatPhoneNumber(value);
                    setValue("phone3", formattedValue);
                  },
                })}
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.phone3 ? "error" : ""
                }`}
              />
              {errors.phone3 && (
                <p className="error-message">{errors.phone3.message}</p>
              )}
            </div>

            <div className="main-form-group">
              <label htmlFor="homePhone">Ev telefonu</label>
              <input
                id="homePhone"
                type="tel"
                {...register("homePhone", {
                  onChange: (e) => {
                    const value = e.target.value;
                    const formattedValue = formatPhoneNumber(value);
                    setValue("homePhone", formattedValue);
                  },
                })}
                placeholder=""
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.homePhone ? "error" : ""
                }`}
              />
              {errors.homePhone && (
                <p className="error-message">{errors.homePhone.message}</p>
              )}
            </div>

            <div className="main-form-group">
              <label htmlFor="email">E-poçt ünvanı</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                readOnly={mode === "view"}
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.email ? "error" : ""
                }`}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="main-form-group">
              <label htmlFor="address">Ünvan</label>
              <input
                id="address"
                type="text"
                {...register("address")}
                readOnly={mode === "view"}
                className={mode === "view" ? "readonly" : ""}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="degree">Dərəcə</label>
              <input
                id="degree"
                type="text"
                {...register("degree")}
                readOnly={mode === "view"}
                className={mode === "view" ? "readonly" : ""}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="experience">Təcrübə (il)</label>
              <input
                id="experience"
                type="number"
                {...register("experience")}
                readOnly={mode === "view"}
                placeholder={
                  errors.experience
                    ? errors.experience.message
                    : "Təcrübə rəqəm olmalıdır"
                }
                className={`${mode === "view" ? "readonly" : ""} ${
                  errors.experience && !watch("experience")
                    ? "border-2 text-sm border-red-500 bg-red-50 placeholder-red-500"
                    : ""
                }`}
              />
            </div>

            <div className="main-form-group">
              <label htmlFor="permissions">
                İcazələr <span className="text-red-500">*</span>
              </label>
              <div className="permissions-checklist">
                {permissionsLoading ? (
                  <div className="text-sm text-gray-500">
                    İcazələr yüklənir...
                  </div>
                ) : permissionList.length === 0 ? (
                  <div className="text-sm text-gray-500">İcazə tapılmadı</div>
                ) : (
                  <Controller
                    name="permissions"
                    control={control}
                    render={({ field }) => (
                      <div className=" ml-1 grid grid-row-2 gap-2">
                        {permissionList.map((permission) => (
                          <label
                            key={permission.value}
                            className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={permission.value}
                              checked={field.value?.includes(permission.value)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const currentValues = field.value || [];
                                if (isChecked) {
                                  field.onChange([
                                    ...currentValues,
                                    permission.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (val) => val !== permission.value
                                    )
                                  );
                                }
                              }}
                              disabled={mode === "view"}
                              className={`rounded focus:ring-blue-500 ${
                                errors.permissions
                                  ? "border-2 !border-red-500 !text-red-600"
                                  : "border-gray-300 text-blue-600"
                              }`}
                            />
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {mode !== "view" && (
          <div className="main-form-actions">
            <button type="submit" className="btn-submit">
              {mode === "create" ? "Əlavə et" : "Yenilə"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancelButton}>
              Ləğv et
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default UserForm;