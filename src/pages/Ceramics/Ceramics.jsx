import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FiDownload, FiEdit3 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";

import "../../assets/style/Ceramics/ceramics.css";

import useCeramicsStore from "../../../stores/ceramicStore";

function Ceramics() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    ceramics,
    fetchCeramics,
    deleteCeramic,
    updateCeramicStatus,
    loading,
    error,
  } = useCeramicsStore();

  useEffect(() => {
    fetchCeramics();
  }, [fetchCeramics]);

  const searchLower = searchTerm.toLowerCase();

  const filteredData = Array.isArray(ceramics)
    ? ceramics.filter(({ name, status }) => {
        const nameLower = name ? name.toLowerCase() : "";
        return (
          nameLower.includes(searchLower) &&
          (statusFilter ? status === statusFilter : true)
        );
      })
    : [];

  const handleEdit = (row) => {
    navigate(`../ceramics/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`"${row.name}" silinsin?`)) {
      try {
        await deleteCeramic(row.id);
        alert(`Silindi: ${row.name}`);
      } catch {
        alert("Silinərkən xəta baş verdi");
      }
    }
  };

  const statusMap = {
    ACTIVE: "Aktiv",
    PASSIVE: "Passiv",
  };

  const toggleStatus = async (row) => {
    if (!row.id) {
      alert("Xəta: ID tapılmadı, status dəyişdirilə bilməz!");
      return;
    }
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateCeramicStatus(row.id, { status: newStatus });
      await fetchCeramics();  // Status dəyişdikdən sonra siyahını yenilə
    } catch {
      alert("Status yenilənərkən xəta baş verdi");
    }
  };

  return (
    <div className="ceramicsContainer">
      <div className="ceramicsContainerTopPart">
        <div className="leftPart">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="ceramicsQuickSearch">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchceramicsIcon" />
          </div>
        </div>
        <div className="rightPart">
          <Link className="addceramics" to="add">
            <IoMdAdd className="addceramicsIcon" /> Yenisini əlavə et
          </Link>
          <button
            type="button"
            className="exportceramics"
            title="Excel-ə export et"
            disabled={loading}
            onClick={() => alert("Export funksiyası burada olacaq")}
          >
            <FiDownload className="exportceramicsIcon" />
          </button>
        </div>
      </div>

      <div className="ceramicsTableWrapper">
        {loading && <p>Yüklənir...</p>}
        {error && (
          <p style={{ color: "red" }}>
            Xəta: {error?.message || "Naməlum xəta baş verdi"}
          </p>
        )}
        <table className="ceramicsTable">
          <thead>
            <tr>
              <th>{filteredData.length !== 0 ? `1-${filteredData.length}` : 0}</th>
              <th className="ceramicsName">
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Keramikanın adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Məlumat tapılmadı
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="ceramicsName">{row.name}</td>
                  <td>
                    <span
                      onClick={() => toggleStatus(row)}
                      className={`statusBadge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      style={{ cursor: "pointer" }}
                      title="Statusu dəyişmək üçün kliklə"
                    >
                      {statusMap[row.status] || row.status}
                    </span>
                  </td>
                  <td>
                    <div className="actionIcons">
                      <FiEdit3
                        className="editBtn"
                        onClick={() => handleEdit(row)}
                        title="Redaktə et"
                      />
                      <GoTrash
                        className="deleteBtn"
                        onClick={() => handleDelete(row)}
                        title="Sil"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ceramics;
