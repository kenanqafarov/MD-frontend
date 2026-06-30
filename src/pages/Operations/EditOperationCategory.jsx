import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/style/Operations/editoperationcategory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaPercentage } from "react-icons/fa";
import useOperationTypesStore from "../../../stores/operationsTypeStore";

function EditOperationCategory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedOperationType, fetchById, update } = useOperationTypesStore();

  const [operationCategoryName, setOperationCategoryName] = useState("");
  const [isColorSelection, setIsColorSelection] = useState(false);
  const [isImplantSelection, setIsImplantSelection] = useState(false);
  const [insurancePercentages, setInsurancePercentages] = useState({});

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  useEffect(() => {
    if (selectedOperationType) {
      setOperationCategoryName(selectedOperationType.categoryName || "");
      setIsColorSelection(!!selectedOperationType.colorSelection);
      setIsImplantSelection(!!selectedOperationType.implantSelection);

      const percentages = {};
      if (Array.isArray(selectedOperationType.insurances)) {
        selectedOperationType.insurances.forEach((ins) => {
          percentages[ins.insuranceCompanyId] =
            ins.deductiblePercentage?.toString() || "";
        });
      }
      setInsurancePercentages(percentages);
    }
  }, [selectedOperationType]);

  const handlePercentageChange = (insuranceCompanyId, value) => {
    if (/^\d*$/.test(value)) {
      setInsurancePercentages((prev) => ({
        ...prev,
        [insuranceCompanyId]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!operationCategoryName.trim()) {
      toast.error("Əməliyyat kateqoriyasının adı boş ola bilməz!");
      return;
    }

    const insurances = Object.entries(insurancePercentages)
      .filter(([_, val]) => val !== "" && !isNaN(Number(val)))
      .map(([insuranceCompanyId, deductiblePercentage]) => ({
        insuranceCompanyId: Number(insuranceCompanyId),
        deductiblePercentage: Number(deductiblePercentage),
      }));

    const payload = {
      categoryName: operationCategoryName,
      colorSelection: isColorSelection,
      implantSelection: isImplantSelection,
      insurances,
    };

    try {
      await update(id, payload);
      toast.success("Əməliyyat kateqoriyası uğurla yeniləndi!");
      setTimeout(() => navigate("/operations"), 1500);
    } catch (err) {
      toast.error("Yeniləmə zamanı xəta baş verdi!");
    }
  };

  if (!selectedOperationType) {
    return <p>Yüklənir...</p>;
  }

  return (
    <div className="editOperationWrapper">
      <ToastContainer />
      <form className="editOperationContainer" onSubmit={handleSubmit}>
        <div className="editOperationInputGroup">
          <p>
            Əməliyyat kateqoriyasının adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder="Əməliyyat kateqoriyasının adı"
            value={operationCategoryName}
            onChange={(e) => setOperationCategoryName(e.target.value)}
          />
        </div>

        <div className="editOperationCheckboxGroup">
          <label className="editOperationCheckboxLabel">
            <input
              type="checkbox"
              checked={isColorSelection}
              onChange={(e) => setIsColorSelection(e.target.checked)}
            />
            Rəng seçimi
          </label>
          <label className="editOperationCheckboxLabel">
            <input
              type="checkbox"
              checked={isImplantSelection}
              onChange={(e) => setIsImplantSelection(e.target.checked)}
            />
            İmplant seçimi
          </label>
        </div>

        <div className="editOperationInsuranceSection">
          {selectedOperationType.insurances?.map((ins) => (
            <div
              className="editOperationInsuranceItem"
              key={ins.insuranceCompanyId}>
              <p>{ins.companyName || `Sığorta #${ins.insuranceCompanyId}`}</p>
              <div className="editOperationPercentageInput">
                <input
                  type="text"
                  placeholder="Azadolma faizi"
                  value={insurancePercentages[ins.insuranceCompanyId] || ""}
                  onChange={(e) =>
                    handlePercentageChange(
                      ins.insuranceCompanyId,
                      e.target.value
                    )
                  }
                />
                <span>
                  <FaPercentage />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="editOperationButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate("/operations")}>
            <RxCross2 />
            İmtina et
          </button>
          <button type="submit" className="acceptFormCondition">
            <IoCheckmarkOutline />
            Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditOperationCategory;
