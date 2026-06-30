import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/CabinetsPage/addcabinet.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import useCabinetStore from "../../../stores/cabinetStore";

function AddCabinet() {
  const navigate = useNavigate();
  const createCabinet = useCabinetStore((state) => state.createCabinet);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cabinetName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCabinet(formData);
      toast.success("Kabinet uğurla əlavə edildi");
      navigate("/cabinets");
    } catch (error) {
      toast.error("Kabinet əlavə edilərkən xəta baş verdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addCabinetFormWrapper">
      <div className="addCabinetFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="addCabinetFormRow">
            <label className="addCabinetLabel">
              Kabinetin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="addCabinetField"
              name="cabinetName"
              value={formData.cabinetName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="addCabinetActions">
            <button
              type="button"
              className="addCabinetCancelBtn"
              onClick={() => navigate("/cabinets")}
              disabled={isSubmitting}>
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addCabinetSaveBtn"
              disabled={isSubmitting}>
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

export default AddCabinet;
