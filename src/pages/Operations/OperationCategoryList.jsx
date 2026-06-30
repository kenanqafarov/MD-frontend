import React, { useEffect, useState } from "react";
import "../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import useOperationTypesStore from "../../../stores/operationsTypeStore";

const OperationCategoryList = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Store-dan state və funksiyaları çəkmək
  const {
    operationTypes,
    loading,
    error,
    fetchAll,
    remove,
    updateStatus // 🔥 Status dəyişmə funksiyası
  } = useOperationTypesStore();

  // Komponent mount olanda data yüklə
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filtered data
  const filteredOperationTypes = operationTypes.filter((operation) => {
    const matchesSearch = operation.categoryName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || operation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`/operations/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Əməliyyat kateqoriyasını silmək istədiyinizə əminsiniz?")) {
      try {
        await remove(id);
      } catch (err) {
        alert("Silərkən xəta baş verdi!");
      }
    }
  };

  // ✅ STATUS DƏYİŞMƏ FUNKSİYASI
  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(row.id, { status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  // Status formatlama
  const formatStatus = (status) => {
    if (!status) return "";
    if (status.toUpperCase() === "ACTIVE") return "Aktiv";
    if (status.toUpperCase() === "PASSIVE") return "Passiv";
    return status;
  };

  return (
    <div className="operationsList-container">
      <div className="operationsList-controls-section">
        <div className="operationsList-filters">
          <select 
            className="operationsList-status-dropdown"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="operationsList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="operationsList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="operationsList-search-button">
              <CiSearch className="operationsList-search-icon" />
            </button>
          </div>
        </div>
        <div className="operationsList-actions">
          <Link to={"./add"} className="operationsList-add-new-button">
            <span>+</span> Yenisini əlavə et
          </Link>
          <button className="operationsList-download-button">
            <FiDownload className="operationsList-download-icon" />
          </button>
        </div>
      </div>

      <div className="operationsList-table-section">
        {loading && <p>Yüklənir...</p>}
        {error && (
          <p style={{ color: "red" }}>
            Xəta baş verdi: {error.message || error.toString()}
          </p>
        )}
        {!loading && !error && filteredOperationTypes.length === 0 && (
          <p>Məlumat tapılmadı.</p>
        )}

        {!loading && !error && filteredOperationTypes.length > 0 && (
          <table className="operationsList-table">
            <thead>
              <tr>
                <th className="!text-center">
                  <span className="firstElementOfTHS !flex !items-center gap-1">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon !-ml-2" />
                    {`1-${filteredOperationTypes.length}`}
                  </span>
                </th>
                <th >
                  <span className="!flex !items-center gap-1 justify-center">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon" />{" "}
                    İcazənin adı
                  </span>
                </th>
                <th >
                  <span className="!flex !items-center gap-1 justify-center">
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon mt-1" />{" "}
                    Əməliyyatların sayı
                  </span>
                </th>
                <th>
                  <span className="!flex !items-center gap-1 justify-center"> 
                    <HiOutlineArrowsUpDown className="operationsList-sort-icon mt-1" />{" "}
                    Status
                  </span>
                </th>
                <th className="!flex !justify-center">
                  <span>Düzəliş</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOperationTypes.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="!text-center">{row.categoryName}</td>
                  <td className="!text-center">
                    <Link to={`/operations/${row.id}`}>
                      Əməliyyatların sayı ({row.opTypeItemCount || 0})
                    </Link>
                  </td>
                  <td
                    onClick={() => handleStatusToggle(row)}
                    style={{ cursor: "pointer" }}
                    className="!text-center"
                  >
                    <span
                      className={`operationsList-status-badge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                    >
                      {formatStatus(row.status)}
                    </span>
                  </td>
                  <td>
                    <div className="operationsList-action-icons !flex !justify-center">
                      <FiEdit3
                        className="operationsList-edit-button"
                        onClick={() => handleEdit(row.id)}
                      />
                      <GoTrash
                        className="operationsList-delete-button"
                        onClick={() => handleDelete(row.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OperationCategoryList;
