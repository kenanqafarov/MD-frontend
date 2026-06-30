// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/Implants/addimplant.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Store
import useImplantStore from "../../../stores/implantStore";

function AddImplant() {
  const [brandName, setBrandName] = useState("");
  const navigate = useNavigate();

  const { addImplant, loading } = useImplantStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName.trim()) {
      toast.error("Marka adı boş ola bilməz!");
      return;
    }

    const payload = {
      implantBrandName: brandName.trim(),
    };

    try {
      await addImplant(payload);
      toast.success("İmplant uğurla əlavə olundu!");
      setBrandName("");
      setTimeout(() => navigate("/implants"), 1000);
    } catch (error) {
      toast.error("İmplant əlavə edilərkən xəta baş verdi!");
    }
  };

  return (
    <div className="addImplantWrapper">
      <ToastContainer />
      <form className="addImplantContainer" onSubmit={handleSubmit}>
        <div className="addImplantInput">
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

        <div className="addImplantButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => setBrandName("")}
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
      </form>
    </div>
  );
}

export default AddImplant;
