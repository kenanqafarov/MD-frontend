import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/CabinetsPage/editcabinet.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import useCabinetStore from "../../../stores/cabinetStore"; // path-ı uyğunlaşdır

function EditCabinet() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { cabinets, updateCabinet, fetchCabinets, loading } = useCabinetStore();

  const [formData, setFormData] = useState({
    id: "",
    cabinetName: "",
    status: "ACTIVE", // default olaraq
  });

  useEffect(() => {
    fetchCabinets(); // Məlumat yenilənməyibsə
  }, []);

  useEffect(() => {
    const cabinetToEdit = cabinets.find((cab) => String(cab.id) === String(id));
    if (cabinetToEdit) {
      setFormData({
        id: cabinetToEdit.id,
        cabinetName: cabinetToEdit.cabinetName,
        status: cabinetToEdit.status || "ACTIVE",
      });
    }
  }, [id, cabinets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cabinetName.trim()) {
      toast.error("Kabinet adı boş ola bilməz");
      return;
    }

    try {
      await updateCabinet(formData);
      toast.success("Kabinet uğurla yeniləndi");
      navigate("/cabinets");
    } catch (error) {
      toast.error("Yeniləmə zamanı xəta baş verdi");
    }
  };

  return (
    <div className="editCabinetFormWrapper">
      <div className="editCabinetFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="editCabinetFormRow">
            <label className="editCabinetLabel">
              Kabinetin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="editCabinetField"
              name="cabinetName"
              value={formData.cabinetName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="editCabinetFormRow">
            <label className="editCabinetLabel">Status</label>
            <select
              className="editCabinetField"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">Aktiv</option>
              <option value="PASSIVE">Passiv</option>
            </select>
          </div>

          <div className="editCabinetActions">
            <button
              type="button"
              className="editCabinetCancelBtn"
              onClick={() => navigate("/cabinets")}
              disabled={loading}
            >
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="editCabinetSaveBtn"
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

export default EditCabinet;
