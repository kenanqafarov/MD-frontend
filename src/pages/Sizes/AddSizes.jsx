// React
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/Sizes/addsizes.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddSizes() {
  const [diameter, setDiameter] = useState("");
  const [length, setLength] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diameter.trim() || !length.trim()) return;

    try {
      // Static data example
      const newSize = {
        id: Math.random().toString(36).substr(2, 9),
        diameter: diameter.trim(),
        length: length.trim(),
      };

      console.log("New Size:", newSize);
      setDiameter("");
      setLength("");
      toast.success("Ölçü uğurla əlavə olundu!");
      navigate("/sizes");
    } catch (error) {
      console.error("Ölçü əlavə edilərkən xəta:", error);
      toast.error("Ölçü əlavə edilərkən xəta baş verdi!");
    }
  };

  return (
    <div className="addSizesWrapper">
      <form className="addSizesContainer" onSubmit={handleSubmit}>
        <div className="addSizesInput">
          <p>
            Diametir<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Diametir"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
          />
        </div>

        <div className="addSizesInput">
          <p>
            Uzunluq<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Uzunluq"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
        </div>

        <div className="addSizesButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => {
              setDiameter("");
              setLength("");
            }}>
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button type="submit" className="acceptFormCondition">
            <img src={acceptButton} alt="accept" />
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSizes; 