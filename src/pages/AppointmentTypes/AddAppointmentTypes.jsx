import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAppointmentTypeStore from "../../../stores/appointment-type-store";
import "../../assets/style/AppointmentTypes/addappointmenttypes.css";
import { FaRegClock, FaTimes, FaCheck } from "react-icons/fa";

function AddAppointmentType() {
  const navigate = useNavigate();
  const addAppointmentType = useAppointmentTypeStore((state) => state.addAppointmentType);
  const loading = useAppointmentTypeStore((state) => state.loading);

  const [formData, setFormData] = useState({
    appointmentName: "",
    duration: "", // "HH:MM"
  });

  const [errors, setErrors] = useState({
    appointmentName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.appointmentName.trim()) {
      newErrors.appointmentName = "Randevu tipinin adı mütləq doldurulmalıdır";
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

    // Backend 'time' string formatında gözləyir, ona görə düz string göndəririk
    // Backend 'HH:mm:ss' formatını istəyir, ona görə :ss əlavə edirik
    const timeString = formData.duration ? `${formData.duration}:00` : "00:00:00";

    const sendData = {
      appointmentTypeName: formData.appointmentName,
      time: timeString,
    };

    try {
      await addAppointmentType(sendData);
      toast.success("Randevu tipi uğurla əlavə edildi");
      navigate("/appointment-types");
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
  };

  return (
    <div className="addAppointmentTypeFormWrapper">
      <div className="addAppointmentTypeFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="addAppointmentTypeFormRow">
            <label className="addAppointmentTypeLabel">
              Randevu tipinin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`addAppointmentTypeField ${errors.appointmentName ? 'placeholder:!text-red-500' : ''}`}
              name="appointmentName"
              value={formData.appointmentName}
              onChange={handleInputChange}
              disabled={loading}
              placeholder={errors.appointmentName || "Randevu tipinin adını daxil edin"}
              style={{ borderColor: errors.appointmentName ? '#ef4444' : '' }}
            />
          </div>

          <div className="addAppointmentTypeFormRow">
            <label className="addAppointmentTypeLabel">Müddət</label>
            <div className="addAppointmentTypeInputFieldWithIcon">
              <input
                type="time"
                className="addAppointmentTypeField"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="HH:MM"
                disabled={loading}
              />
              {/* <FaRegClock className="clockIcon" /> */}
            </div>
          </div>

          <div className="addAppointmentTypeActions">
            <button
              type="button"
              className="addAppointmentTypeCancelBtn"
              onClick={() => navigate("/appointment-types")}
              disabled={loading}
            >
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addAppointmentTypeSaveBtn"
              disabled={loading}
            >
              {loading ? "Yüklənir..." : <><FaCheck /> Yadda saxla</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAppointmentType;