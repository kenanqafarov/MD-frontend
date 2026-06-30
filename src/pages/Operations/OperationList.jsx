import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../assets/style/Operations/operationcategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";

const OperationList = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    operationItemsType,
    fetchAllOp,
    remove,
    exportToExcel,
    updateStatus // 🔥 Status dəyişmə funksiyası store-dan
  } = useOperationItemsTypeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (id) {
      fetchAllOp(id);
    }
  }, [id]);

  const allPriceCategories = Array.from(
    new Set(
      operationItemsType.flatMap(
        (item) => item.prices?.map((p) => p.priceCategoryName) || []
      )
    )
  );

  const filteredOperations = operationItemsType.filter((item) => {
    const matchesSearch =
      item.operationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`edit/${id}`);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await remove(itemId);
      await fetchAllOp(id);
    }
  };

  const handleExport = async () => {
    await exportToExcel();
  };

  // ✅ STATUS DƏYİŞMƏ FUNKSİYASI
  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(item.id, { status: newStatus });
      await fetchAllOp(id); // siyahını yenilə
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  return (
    <div className="operationsList-container">
      <div className="operationsList-controls-section">
        <div className="operationsList-filters">
          <select
            className="operationsList-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
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
          <button
            className="operationsList-download-button"
            onClick={handleExport}>
            <FiDownload className="operationsList-download-icon" />
          </button>
        </div>
      </div>

      <div className="operationsList-table-section">
        <table className="operationsList-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Əməliyyatın adı</th>
              <th>Kod</th>
              <th>Qiymet</th>
              
              <th>Məhsul istifadəsi</th>
              <th>Status</th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperations.length > 0 ? (
              filteredOperations.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.operationName}</td>
                  <td>{item.operationCode}</td>
                  <td>{item.price}</td>

                  <td>{item.productUsage || 0}</td>
                  <td
                    onClick={() => handleStatusToggle(item)}
                    style={{ cursor: "pointer" }}>
                    <span
                      className={`operationsList-status-badge ${
                        item.status === "ACTIVE" ? "active" : "passive"
                      }`}>
                      {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="operationsList-action-icons">
                      <FiEdit3
                        className="operationsList-edit-button"
                        onClick={() => handleEdit(item.id)}
                      />
                      <GoTrash
                        className="operationsList-delete-button"
                        onClick={() => handleDelete(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5 + allPriceCategories.length}
                  style={{ textAlign: "center" }}>
                  Məlumat tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationList;
