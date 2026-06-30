import React, { useEffect, useState } from "react";
import "../../assets/style/Operations/addopertaion.css";
import { useNavigate, useParams } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaManatSign } from "react-icons/fa6";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";
import usePriceCategoryStore from "../../../stores/priceCategoryStore";

const AddOperation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { fetchAll, insuranceCompanies } = useInsuranceCompanyStore();
  const { create } = useOperationItemsTypeStore();
  const { fetchCategories, categories } = usePriceCategoryStore();

  const [operationName, setOperationName] = useState("");
  const [operationCode, setOperationCode] = useState("");
  const [visibleInTechnicians, setVisibleInTechnicians] = useState(false);
  const [insuranceData, setInsuranceData] = useState([]);
  const [dynamicPrices, setDynamicPrices] = useState([]);

  useEffect(() => {
    fetchAll();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (insuranceCompanies.length) {
      const data = insuranceCompanies.map((company) => ({
        name: company.companyName,
        id: company.id,
        insuranceName: "",
        specificCode: "",
        amount: "",
      }));
      setInsuranceData(data);
    }
  }, [insuranceCompanies]);

  // Qiymət sahələrini kateqoriyalara əsasən hazırla
  useEffect(() => {
    if (categories.length) {
      const prices = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        value: "",
      }));
      setDynamicPrices(prices);
    }
  }, [categories]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleInsuranceChange = (index, field, value) => {
    const updated = [...insuranceData];
    updated[index][field] = value;
    setInsuranceData(updated);
  };

  const handlePriceChange = (index, value) => {
    const updated = [...dynamicPrices];
    updated[index].value = value;
    setDynamicPrices(updated);
  };

  const handleSave = async () => {
    try {
      const prices = dynamicPrices
        .filter((item) => item.value)
        .map((item) => ({
          priceTypeId: 0,
          price: 0.00,
        }));

      const insurances = insuranceData
        .filter((item) => item.insuranceName || item.specificCode || item.amount)
        .map((item) => ({
          name: item.insuranceName || item.name,
          specificCode: item.specificCode || "",
          amount: item.amount ? parseFloat(item.amount) : 0,
          insuranceCompanyId: item.id,
        }));

      const payload = {
        opTypeId: Number(id),
        operationName,
        operationCode,
        amount: dynamicPrices[0]?.value ? parseFloat(dynamicPrices[0].value) : 0,
        showTechnic: visibleInTechnicians,
        status: "ACTIVE",
        prices,
        insurances,
      };

      await create(payload);
      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
    }
  };
console.log(dynamicPrices);

  return (
    <div className="addOperation-container">
      <div className="addOperation-form-section">
        <div className="addOperation-form-group">
          <label htmlFor="operationName">
            Əməliyyatın adı<span>*</span>
          </label>
          <input
            type="text"
            id="operationName"
            className="addOperation-input"
            value={operationName}
            onChange={(e) => setOperationName(e.target.value)}
          />
        </div>

        <div className="addOperation-form-group">
          <label htmlFor="operationCode">
            Əməliyyatın kodu<span>*</span>
          </label>
          <input
            type="text"
            id="operationCode"
            className="addOperation-input"
            value={operationCode}
            onChange={(e) => setOperationCode(e.target.value)}
          />
        </div>

        <div className="addOperation-form-group-prices">
          <label>Qiymətləri</label>
          <div className="addOperation-price-inputs">
            {dynamicPrices.map((price, index) => (
              <div className="addOperation-price-input-group" key={price.id}>
                <label htmlFor={`price-${price.id}`}>{price.name}</label>
                <input
                  type="text"
                  id={`price-${price.id}`}
                  className="addOperation-price-input"
                  placeholder="Qiymət"
                  value={price.value}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="addOperation-form-group-tech">
          <label htmlFor="visibleInTechnicians">
            Texniklarda görünsün<span>*</span>
          </label>
          <input
            type="checkbox"
            id="visibleInTechnicians"
            className="addOperation-checkbox"
            checked={visibleInTechnicians}
            onChange={(e) => setVisibleInTechnicians(e.target.checked)}
          />
        </div>

        <div className="addOperation-insurance-section">
          <label className="addOperation-section-label">Sığorta şirkətləri</label>
          {insuranceData.map((insurance, index) => (
            <div className="addOperation-insurance-item" key={insurance.id}>
              <label className="addOperation-insurance-label">
                {insurance.name}
              </label>

              <div className="addOperation-insurance-input-group">
                <input
                  type="text"
                  className="addOperation-insurance-input"
                  placeholder="Adı"
                  value={insurance.insuranceName}
                  onChange={(e) => handleInsuranceChange(index, "insuranceName", e.target.value)}
                />
                <input
                  type="text"
                  className="addOperation-insurance-input"
                  placeholder="Spesifik kod"
                  value={insurance.specificCode}
                  onChange={(e) => handleInsuranceChange(index, "specificCode", e.target.value)}
                />
                <input
                  type="number"
                  className="addOperation-insurance-input"
                  placeholder="Məbləğ"
                  value={insurance.amount}
                  onChange={(e) => handleInsuranceChange(index, "amount", e.target.value)}
                />

                <span className="addOperation-currency-symbol">
                  <FaManatSign />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="addOperation-buttons">
          <button className="addOperation-cancel-button" onClick={handleCancel}>
            <MdClose /> İmtina et
          </button>
          <button className="addOperation-save-button" onClick={handleSave}>
            <FaRegSave /> Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOperation;
