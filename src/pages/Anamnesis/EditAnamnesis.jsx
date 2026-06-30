import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/style/Anamnesis/editanamnesis.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAnamnesisListStore from "../../../stores/anamnesStore";

function EditAnamnesis() {
  const { id, categoryId } = useParams();
  const navigate = useNavigate();
  const { selectedAnamnesis, fetchAnamnesisById, editAnamnesis, loading } = useAnamnesisListStore();

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchAnamnesisById(id);
    }
  }, [id, fetchAnamnesisById]);

  useEffect(() => {
    if (selectedAnamnesis && selectedAnamnesis.id) {
      setFormData({
        name: selectedAnamnesis.name || "",
        status: selectedAnamnesis.status || "ACTIVE",
      });
      console.log("Loaded anamnesis item:", selectedAnamnesis.name);
    }
  }, [selectedAnamnesis]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Anamnez adı tələb olunur";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      await editAnamnesis(id, {
        name: formData.name.trim(),
        anamnesisCategoryId: categoryId,
      });
      toast.success("Anamnez uğurla yeniləndi!");
      setTimeout(() => {
        navigate(categoryId ? `/anamnesis/anamnesis-details/${categoryId}` : "/anamnesis");
      }, 1000);
    } catch (err) {
      toast.error(`Xəta baş verdi: ${err?.message || "Bilinməyən xəta"}`);
      console.error("Error updating anamnesis:", err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="editAnamnesisWrapper">
      <ToastContainer />
      <form className="editAnamnesisContainer" onSubmit={handleSubmit}>
        <div className="editAnamnesisInput">
          <label>
            Anamnezin adı<span>*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Anamnezin adı"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {formErrors.name && (
            <span className="error">{formErrors.name}</span>
          )}
        </div>

        <div className="editAnamnesisInput">
          <label>Status</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ACTIVE">Aktiv</option>
            <option value="INACTIVE">Passiv</option>
          </select>
        </div>

        <div className="editAnamnesisButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <img src={cancelButton} alt="İmtina et" />
            İmtina et
          </button>
          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}
          >
            <img src={acceptButton} alt="Yadda saxla" />
            {loading ? "Zəhmət olmasa gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAnamnesis;
