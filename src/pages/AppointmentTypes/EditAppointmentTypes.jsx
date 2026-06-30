import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/AppointmentTypes/editappointmenttypes.css";
import { FaRegClock, FaTimes, FaCheck } from "react-icons/fa";
import useAppointmentTypeStore from "../../../stores/appointment-type-store";

function EditAppointmentType() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { fetchAppointmentTypes, updateAppointmentType, loading } =
    useAppointmentTypeStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    appointmentTypeName: "",
    duration: "00:00",
  });

  const formatDuration = (duration) => {
    if (!duration) return "00:00";
    if (typeof duration === "string") {
      if (duration.includes(":")) return duration.slice(0, 5);
    }
    if (typeof duration === "object") {
      const hours = String(duration.hour || 0).padStart(2, "0");
      const minutes = String(duration.minute || 0).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "00:00";
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAppointmentTypes();
        const appointmentTypes =
          useAppointmentTypeStore.getState().appointmentTypes;
        const appointmentType = appointmentTypes.find(
          (type) => type.id === parseInt(id)
        );

        if (appointmentType) {
          setFormData({
            appointmentTypeName: appointmentType.appointmentTypeName || "",
            duration: formatDuration(
              appointmentType.duration || appointmentType.time
            ),
          });
        } else {
          toast.error("Randevu tipi tapılmadı!");
          navigate("/appointment-types");
        }
      } catch (error) {
        toast.error("Məlumat yüklənərkən xəta baş verdi");
        navigate("/appointment-types");
      }
    };

    loadData();
  }, [id, navigate, fetchAppointmentTypes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAppointmentType({
        id: parseInt(id),
        appointmentTypeName: formData.appointmentTypeName,
        time: `${formData.duration}:00`,
      });

      toast.success("Randevu tipi uğurla yeniləndi");
      navigate("/appointment-types");
    } catch (error) {
      toast.error(error.message || "Yeniləmə zamanı xəta baş verdi");
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Yüklənir...</div>;

  return (
    <div className="editAppointmentTypeFormWrapper">
      <div className="editAppointmentTypeFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="editAppointmentTypeFormRow">
            <label className="editAppointmentTypeLabel">
              Randevu tipinin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="editAppointmentTypeField"
              name="appointmentTypeName"
              value={formData.appointmentTypeName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="editAppointmentTypeFormRow">
            <label className="editAppointmentTypeLabel">Müddət</label>
            <div className="editAppointmentTypeInputFieldWithIcon">
              <FaRegClock className="editAppointmentTypeIcon" />
              <input
                type="time"
                className="editAppointmentTypeField"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                step="300"
                required
              />
            </div>
          </div>

          <div className="editAppointmentTypeActions">
            <button
              type="button"
              className="editAppointmentTypeCancelBtn"
              onClick={() => navigate("/appointment-types")}
              disabled={isSubmitting}>
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="editAppointmentTypeSaveBtn"
              disabled={isSubmitting || loading}>
              {isSubmitting ? (
                "Yüklənir..."
              ) : (
                <>
                  <FaCheck /> Yadda saxla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAppointmentType;
