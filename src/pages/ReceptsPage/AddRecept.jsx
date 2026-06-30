import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/style/ReceptsPage/addrecept.css";

import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import useRecipeStore from "../../../stores/receptsStore";

function AddRecept() {
  const [formData, setFormData] = useState({
    name: "",
  });

  const { createNewRecipe } = useRecipeStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createNewRecipe(formData); // Store-dan çağırılır
      alert("Resept uğurla yaradıldı");
      navigate("/recepts");
      setFormData({ name: "" });
    } catch (error) {
      alert("Xəta baş verdi: " + error.message);
    }
  };

  return (
    <form className="addReceptWrapper" onSubmit={handleSubmit}>
      <div className="addReceptContainer">
        <div className="addReceptInput">
          <p>
            Reseptin adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Reseptin adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="addReceptButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => setFormData({ name: "" })}>
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

export default AddRecept;
