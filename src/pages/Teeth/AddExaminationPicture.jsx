import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify"; // 🔔 Toastify əlavə et
import useExaminationStore from "../../../stores/examinationStore";
import useTeethExaminationStore from "../../../stores/teeth-examinationStore";
import "../../assets/style/Teeth/addexaminationpicture.css";

const AddExaminationPicture = () => {
  const { id: teethId } = useParams();
  const navigate = useNavigate(); // 🔄 navigate hook
  const fileInputRef = useRef();

  const [selectedExam, setSelectedExam] = useState("");
  const [images, setImages] = useState([]);

  const { examinations, fetchAllExaminations } = useExaminationStore();
  const { createTeethExamination } = useTeethExaminationStore();

  useEffect(() => {
    fetchAllExaminations();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selected = examinations.find(
      (exam) => exam.typeName === selectedExam
    );

    if (!selected) {
      toast.error("Zəhmət olmasa düzgün müayinə seçin");
      return;
    }

    const payload = {
      teethId: Number(teethId),
      examinationId: Number(selected.id),
      status: "ACTIVE",
    };

    try {
      await createTeethExamination(payload);
      toast.success("Müvəffəqiyyətlə yadda saxlanıldı ✅");
      setSelectedExam("");
      setImages([]);

      // 🔄 1-2 saniyə sonra yönləndirək
      setTimeout(() => {
        navigate("/teeth");
      }, 1500);
    } catch (err) {
      toast.error("Xəta baş verdi: " + err.message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="addExaminationPictureContainer">
      <form className="addexaminationpicture-form" onSubmit={handleSubmit}>
        <div className="addexaminationpicture-row">
          <label>
            Müayinə / Əməliyyat{" "}
            <span className="addexaminationpicture-required">*</span>
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            required>
            <option value="">Seçin</option>
            {examinations.map((opt) => (
              <option key={opt.id} value={opt.typeName}>
                {opt.typeName}
              </option>
            ))}
          </select>
        </div>

        <div className="addexaminationpicture-row imagesRowToUploadExamination">
          <label>Şəkil</label>
          <div className="addexaminationpicture-upload-box">
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="addexaminationpicture-upload-btn"
              onClick={() => fileInputRef.current.click()}>
              <FiUpload style={{ marginRight: 8 }} /> Dişin şəklini yükləyin
            </button>
          </div>

          {images.length > 0 && (
            <div className="addexaminationpicture-images-list">
              {images.map((img, idx) => (
                <div className="addexaminationpicture-image-item" key={idx}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt="diş şəkli"
                    className="addexaminationpicture-thumb"
                  />
                  <button
                    type="button"
                    className="addexaminationpicture-remove-btn"
                    onClick={() => handleRemoveImage(idx)}
                    title="Sil">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="addexaminationpicture-actions">
          <button
            type="button"
            className="addexaminationpicture-cancel-btn"
            onClick={handleCancel}
          >
            İmtina et
          </button>
          <button type="submit" className="addexaminationpicture-save-btn">
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExaminationPicture;
