// React
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Style
import "../../assets/style/Anamnesis/editanamnesiscategory.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Store
import useAnamnesisCategoryStore from "../../../stores/anamnesisCategoryStore";

function EditAnamnesis() {
  const [anamnesisName, setAnamnesisName] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { categoryDetails, fetchCategoryById, updateCategory, loading } =
    useAnamnesisCategoryStore();

  useEffect(() => {
    if (id) {
      fetchCategoryById(id);
    }
  }, [id, fetchCategoryById]);

  useEffect(() => {
    if (categoryDetails) {
      setAnamnesisName(categoryDetails.name || "");
    }
  }, [categoryDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!anamnesisName.trim()) {
      toast.warning("Zəhmət olmasa kateqoriya adını daxil edin!");
      return;
    }

    try {
      await updateCategory(id, { name: anamnesisName.trim() });
      toast.success("Anamnez kateqoriyası uğurla yeniləndi!");
      setTimeout(() => {
        navigate("/anamnesis");
      }, 1500);
    } catch (error) {
      console.error("Anamnez yenilənərkən xəta:", error);
      toast.error("Anamnez yenilənərkən xəta baş verdi!");
    }
  };

  return (
    <div className="editAnamnesisWrapper">
      <ToastContainer />
      <form className="editAnamnesisContainer" onSubmit={handleSubmit}>
        <div className="editAnamnesisInput">
          <p>
            Kateqoriyanın adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Anamnezin adı"
            value={anamnesisName}
            onChange={(e) => setAnamnesisName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="editAnamnesisButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate("/anamnesis")}
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

export default EditAnamnesis;

