import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";
import usePatientInsuranceStore from "../../../stores/patientInsuranceStore";

const AddInsurancePatient = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const { insuranceCompanyList, fetchList } = useInsuranceCompanyStore();
  const { createPatientInsurance } = usePatientInsuranceStore();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      insuranceCompanyId: Number(formData.insuranceCompanyId),
      deductibleAmount: formData.deductibleAmount ? Number(formData.deductibleAmount) : null,
      annualMaxAmount: formData.annualMaxAmount ? Number(formData.annualMaxAmount) : null,
      patientId: Number(patientId),
    };

    try {
      await createPatientInsurance(payload);
      message.success("Sığorta məlumatı uğurla əlavə edildi!");
      navigate(`/patients/patient/${patientId}/insurance`);
    } catch (err) {
      console.error("Yaratma xətası:", err);
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message || "Sığorta əlavə edilərkən xəta baş verdi";
      message.error(`Xəta (Status: ${status || 500}): ${errorMsg}`);
    }
  };

  const handleCancel = () => {
    navigate(`/patients/patient/${patientId}/insurance`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md max-w-100% mx-auto my-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Sığorta şirkəti */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="insuranceCompanyId"
            className="text-base font-medium text-gray-700 w-1/3">
            Sığorta şirkəti <span className="text-red-500">*</span>
          </label>
          <div className="relative flex-1">
            <select
              id="insuranceCompanyId"
              name="insuranceCompanyId"
              value={formData.insuranceCompanyId}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none pr-10"
              required>
              <option value="">Seçin</option>
              {insuranceCompanyList.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Polis nömrəsi */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="policyNumber"
            className="text-base font-medium text-gray-700 w-1/3">
            Polis No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="policyNumber"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleChange}
            className="block w-full flex-1 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>

        {/* Bitmə tarixi */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="expirationDate"
            className="text-base font-medium text-gray-700 w-1/3">
            Bitmə tarixi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="block w-full flex-1 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
        </div>

        {/* Azadolma məbləği */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="deductibleAmount"
            className="text-base font-medium text-gray-700 w-1/3">
            Azadolma məbləği
          </label>
          <input
            type="number"
            id="deductibleAmount"
            name="deductibleAmount"
            value={formData.deductibleAmount}
            onChange={handleChange}
            className="block w-full flex-1 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* İllik maksimum məbləğ */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="annualMaxAmount"
            className="text-base font-medium text-gray-700 w-1/3">
            İllik maksimum məbləğ
          </label>
          <input
            type="number"
            id="annualMaxAmount"
            name="annualMaxAmount"
            value={formData.annualMaxAmount}
            onChange={handleChange}
            className="block w-full flex-1 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Qeyd */}
        <div className="flex items-start gap-3">
          <label
            htmlFor="description"
            className="text-base font-medium text-gray-700 w-1/3">
            Qeyd
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="block w-full flex-1 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"></textarea>
        </div>

        {/* Düymələr */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
            ✕ İmtina et
          </button>
          <button
            type="submit"
            className="bg-[#155EEF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#124DCC]">
            ✓ Yadda saxla
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInsurancePatient;
