import React, { useEffect, useState } from "react";
import DownloadIcon from "../../assets/icons/Download";
import SearchIcon from "../../assets/icons/Search";
import InfoIcon from "../../assets/icons/Info";
import EditIcon from "../../assets/icons/Edit";
import DeleteIcon from "../../assets/icons/Delete";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { useNavigate, useParams, Link } from "react-router-dom";
import usePatientInsuranceStore from "../../../stores/patientInsuranceStore";

const StatusToggle = ({ status, onToggle }) => {
  const bgColor = status === "ACTIVE" ? "#40BC2B" : "#FD4A3D";
  const text = status === "ACTIVE" ? "Aktiv" : "Passiv";

  return (
    <button
      onClick={onToggle}
      style={{ backgroundColor: bgColor }}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity duration-200">
      {text}
    </button>
  );
};

const Insurance = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const {
    patientInsurance,
    fetchPatientInsurance,
    loading,
    error,
    updateStatus,
    deletePatientInsurance,
  } = usePatientInsuranceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (patientId) {
      fetchPatientInsurance(Number(patientId));
    }
  }, [fetchPatientInsurance, patientId]);

  useEffect(() => {
    if (Array.isArray(patientInsurance)) {
      if (searchTerm.trim() === "") {
        setFilteredData(patientInsurance);
      } else {
        const filtered = patientInsurance.filter((item) =>
          item.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
      }
    } else {
      setFilteredData([]);
    }
  }, [searchTerm, patientInsurance]);

  const handleEdit = (id) => {
    navigate(`edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`info/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      try {
        await deletePatientInsurance(id);
        if (patientId) {
          fetchPatientInsurance(Number(patientId));
        }
      } catch (e) {
        console.error("Silinmə zamanı xəta:", e);
      }
    }
  };
  const handleStatusToggle = async (insuranceId) => {
    if (!patientId) return;

    try {
      await updateStatus(insuranceId, Number(patientId));
      fetchPatientInsurance(Number(patientId));
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            className="border border-[#E0E0E0] rounded-lg p-2 h-[36px]"
            placeholder="Polis No axtar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <SearchIcon />
          </button>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate("add")}>
            <div className="flex items-center justify-center border border-[#155EEF] text-[#155EEF] w-[178px] h-[36px] rounded-lg p-2 hover:bg-[#155EEF] hover:text-white transition-all duration-300">
              + Yenisini əlavə et
            </div>
          </button>
          <button>
            <DownloadIcon />
          </button>
        </div>
      </div>

      {loading && <p>Yüklənir...</p>}
      {error && (
        <p className="text-red-600">
          Xəta baş verdi: {error.message || error.toString()}
        </p>
      )}

      {!loading && filteredData.length === 0 && (
        <p className="text-center py-4 text-gray-500">
          Sığorta məlumatı tapılmadı
        </p>
      )}

      {filteredData.length > 0 && (
        <div className="w-full rounded-lg shadow-md overflow-hidden text-[14px] border border-[#E0E0E0]">
          <table className="min-w-full divide-y divide-[#E0E0E0] table-fixed">
            <thead className="bg-[#EEF2F6]">
              <tr>
                <th className="w-[5%] px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-500 text-base" />
                    Sığorta şirkəti
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-500 text-base" />
                    Polis No
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-500 text-base" />
                    Bitmə tarixi
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-500 text-base" />
                    Azadolma məbləği
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineArrowsUpDown className="text-gray-500 text-base" />
                    İllik max. məbləğ
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  Sığorta qalıqları
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  Status
                </th>
                <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                  Düzəliş
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E0E0E0]">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {item.insuranceCompanyName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {item.policyNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {item.expirationDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {item.deductibleAmount || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-800">
                    {item.annualMaxAmount || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                    <Link
                      to={`insurance-balance/${item.id}`}
                      className="text-[#155EEF] hover:underline">
                      Sığorta qalıqları ({item.remainingInsuranceCount || 0})
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                    <StatusToggle
                      status={item.status}
                      onToggle={() => handleStatusToggle(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(item.id)}
                        className="text-[#667085] hover:text-[#155EEF] transition-colors duration-200"
                        title="Bax">
                        <InfoIcon />
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-[#667085] hover:text-yellow-600 transition-colors duration-200"
                        title="Düzəlt">
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#667085] hover:text-red-600 transition-colors duration-200"
                        title="Sil">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Insurance;
