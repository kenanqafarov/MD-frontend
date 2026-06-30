import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Anamnesis/addanamnesis.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import useAnamnesisListStore from "../../../stores/anamnesStore";

function AddAnamnesis() {
  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { addAnamnesis } = useAnamnesisListStore();

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
      toast.warning("Anamnezin adını daxil edin!");
      return;
    }

    const numericCategoryId = Number(categoryId);

    if (isNaN(numericCategoryId)) {
      toast.error("Kateqoriya ID düzgün deyil.");
      return;
    }

    setIsLoading(true);
    const dataToSend = {
      ...formData,
      anamnesisCategoryId: numericCategoryId,
    };

    try {
      await addAnamnesis(dataToSend);
      toast.success("Anamnez uğurla yaradıldı");
      setTimeout(() => {
        navigate(`/anamnesis/anamnesis-details/${categoryId}`);
      }, 1000);
    } catch (error) {
      console.error("Error adding anamnesis:", error);
      toast.error("Xəta baş verdi: " + (error?.message || "Bilinməyən xəta"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      status: "ACTIVE",
    });
    navigate(`/anamnesis/anamnesis-details/${categoryId}`);
  };

  return (
    <div>
      <ToastContainer />
      <form className="addAnamnesisWrapper" onSubmit={handleSubmit}>
        <div className="addAnamnesisContainer">
          <div className="addAnamnesisInput">
            <p>
              Anamnezin adı <span>*</span>
            </p>
            <input
              type="text"
              placeholder="Anamnezin adı"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="addAnamnesisInput">
            <p>Status</p>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Passiv</option>
            </select>
          </div>

          <div className="addAnamnesisButtons">
            <button
              type="button"
              className="cancelFormCondition"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <img src={cancelButton} alt="Cancel" />
              İmtina et
            </button>
            <button
              type="submit"
              className="acceptFormCondition"
              disabled={isLoading}
            >
              <img src={acceptButton} alt="Save" />
              {isLoading ? "Zəhmət olmasa gözləyin..." : "Yadda saxla"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddAnamnesis;
