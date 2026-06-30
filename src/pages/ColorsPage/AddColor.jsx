import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/ColorsPage/addcolor.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import useColorStore from "../../../stores/colorStore"

function AddColor() {
  const navigate = useNavigate();
  const addColor = useColorStore((state) => state.addColor);
  const loading = useColorStore((state) => state.loading);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Rəngin adını daxil edin");
      return;
    }

    try {
      await addColor(formData);
      toast.success("Rəng uğurla əlavə edildi");
      navigate("/colors");
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
  };

  return (
    <div className="addColorFormWrapper">
      <div className="addColorFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="addColorFormRow">
            <label className="addColorLabel">
              Rəngin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="addColorField"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="addColorActions">
            <button
              type="button"
              className="addColorCancelBtn"
              onClick={() => navigate("/colors")}
              disabled={loading}
            >
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addColorSaveBtn"
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

export default AddColor;
