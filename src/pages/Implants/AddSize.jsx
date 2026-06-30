import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useImplantSizeStore from "../../../stores/ImplantSizeStore";
import "../../assets/style/Implants/addsizes.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddSize() {
  const [diameter, setDiameter] = useState("");
  const [length, setLength] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { addImplantSize, loading } = useImplantSizeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diameter.trim() || !length.trim()) {
      toast.error("Bütün sahələri doldurun!");
      return;
    }

    try {
      const newSize = {
        implantSizeId: Number(id),
        diameter: parseFloat(diameter),
        length: parseFloat(length),
      };

      console.log("Göndərilən data:", newSize);

      await addImplantSize(newSize);

      setDiameter("");
      setLength("");
      toast.success("Ölçü uğurla əlavə olundu!");
      navigate(`/implants/sizes/${id}`);
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
            type="number"
            step="0.1"
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
            type="number"
            step="0.1"
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

          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}>
            <img src={acceptButton} alt="accept" />
            {loading ? "Yüklənir..." : "Yadda saxla"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default AddSize;
