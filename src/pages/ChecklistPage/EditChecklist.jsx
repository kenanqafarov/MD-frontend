import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/ChecklistPage/editchecklist.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import useExaminationStore from "../../../stores/examinationStore";

function EditCheckList() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { examinations, fetchAllExaminations, updateExamination, loading } =
    useExaminationStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔧 ID-ni number olaraq götürmək vacibdir!
  const numericId = Number(id);

  const [formData, setFormData] = useState({
    id: numericId,
    typeName: "",
    status: "ACTIVE",
  });

  // 1. Bütün examination-ları yüklə (əgər boşdursa)
  useEffect(() => {
    if (examinations.length === 0) {
      fetchAllExaminations();
    }
  }, [fetchAllExaminations, examinations.length]);

  // 2. examinations yüklənəndən sonra formu doldur
  useEffect(() => {
    const exam = examinations.find((item) => item.id === numericId);
    if (exam) {
      setFormData({
        id: exam.id,
        typeName: exam.typeName,
        status: exam.status,
      });
    }
  }, [examinations, numericId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Göndərilən data:", formData); // debug üçün

    try {
      await updateExamination(formData);
      toast.success("Yeniləndi ✅");
      navigate("/checklist");
    } catch (error) {
      toast.error("Xəta baş verdi ❌");
    } finally {
      setIsSubmitting(false);
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
              className="addCheckListField"
              name="typeName"
              value={formData.typeName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="addCheckListActions">
            <button
              type="button"
              className="addCheckListCancelBtn"
              onClick={() => navigate("/checklist")}
              disabled={isSubmitting}>
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addCheckListSaveBtn"
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

export default EditCheckList;
