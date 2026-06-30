import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Teeth/editexaminationpicture.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import useTeethExaminationStore from "../../../stores/teeth-examinationStore";
import useExaminationStore from "../../../stores/examinationStore";

const EditExaminationPicture = () => {
  const { id: teethId, examinationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { updateTeethExamination, loading: examLoading } = useTeethExaminationStore();
  const { examinations, fetchAllExaminations } = useExaminationStore();

  const [selectedExam, setSelectedExam] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAllExaminations();
  }, []);

  useEffect(() => {
    const examinationData = location.state?.examination;
    if (examinationData?.examination?.typeName) {
      setSelectedExam(examinationData.examination.typeName);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExam) {
      toast.warning("Zəhmət olmasa müayinə seçin!");
      return;
    }

    const selectedExamObj = examinations.find(
      (exam) => exam.typeName === selectedExam
    );

    if (!selectedExamObj) {
      toast.error("Seçilən müayinə tapılmadı!");
      return;
    }

    const payload = {
      id: Number(examinationId),
      teethId: Number(teethId),
      examinationIds: [Number(selectedExamObj.id)],
    };

    try {
      setFormLoading(true);
      await updateTeethExamination(payload);
      toast.success("Müayinə uğurla yeniləndi!");
      setTimeout(() => {
        navigate(`/teeth/${teethId}/examination-pictures`);
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Yenilənmə zamanı xəta baş verdi!");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const isLoading = examLoading || formLoading;

  return (
    <div className="editExaminationPictureContainer">
      <ToastContainer />
      <form className="editExaminationPictureForm" onSubmit={handleSubmit}>
        <div className="editExaminationPictureRow">
          <label>
            Müayinə / Əməliyyat
            <span className="editExaminationPictureRequired">*</span>
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="">Seçin</option>
            {examinations.map((opt) => (
              <option key={opt.id} value={opt.typeName}>
                {opt.typeName}
              </option>
            ))}
          </select>
        </div>

        <div className="editExaminationPictureActions">
          <button
            type="button"
            className="editExaminationPictureCancelBtn"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button
            type="submit"
            className="editExaminationPictureSaveBtn"
            disabled={isLoading}
          >
            <img src={acceptButton} alt="accept" />
            {isLoading ? "Zəhmət olmasa gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExaminationPicture;
