import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useMedicineStore from "../../../stores/medicineStore";

import "../../assets/style/ReceptsPage/addmedicine.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

function AddMedicine() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();
  const { id } = useParams(); 
  const { addMedicine } = useMedicineStore(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericRecipeId = Number(id);
    if (isNaN(numericRecipeId)) {
      alert("Xəta: recipeId düzgün deyil və ya URL-də yoxdur.");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      recipeId: numericRecipeId,
    };

    try {
      console.log("Göndərilən payload:", payload);
      await addMedicine(payload);
      alert("Dərman uğurla əlavə edildi");
      setFormData({ name: "", description: "" });
      navigate(-1);
    } catch (error) {
      alert("Xəta baş verdi: " + error.message);
    }
  };

  return (
    <form className="addMedicineWrapper" onSubmit={handleSubmit}>
      <div className="addMedicineContainer">
        <div className="addMedicineInput">
          <p>
            Dərmanın adı <span>*</span>
          </p>
          <input
            type="text"
            placeholder="Dərmanın adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="addMedicineInput">
          <p>Qeyd</p>
          <input
            type="text"
            placeholder="Qeyd"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="addMedicineButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate(-1)}
          >
            <img src={cancelButton} alt="Cancel" />
            İmtina et
          </button>
          <button type="submit" className="acceptFormCondition">
            <img src={acceptButton} alt="Save" />
            Yadda saxla
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddMedicine;
