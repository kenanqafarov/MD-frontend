import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useMedicineStore from "../../../stores/medicineStore";
import "../../assets/style/ReceptsPage/editmedicine.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedMedicine,
    fetchMedicineById,
    editMedicine,
    resetSelectedMedicine,
    loading,
    error,
  } = useMedicineStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    recipeId: 0,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMedicineById(id);
    return () => resetSelectedMedicine();
  }, [id, fetchMedicineById, resetSelectedMedicine]);

  useEffect(() => {
    if (selectedMedicine) {
      setFormData({
        name: selectedMedicine.name || "",
        description: selectedMedicine.description || "",
        status: selectedMedicine.status || "ACTIVE",
        recipeId: selectedMedicine.recipeId || 0,
      });
    }
  }, [selectedMedicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Dərmanın adı tələb olunur";
    if (!formData.recipeId) errors.recipeId = "Resept ID tələb olunur";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await editMedicine(id, formData);
      alert("Dərman uğurla yeniləndi!");
      navigate(-1);
    } catch (err) {
      alert(`Xəta baş verdi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancel = () => navigate(-1);

  if (loading && !selectedMedicine) {
    return <div className="editMedicineWrapper">Yüklənir...</div>;
  }

  if (error) {
    return (
      <div className="editMedicineWrapper">
        Xəta baş verdi: {error.message || JSON.stringify(error)}
      </div>
    );
  }

  return (
    <div className="editMedicineWrapper">
      <form className="editMedicineContainer" onSubmit={handleSubmit}>
        <div className="editMedicineInput">
          <label>
            Dərmanın adı <span>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dərmanın adı"
          />
          {formErrors.name && <span className="error">{formErrors.name}</span>}
        </div>

        <div className="editMedicineInput">
          <label>Təsvir</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Təsvir"
          />
        </div>

        <div className="editMedicineInput">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">Aktiv</option>
            <option value="INACTIVE">İnaktiv</option>
          </select>
        </div>

        <div className="editMedicineInput">
     
          {formErrors.recipeId && (
            <span className="error">{formErrors.recipeId}</span>
          )}
        </div>

        <div className="editMedicineButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={handleCancel}
            disabled={loading}>
            <img src={cancelButton} alt="İmtina et" />
            İmtina et
          </button>
          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}>
            <img src={acceptButton} alt="Yadda saxla" />
            {loading ? "Yenilənir..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMedicine;
