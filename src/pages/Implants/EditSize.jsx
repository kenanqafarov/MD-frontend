// React
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Style
import "../../assets/style/Implants/editsizes.css";

// Images
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Store
import useImplantSizeStore from "../../../stores/ImplantSizeStore";

function EditSize() {
  const [diameter, setDiameter] = useState("");
  const [length, setLength] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { name: implantId, id: sizeId } = useParams(); // Route: /implants/sizes/:name/edit/:id
  const { implants, fetchImplantsWithSizes, editImplantSize } = useImplantSizeStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchImplantsWithSizes();
        setLoading(false);
      } catch (error) {
        console.error("Məlumat yükləməkdə xəta:", error);
        toast.error("Məlumat yükləməkdə xəta baş verdi!");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    console.log("implants:", implants);
    console.log("implantId:", implantId, "sizeId:", sizeId);
    
    if (implants.length > 0 && sizeId && implantId) {
      const implant = implants.find((impl) => impl.id === Number(implantId));
      console.log("Tapılan implant:", implant);
      
      const size = implant?.implantSizesReads?.find((s) => s.id === Number(sizeId));
      console.log("Tapılan size:", size);
      
      if (size) {
        setDiameter(String(size.diameter));
        setLength(String(size.length));
        console.log("Size yükləndi - Diameter:", size.diameter, "Length:", size.length);
      } else {
        console.error("Size tapılmadı!");
        toast.error("Ölçü tapılmadı!");
      }
    }
  }, [sizeId, implantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diameter.trim() || !length.trim()) {
      toast.error("Bütün sahələri doldurun!");
      return;
    }

    try {
      const updatedSize = {
        id: Number(sizeId),
        implantSizeId: Number(implantId),
        diameter: parseFloat(diameter),
        length: parseFloat(length),
      };

      console.log("Göndərilən data:", updatedSize);

      await editImplantSize(updatedSize);
      toast.success("Ölçü uğurla yeniləndi!");
      navigate(`/implants/sizes/${implantId}`);
    } catch (error) {
      console.error("Ölçü yenilənərkən xəta:", error);
      toast.error("Ölçü yenilənərkən xəta baş verdi!");
    }
  };

  return (
    <div className="editSizesWrapper">
      {loading ? (
        <p>Yüklənir...</p>
      ) : (
        <form className="editSizesContainer" onSubmit={handleSubmit}>
          <div className="editSizesInput">
            <p>
              Diametr<span>*</span>
            </p>
            <input
              type="number"
              step="0.1"
              placeholder="Diametr"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            />
          </div>

          <div className="editSizesInput">
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

          <div className="editSizesButtons">
            <button
              type="button"
              className="cancelFormCondition"
              onClick={() => navigate(`/implants/sizes/${implantId}`)}>
              <img src={cancelButton} alt="cancel" />
              İmtina et
            </button>

            <button type="submit" className="acceptFormCondition">
              <img src={acceptButton} alt="accept" />
              Yadda saxla
            </button>
          </div>
        </form>
      )}
      <ToastContainer />
    </div>
  );
}

export default EditSize; 