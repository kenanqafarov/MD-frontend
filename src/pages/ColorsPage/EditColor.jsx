import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useColorStore from "../../../stores/colorStore"; // store-un doğru yolu
import "../../assets/style/ColorsPage/editcolor.css";
import { FaTimes, FaCheck } from "react-icons/fa";

function EditColor() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL-dən rəngin id-si
  const { fetchColorById, selectedColor, updateColor } = useColorStore();

  const [formData, setFormData] = useState({
    colorName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchColorById(id);
    }
  }, [id, fetchColorById]);

  useEffect(() => {
    if (selectedColor) {
      setFormData({
        colorName: selectedColor.name || "",
      });
    }
  }, [selectedColor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateColor(id, { name: formData.colorName });
      toast.success("Rəng uğurla yeniləndi");
      navigate("/colors");
    } catch (error) {
      toast.error("Xəta baş verdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editColorFormWrapper">
      <div className="editColorFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="editColorFormRow">
            <label className="editColorLabel">
              Rəngin adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="editColorField"
              name="colorName"
              value={formData.colorName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="editColorActions">
            <button
              type="button"
              className="editColorCancelBtn"
              onClick={() => navigate("/colors")}
              disabled={isSubmitting}>
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="editColorSaveBtn"
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

export default EditColor;
