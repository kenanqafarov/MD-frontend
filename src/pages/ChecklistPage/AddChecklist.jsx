import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/ChecklistPage/addchecklist.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import useExaminationStore from "../../../stores/examinationStore";

function AddCheckList() {
  const navigate = useNavigate();
  const { createExamination, loading } = useExaminationStore();

  const [formData, setFormData] = useState({
    examinationTypeName: "",
  });

  const [errors, setErrors] = useState({
    examinationTypeName: "",
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
    
    if (!formData.examinationTypeName.trim()) {
      newErrors.examinationTypeName = "Növün adı mütləq doldurulmalıdır";
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

    try {
      await createExamination(formData);
      toast.success("Yoxlama siyahısı elementi uğurla əlavə edildi");
      navigate("/checklist");
    } catch (error) {
      toast.error("Xəta baş verdi. Təkrar cəhd edin.");
    }
  };

  return (
    <div className="addCheckListFormWrapper">
      <div className="addCheckListFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="addCheckListFormRow">
            <label className="addCheckListLabel">
              Növün adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`addCheckListField ${errors.examinationTypeName ? 'placeholder:!text-red-500' : ''}`}
              name="examinationTypeName"
              value={formData.examinationTypeName}
              onChange={handleInputChange}
              placeholder={errors.examinationTypeName || "Növün adı"}
              style={{ borderColor: errors.examinationTypeName ? '#ef4444' : '' }}
            />
          </div>

          <div className="addCheckListActions">
            <button
              type="button"
              className="addCheckListCancelBtn"
              onClick={() => navigate("/checklist")}
              disabled={loading}>
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addCheckListSaveBtn"
              disabled={loading}>
              {loading ? (
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

export default AddCheckList;