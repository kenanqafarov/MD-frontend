// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/Anamnesis/addanamnesiscategory.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Store
import useAnamnesisCategoryStore from "../../../stores/anamnesisCategoryStore";

function AddAnamnesis() {
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
  });
  const navigate = useNavigate();
  const { addCategory, loading } = useAnamnesisCategoryStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Zəhmət olmasa kateqoriya adını daxil edin!");
      return;
    }

    try {
      const newCategory = {
        name: formData.name.trim(),
        status: formData.status,
      };

      await addCategory(newCategory);
      toast.success("Anamnez kateqoriyası uğurla əlavə olundu!");
      setTimeout(() => {
        navigate("/anamnesis");
      }, 1500);
    } catch (error) {
      console.error("Anamnez əlavə edilərkən xəta:", error);
      toast.error("Anamnez əlavə edilərkən xəta baş verdi!");
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      status: "ACTIVE",
    });
  };

  return (
    <div className="addAnamnesisWrapper">
      <ToastContainer />
      <form className="addAnamnesisContainer" onSubmit={handleSubmit}>
        <div className="addAnamnesisInput">
          <p>
            Kateqoriyanın adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Kateqoriyanın adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="addAnamnesisInput">
          <p>Status</p>
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

        <div className="addAnamnesisButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={handleReset}
            disabled={loading}>
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button type="submit" className="acceptFormCondition" disabled={loading}>
            <img src={acceptButton} alt="accept" />
            {loading ? "Zəhmət olmasa gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAnamnesis;
