import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/style/DentalSet/editdentalset.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import useGarnitureStore from "../../../stores/garnitureStore";

function EditDentalSet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedGarniture,
    fetchGarnitureById,
    editGarniture,
    loading,
    error,
  } = useGarnitureStore();

  const [formData, setFormData] = useState({
    setName: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Backenddən seçilmiş garniture-ni gətir
  useEffect(() => {
    if (id) {
      (async () => {
        await fetchGarnitureById(id);
      })();
    }
  }, [id, fetchGarnitureById]);

  // selectedGarniture dəyişəndə formu doldur
  useEffect(() => {
    console.log("selectedGarniture:", selectedGarniture);
    if (selectedGarniture) {
      // Backenddən gələn data strukturuna uyğun yoxlama
      const nameValue =
        selectedGarniture.name ??
        selectedGarniture.setName ??
        selectedGarniture.title ??
        "";
      setFormData({
        setName: nameValue,
      });
    }
  }, [selectedGarniture]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.setName.trim()) {
      errors.setName = "Qarniturun adı tələb olunur";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const payload = {
      name: formData.setName,
    };

    try {
      await editGarniture(id, payload);
      alert("Qarnitur uğurla yeniləndi!");
      navigate("/dental-set");
    } catch (err) {
      alert(`Xəta baş verdi: ${err.message}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="editDentalSetWrapper">
      <form className="editDentalSetContainer" onSubmit={handleSubmit}>
        <div className="editDentalSetInput">
          <label>
            Qarniturun adı<span>*</span>
          </label>
          <input
            type="text"
            name="setName"
            placeholder="Qarniturun adı"
            value={formData.setName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {formErrors.setName && (
            <span className="error">{formErrors.setName}</span>
          )}
        </div>

        <div className="editDentalSetButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={handleCancel}
            disabled={loading}
          >
            <img src={cancelButton} alt="İmtina et" />
            İmtina et
          </button>
          <button
            type="submit"
            className="acceptFormCondition"
            disabled={loading}
          >
            <img src={acceptButton} alt="Yadda saxla" />
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

export default EditDentalSet;
