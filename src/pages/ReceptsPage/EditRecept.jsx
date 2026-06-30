// React
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Style
import "../../assets/style/ReceptsPage/editrecept.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Store
import useRecipeStore from "../../../stores/receptsStore";

function EditRecept() {
  const [receptName, setReceptName] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    selectedRecipe,
    fetchRecipeById,
    updateRecipeById,
    loading,
    error,
  } = useRecipeStore();

  useEffect(() => {
    if (id) {
      fetchRecipeById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedRecipe) {
      setReceptName(selectedRecipe.name || "");
    }
  }, [selectedRecipe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receptName.trim()) {
      toast.warning("Reseptin adı boş ola bilməz!");
      return;
    }

    try {
      await updateRecipeById(id, { name: receptName.trim() });
      toast.success("Resept uğurla yeniləndi!");
      navigate("/recepts");
    } catch (err) {
      toast.error("Resept yenilənərkən xəta baş verdi!");
    }
  };

  return (
    <div className="editReceptWrapper">
      <ToastContainer />
      <form className="editReceptContainer" onSubmit={handleSubmit}>
        <div className="editReceptInput">
          <p>
            Reseptin adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Reseptin adı"
            value={receptName}
            onChange={(e) => setReceptName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="editReceptButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate("/recepts")}
            disabled={loading}
          >
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}
          >
            <img src={acceptButton} alt="accept" />
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRecept;
