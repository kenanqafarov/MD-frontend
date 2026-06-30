import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Style
import "../../assets/style/Implants/editimplant.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Zustand store importu
import useImplantStore from "../../../stores/implantStore";

function EditImplant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { implants, fetchImplants, editImplant, loading, error } =
    useImplantStore();

  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    if (implants.length > 0 && id) {
      const implant = implants.find((item) => item.id.toString() === id);
      if (implant) {
        setBrandName(implant.implantBrandName || "");
      }
    }
  }, [implants, id]);

  useEffect(() => {
    fetchImplants();
  }, [fetchImplants]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName.trim()) {
      toast.error("Markanın adı boş ola bilməz!");
      return;
    }

    try {
      await editImplant(id, { implantBrandName: brandName.trim() });
      toast.success("İmplant uğurla yeniləndi!");
      navigate("/implants");
    } catch (err) {
      toast.error("İmplant yenilənərkən xəta baş verdi!");
      console.error(err);
    }
  };

  return (
    <div className="editImplantWrapper">
      <ToastContainer />
      <form className="editImplantContainer" onSubmit={handleSubmit}>
        <div className="editImplantInput">
          <p>
            Markanın adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Markanın adı"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="editImplantButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate("/implants")}
            disabled={loading}>
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}>
            <img src={acceptButton} alt="accept" />
            Yadda saxla
          </button>
        </div>

        {error && (
          <p className="error" style={{ marginTop: 10 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default EditImplant;
