// InfoInsurancePatient.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { LuPenLine } from "react-icons/lu"; // Yeni Edit iconu
import { GoTrash } from "react-icons/go"; // Yeni Delete iconu

// patientId və insuranceId proplarını qəbul edirik
const InfoInsurancePatient = ({ patientId = 2, insuranceId = 1 }) => { // Nümunə dəyərlər
    const navigate = useNavigate();

    // Məlumatı hardansa almalıyıq (məsələn, API-dən və ya prop kimi)
    // Nümunə məlumatı:
    const insuranceData = {
        insuranceCompany: "Paşa Sığorta",
        policyNo: "POLIS123456789",
        expiryDate: "2026-12-31",
        deductibleAmount: "200 AZN",
        maxAnnualAmount: "10000 AZN",
        note: "Bu sığorta paketi standart tibbi xidmətləri əhatə edir. Diş müalicəsi daxil deyil.",
    };

    const handleEdit = () => {
        console.log("Dəyişiklik et düyməsi basıldı.");
        // Dinamik URL istifadə edərək redaktə səhifəsinə yönləndir
        navigate(`/patients/patient/${patientId}/insurance/edit/${insuranceId}`);
    };

    const handleDelete = () => {
        console.log("Sil düyməsi basıldı.");
        alert("Sığorta məlumatı silinəcək!");
        // Silindikdən sonra geri qayıtmaq üçün navigate(-1) və ya müəyyən bir səhifəyə navigate edə bilərsiniz
    };

    const handleBack = () => {
        navigate(-1); // Bir səhifə geri qayıt
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md max-w-100% mx-auto my-8">
            <div className="flex justify-end items-center mb-4">
                <div className="flex gap-4">
                    <button
                        onClick={handleEdit}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Dəyişiklik et"
                    >
                        <LuPenLine className="h-6 w-6 text-blue-600" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Sil"
                    >
                        <GoTrash className="h-6 w-6 text-red-600" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                {/* Sığorta şirkəti */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        Sığorta şirkəti:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800">
                        {insuranceData.insuranceCompany}
                    </div>
                </div>

                {/* Polis No */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        Polis No:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800">
                        {insuranceData.policyNo}
                    </div>
                </div>

                {/* Bitmə tarixi */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        Bitmə tarixi:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800">
                        {insuranceData.expiryDate}
                    </div>
                </div>

                {/* Azadolma məbləği */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        Azadolma məbləği:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800">
                        {insuranceData.deductibleAmount}
                    </div>
                </div>

                {/* İllik maksimum məbləğ */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        İllik maksimum məbləğ:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800">
                        {insuranceData.maxAnnualAmount}
                    </div>
                </div>

                {/* Qeyd */}
                <div className="flex items-start gap-3">
                    <label className="text-base font-medium text-gray-700 w-1/3">
                        Qeyd:
                    </label>
                    <div className="flex-1 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 min-h-[100px] whitespace-pre-wrap">
                        {insuranceData.note}
                    </div>
                </div>

                {/* Geri Qayıt düyməsi */}
                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                    >
                        Geri Qayıt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoInsurancePatient;