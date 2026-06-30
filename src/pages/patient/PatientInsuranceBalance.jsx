import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DownloadIcon from "../../assets/icons/Download";
import EditIcon from "../../assets/icons/Edit";
import DeleteIcon from "../../assets/icons/Delete";
import InfoIcon from "../../assets/icons/Info";
import usePatientInsuranceBalanceStore from "../../../stores/PatientInsuranceBalanceStore";
import BlurLoader from "../../components/layout/BlurLoader";
import { toast } from "react-toastify";

const PatientInsuranceBalance = () => {
    const navigate = useNavigate();
    const { id: insuranceId } = useParams();
    
    const {
        balances,
        loading,
        error,
        fetchBalances,
        removeBalance,
    } = usePatientInsuranceBalanceStore();

    const [filters, setFilters] = useState({
        date: "",
        status: "",
    });

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    // Filter balances by insuranceId and user filters
    const filteredBalances = balances.filter((balance) => {
        // Match insuranceId (assuming the record has it, e.g. patientInsuranceId)
        const matchesInsurance = !insuranceId || balance.patientInsuranceId === Number(insuranceId) || balance.insuranceId === Number(insuranceId);
        
        const matchesDate = !filters.date || balance.date === filters.date;
        const matchesStatus = !filters.status || balance.status === filters.status;
        
        return matchesInsurance && matchesDate && matchesStatus;
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleAddNew = () => {
        navigate('add');
    };

    const handleEdit = (id) => {
        navigate(`edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Məlumatı silmək istədiyinizə əminsinizmi?`)) {
            try {
                await removeBalance(id);
                toast.success("Balans uğurla silindi");
            } catch (err) {
                toast.error("Silinərkən xəta baş verdi");
            }
        }
    };

    const handleViewHistory = (id) => {
        navigate(`info/${id}`)
    };

    return (
        <BlurLoader isLoading={loading}>
            <div className="flex flex-col gap-4">
                {/* Filter and Add New Section */}
                <div className="flex justify-between gap-4">
                    <div className="flex gap-4">
                        {/* Tarix filtri */}
                        <div className="relative">
                            <input
                                type="date"
                                id="filterDate"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                                className="block w-full pl-3 pr-10 py-2.5 border border-[#E0E0E0] rounded-lg shadow-sm focus:outline-none focus:ring-[#155EEF] focus:border-[#155EEF] text-sm"
                                title="Tarixə görə filtr"
                            />
                        </div>

                        {/* Status filtri */}
                        <div className="relative">
                            <select
                                id="filterStatus"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="block w-full px-3 py-2.5 border border-[#E0E0E0] rounded-lg shadow-sm focus:outline-none focus:ring-[#155EEF] focus:border-[#155EEF] text-sm appearance-none pr-10"
                                title="Statusa görə filtr"
                            >
                                <option value="">Status</option>
                                <option value="ACTIVE">Aktiv</option>
                                <option value="PASSIVE">Passiv</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center justify-center border border-[#155EEF] text-[#155EEF] px-4 h-[40px] rounded-lg text-sm font-medium hover:bg-[#155EEF] hover:text-white transition-all duration-300"
                        >
                            <span className="mr-2">+</span> Yenisini əlavə et
                        </button>
                        <button
                            onClick={() => console.log("Məlumatlar yükləndi")}
                            className="flex items-center justify-center border border-[#E0E0E0] text-gray-700 w-[36px] h-[40px] rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                            title="Məlumatı yüklə"
                        >
                            <DownloadIcon />
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-600">Xəta: {error}</p>}

                {/* Cədvəl hissəsi */}
                <div className="w-full rounded-lg shadow-md overflow-hidden text-[14px] border border-[#E0E0E0]">
                    <table className="min-w-full divide-y divide-[#E0E0E0] table-fixed">
                        <thead className="bg-[#EEF2F6]">
                            <tr>
                                <th scope="col" className="w-[5%] px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                                    {filteredBalances.length === 0 ? '0' : `1-${filteredBalances.length}`}
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                                    Tarix
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                                    Məbləğ
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="w-[15%] px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                                    Düzəliş
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#E0E0E0]">
                            {filteredBalances.map((balance, index) => (
                                <tr key={balance.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                                        {balance.date}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                                        {balance.amount} ₼
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <div
                                            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${
                                                balance.status === "ACTIVE" ? "bg-[#40BC2B]" : "bg-[#FD4A3D]"
                                            }`}
                                        >
                                            {balance.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewHistory(balance.id)}
                                                className="text-[#667085] hover:text-[#155EEF] transition-colors duration-200"
                                                title="Tarixçəyə bax"
                                            >
                                                <InfoIcon />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(balance.id)}
                                                className="text-[#667085] hover:text-yellow-600 transition-colors duration-200"
                                                title="Redaktə et"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(balance.id)}
                                                className="text-[#667085] hover:text-red-600 transition-colors duration-200"
                                                title="Sil"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBalances.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500 italic">
                                        Məlumat tapılmadı
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </BlurLoader>
    );
};

export default PatientInsuranceBalance;