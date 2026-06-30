import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/style/Insurance/editinsurance.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";

import useInsuranceCompanyStore from "../../../stores/insuranceStore";

function EditInsurance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { selectedCompany, fetchById, update, clearSelected } =
    useInsuranceCompanyStore();

  const [formData, setFormData] = useState({
    companyName: "",
    deductibleAmount: "",
    status: "ACTIVE",
  });
  const [formErrors, setFormErrors] = useState({});

  // Məlumatı store-dan götür və formu doldur
  useEffect(() => {
    fetchById(id);

    // Təmizləmə (unmount zamanı)
    return () => {
      clearSelected();
    };
  }, [id]);

  // selectedCompany dəyişəndə formu yenilə
  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        companyName: selectedCompany.companyName || "",
        deductibleAmount: selectedCompany.deductibleAmount?.toString() || "",
        status: selectedCompany.status || "ACTIVE",
      });
    }
  }, [selectedCompany]);

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

  const handleStatusChange = (e) => {
    const newStatus = e.target.value.toUpperCase();
    const confirmMessage =
      newStatus === "ACTIVE"
        ? "Sığortanı aktiv etmək istədiyinizə əminsiniz?"
        : "Sığortanı passiv etmək istədiyinizə əminsiniz?";

    if (window.confirm(confirmMessage)) {
      setFormData((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } else {
      e.target.value = formData.status;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim())
      errors.companyName = "Sığorta şirkəti tələb olunur";
    if (!formData.deductibleAmount.trim())
      errors.deductibleAmount = "Azadolma məbləği tələb olunur";
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
      companyName: formData.companyName,
      deductibleAmount: Number(formData.deductibleAmount),
      status: formData.status,
    };

    try {
      await update(id, payload);
      alert("Sığorta uğurla yeniləndi!");
      navigate("/insurance");
    } catch (err) {
      alert(`Xəta baş verdi: ${err.message}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="editInsuranceWrapper">
      <form className="editInsuranceContainer" onSubmit={handleSubmit}>
        <div className="editInsuranceInput">
          <label>
            Sığorta şirkəti<span>*</span>
          </label>
          <input
            type="text"
            name="companyName"
            placeholder="Sığorta şirkəti"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
          {formErrors.companyName && (
            <span className="error">{formErrors.companyName}</span>
          )}
        </div>

        <div className="editInsuranceInput">
          <label>
            Azadolma məbləği<span>*</span>
          </label>
          <input
            type="number"
            name="deductibleAmount"
            placeholder="Azadolma məbləği"
            value={formData.deductibleAmount}
            onChange={handleChange}
            required
          />
          {formErrors.deductibleAmount && (
            <span className="error">{formErrors.deductibleAmount}</span>
          )}
        </div>

        <div className="editInsuranceInput">
          <label>
            Status<span>*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleStatusChange}>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
        </div>

        <div className="editInsuranceButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={handleCancel}>
            <img src={cancelButton} alt="İmtina et" />
            İmtina et
          </button>
          <button type="submit" className="acceptFormCondition">
            <img src={acceptButton} alt="Yadda saxla" />
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditInsurance;
