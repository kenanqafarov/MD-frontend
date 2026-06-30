import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePatientInsuranceStore from "../../../stores/patientInsuranceStore";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";

const EditInsurancePatient = () => {
  const navigate = useNavigate();
  const { patientId, insuranceId } = useParams();

  const {
    updatePatientInsurance,
    fetchPatientInsurance,
    fetchPatientInsuranceById,
  } = usePatientInsuranceStore();

  const { insuranceCompanyList, fetchList } = useInsuranceCompanyStore();

  const [formData, setFormData] = useState({
    insuranceCompanyId: "",
    policyNumber: "",
    expirationDate: "",
    deductibleAmount: "",
    annualMaxAmount: "",
    description: "",
  });

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    async function fetchData() {
      if (patientId && insuranceId) {
        try {
          const response = await fetchPatientInsuranceById(Number(insuranceId));
          // Backenddən gələn cavab arraydir, ilk elementi götürürük
          const dataArray = response?.data || response;
          const data = Array.isArray(dataArray) && dataArray.length > 0 ? dataArray[0] : null;

          if (data) {
            // insuranceCompanyId backenddə yoxdursa, insuranceCompanyName əsasında tapırıq
            let insuranceCompanyId = "";
            if ("insuranceCompanyId" in data) {
              insuranceCompanyId = data.insuranceCompanyId?.toString() || "";
            } else if (data.insuranceCompanyName) {
              const company = insuranceCompanyList.find(
                (c) =>
                  c.companyName === data.insuranceCompanyName ||
                  c.name === data.insuranceCompanyName
              );
              insuranceCompanyId = company ? company.id.toString() : "";
            }

            setFormData({
              insuranceCompanyId,
              policyNumber: data.policyNumber || "",
              expirationDate: data.expirationDate || "",
              deductibleAmount: data.deductibleAmount ?? "",
              annualMaxAmount: data.annualMaxAmount ?? "",
              description: data.description || "",
            });
          }
        } catch (error) {
          console.error("Sığorta məlumatı yüklənərkən xəta:", error);
        }
      }
    }
    fetchData();
  }, [patientId, insuranceId, fetchPatientInsuranceById, insuranceCompanyList]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "insuranceCompanyId") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === "deductibleAmount" || name === "annualMaxAmount") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        insuranceCompanyId: Number(formData.insuranceCompanyId),
      };

      await updatePatientInsurance(Number(insuranceId), payload);
      await fetchPatientInsurance(Number(patientId));
      navigate(`/patients/patient/${patientId}/insurance/info/${insuranceId}`);
    } catch (error) {
      console.error("Yeniləmə xətası:", error);
    }
  };

  const handleCancel = () => {
    navigate(`/patients/patient/${patientId}/insurance/info/${insuranceId}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md max-w-100% mx-auto my-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <label
            htmlFor="insuranceCompanyId"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            Sığorta şirkəti <span className="text-red-500">*</span>
          </label>
          <select
            id="insuranceCompanyId"
            name="insuranceCompanyId"
            value={formData.insuranceCompanyId}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Seçin</option>
            {insuranceCompanyList.map((company) => (
              <option key={company.id} value={company.id.toString()}>
                {company.companyName || company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="policyNumber"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            Polis No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="policyNumber"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="expirationDate"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            Bitmə tarixi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="deductibleAmount"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            Azadolma məbləği
          </label>
          <input
            type="number"
            id="deductibleAmount"
            name="deductibleAmount"
            value={formData.deductibleAmount}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="annualMaxAmount"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            İllik maksimum məbləğ
          </label>
          <input
            type="number"
            id="annualMaxAmount"
            name="annualMaxAmount"
            value={formData.annualMaxAmount}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-start gap-3">
          <label
            htmlFor="description"
            className="text-base font-medium text-gray-700 w-1/3"
          >
            Qeyd
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
          >
            <span className="mr-2">✕</span> İmtina et
          </button>
          <button
            type="submit"
            className="flex items-center justify-center bg-[#155EEF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#124DCC] transition-all duration-300"
          >
            <span className="mr-2">✓</span> Dəyişiklikləri yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInsurancePatient;
