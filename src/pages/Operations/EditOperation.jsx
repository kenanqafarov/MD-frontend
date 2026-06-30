import React, { useState, useEffect } from "react";
import "../../assets/style/Operations/editoperation.css";
import { useNavigate, useParams } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaManatSign } from "react-icons/fa6";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";

const EditOperation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { insuranceCompanies, fetchAll: fetchAllInsurance } =
    useInsuranceCompanyStore();
  const { selectedOperationItemsType, fetchById, updateOp } =
    useOperationItemsTypeStore();

  // Local state
  const [operationName, setOperationName] = useState("");
  const [operationCode, setOperationCode] = useState("");
  const [visibleInTechnicians, setVisibleInTechnicians] = useState(false);
  const [price, setPrice] = useState("");
  const [insuranceData, setInsuranceData] = useState([]);

  // Load data
  useEffect(() => {
    if (id) {
      fetchById(Number(id));
    }
    fetchAllInsurance();
  }, [id]);

  // Fill data
  useEffect(() => {
    if (!selectedOperationItemsType || !insuranceCompanies.length) return;

    setOperationName(selectedOperationItemsType.operationName || "");
    setOperationCode(selectedOperationItemsType.operationCode || "");
    setVisibleInTechnicians(!!selectedOperationItemsType.showTechnic);
    setPrice(
      selectedOperationItemsType.price != null
        ? selectedOperationItemsType.price.toString()
        : ""
    );

    const insurancesFromApi = selectedOperationItemsType.insurances || [];

    const insuranceMap = insuranceCompanies.map((company) => {
      const found = insurancesFromApi.find(
        (ins) => ins.insuranceCompanyId === company.id
      );

      return {
        id: company.id,
        name: company.companyName,
        insuranceName: found?.name || "",
        specificCode: found?.specificCode || "",
        amount:
          found?.amount != null ? found.amount.toString() : "",
      };
    });

    setInsuranceData(insuranceMap);
  }, [selectedOperationItemsType, insuranceCompanies]);

  // Insurance change handler
  const handleInsuranceChange = (index, field, value) => {
    const updated = [...insuranceData];
    updated[index][field] = value;
    setInsuranceData(updated);
  };

  // Save
  const handleSave = async () => {
    const payload = {
      operationName,
      operationCode,
      showTechnic: visibleInTechnicians,
      price: parseFloat(price) || 0,
      insurances: insuranceData
        .filter((item) => item.insuranceName || item.specificCode || item.amount)
        .map((ins) => ({
          name: ins.insuranceName || ins.name,
          specificCode: ins.specificCode || "",
          amount: ins.amount ? parseFloat(ins.amount) : 0,
          insuranceCompanyId: ins.id,
        })),
    };

    try {
      await updateOp(Number(id), payload);
      navigate(-1);
    } catch (err) {
      console.error("Update operation error:", err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="editOperation-container">
      <div className="editOperation-form-section">
        <div className="editOperation-form-group">
          <label htmlFor="operationName">
            Əməliyyatın adı <span>*</span>
          </label>
          <input
            type="text"
            id="operationName"
            className="editOperation-input"
            value={operationName}
            onChange={(e) => setOperationName(e.target.value)}
          />
        </div>

        <div className="editOperation-form-group">
          <label htmlFor="operationCode">
            Əməliyyatın kodu <span>*</span>
          </label>
          <input
            type="text"
            id="operationCode"
            className="editOperation-input"
            value={operationCode}
            onChange={(e) => setOperationCode(e.target.value)}
          />
        </div>

        {/* Single price */}
        <div className="editOperation-form-group">
          <label htmlFor="operationPrice">
            Qiymət <span>*</span>
          </label>
          <div className="editOperation-price-wrapper">
            <input
              type="number"
              id="operationPrice"
              className="editOperation-input"
              placeholder="Qiymət"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="editOperation-form-group-tech editOperation-checkbox-group">
          <label htmlFor="visibleInTechnicians">
            Texniklarda görünsün <span>*</span>
          </label>
          <input
            type="checkbox"
            id="visibleInTechnicians"
            className="editOperation-checkbox"
            checked={visibleInTechnicians}
            onChange={(e) => setVisibleInTechnicians(e.target.checked)}
          />
        </div>

        <div className="editOperation-insurance-section">
          <label className="editOperation-section-label">
            Sığorta şirkətləri
          </label>

          {insuranceData.length > 0 ? (
            insuranceData.map((insurance, index) => (
              <div
                className="editOperation-insurance-item"
                key={insurance.id}
              >
                <label className="editOperation-insurance-label">
                  {insurance.name}
                </label>
                <div className="editOperation-insurance-input-group">
                  <input
                    type="text"
                    className="editOperation-insurance-input"
                    placeholder="Adı"
                    value={insurance.insuranceName}
                    onChange={(e) =>
                      handleInsuranceChange(
                        index,
                        "insuranceName",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    className="editOperation-insurance-input"
                    placeholder="Spesifik kod"
                    value={insurance.specificCode}
                    onChange={(e) =>
                      handleInsuranceChange(
                        index,
                        "specificCode",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    className="editOperation-insurance-input"
                    placeholder="Məbləğ"
                    value={insurance.amount}
                    onChange={(e) =>
                      handleInsuranceChange(
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                  />
                  <span className="editOperation-currency-symbol">
                    <FaManatSign />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Sığorta şirkətləri mövcud deyil</p>
          )}
        </div>

        <div className="editOperation-buttons">
          <button
            className="editOperation-cancel-button"
            onClick={handleCancel}
          >
            <MdClose /> İmtina et
          </button>
          <button
            className="editOperation-save-button"
            onClick={handleSave}
          >
            <FaRegSave /> Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOperation;
