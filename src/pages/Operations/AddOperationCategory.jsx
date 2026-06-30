import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/style/Operations/addoperationcategory.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaPercentage } from "react-icons/fa";
import useOperationTypesStore from "../../../stores/operationsTypeStore";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";

function AddOperationCategory() {
  const navigate = useNavigate();
  const createOperation = useOperationTypesStore((state) => state.create);
  const { insuranceCompanyList, fetchList, loading, error } = useInsuranceCompanyStore();

  const [operationCategoryName, setOperationCategoryName] = useState("");
  const [operationCategoryCode, setOperationCategoryCode] = useState("");
  const [isColorSelection, setIsColorSelection] = useState(false);
  const [isImplantSelection, setIsImplantSelection] = useState(false);
  const [insurancePercentages, setInsurancePercentages] = useState({});

  // Error states
  const [errors, setErrors] = useState({
    categoryName: false,
    categoryCode: false,
    insurances: {}
  });

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handlePercentageChange = (id, value) => {
    setInsurancePercentages((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when user starts typing
    if (errors.insurances[id]) {
      setErrors((prev) => ({
        ...prev,
        insurances: {
          ...prev.insurances,
          [id]: false
        }
      }));
    }
  };

  const handleCategoryNameChange = (value) => {
    setOperationCategoryName(value);

    // Clear error when user starts typing
    if (errors.categoryName) {
      setErrors((prev) => ({
        ...prev,
        categoryName: false
      }));
    }
  };

  const handleCategoryCodeChange = (value) => {
    setOperationCategoryCode(value);

    if (errors.categoryCode) {
      setErrors((prev) => ({
        ...prev,
        categoryCode: false
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {
      categoryName: false,
      insurances: {}
    };

    // Check category name
    if (!operationCategoryName.trim()) {
      newErrors.categoryName = true;
      hasError = true;
    }

    if (!operationCategoryCode.trim()) {
      newErrors.categoryCode = true;
      hasError = true;
    }


    // Check all insurance percentages - they are all required
    insuranceCompanyList.forEach((company) => {
      const value = insurancePercentages[company.id];
      if (!value || value.trim() === "") {
        newErrors.insurances[company.id] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      toast.error("Bütün tələb olunan xanaları doldurun!");
      return;
    }

    const insurances = insuranceCompanyList
      .filter((company) => insurancePercentages[company.id])
      .map((company) => ({
        insuranceCompanyId: company.id,
        deductiblePercentage: Number(insurancePercentages[company.id]) || 0,
      }));

    const payload = {
      categoryName: operationCategoryName,
      categoryCode: operationCategoryCode,
      status: "ACTIVE",
      colorSelection: isColorSelection,
      implantSelection: isImplantSelection,
      insurances,
    };


    try {
      await createOperation(payload);
      toast.success("Əməliyyat kateqoriyası uğurla əlavə olundu!");
      setTimeout(() => navigate("/operations"), 1500);
    } catch (err) {
      toast.error("Əlavə olunarkən xəta baş verdi!");
    }
  };

  return (
    <div className="addOperationWrapper">
      <ToastContainer />
      <form className="addOperationContainer" onSubmit={handleSubmit}>
        <div className="addOperationInputGroup">
          <p>
            Əməliyyat kateqoriyasının adı<span>*</span>
          </p>
          <input
            type="text"
            placeholder={errors.categoryName ? "Bu xana tələb olunur!" : "Əməliyyat kateqoriyasının adı"}
            value={operationCategoryName}
            onChange={(e) => handleCategoryNameChange(e.target.value)}
            style={{
              borderColor: errors.categoryName ? "red" : "",
              backgroundColor: errors.categoryName ? "#ffe6e6" : ""
            }}
          />
        </div>
        <div className="addOperationInputGroup">
          <p>
            Əməliyyat kateqoriyasının kodu<span>*</span>
          </p>
          <input
            type="text"
            placeholder={errors.categoryCode ? "Bu xana tələb olunur!" : "Əməliyyat kateqoriyasının kodu"}
            value={operationCategoryCode}
            onChange={(e) => handleCategoryCodeChange(e.target.value)}
            style={{
              borderColor: errors.categoryCode ? "red" : "",
              backgroundColor: errors.categoryCode ? "#ffe6e6" : ""
            }}
          />

        </div>

        <div className="addOperationCheckboxGroup ">
          <label className="addOperationCheckboxLabel -ml-55">
            Rəng seçimi
            <input
              type="checkbox"
              checked={isColorSelection}
              onChange={(e) => setIsColorSelection(e.target.checked)}
              className="ml-38"
            />
          </label>
          <label className="addOperationCheckboxLabel -ml-55">
            İmplant seçimi
            <input
              type="checkbox"
              checked={isImplantSelection}
              onChange={(e) => setIsImplantSelection(e.target.checked)}
              className="ml-33"
            />
          </label>
        </div>

        <div className="addOperationInsuranceSection">
          {loading && <p style={{ color: "gray" }}>Yüklənir...</p>}

          {error && <p style={{ color: "red" }}>Xəta baş verdi: {error.message || error.toString()}</p>}

          {!loading && !error && insuranceCompanyList.length === 0 && (
            <p style={{ color: "gray" }}>Sığorta şirkətləri tapılmadı...</p>
          )}

          {!loading && !error && insuranceCompanyList.length > 0 && insuranceCompanyList.map((company) => (
            <div className="addOperationInsuranceItem" key={company.id}>
              <p>{company.companyName}</p>
              <div
                className="addOperationPercentageInput ml-7"
                style={{
                  borderColor: errors.insurances[company.id] ? "red" : "",
                }}
              >
                <input
                  type="text"
                  placeholder={errors.insurances[company.id] ? "Bu xana tələb olunur!" : "Azadolma faizi"}
                  value={insurancePercentages[company.id] || ""}
                  onChange={(e) =>
                    handlePercentageChange(company.id, e.target.value)
                  }
                  style={{
                    backgroundColor: errors.insurances[company.id] ? "#ffe6e6" : "",
                    border: "none"
                  }}
                />
                <span>
                  <FaPercentage />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="addOperationButtons">
          <button
            type="button"
            className="cancelFormCondition"
            onClick={() => navigate("/operations")}
          >
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

export default AddOperationCategory;