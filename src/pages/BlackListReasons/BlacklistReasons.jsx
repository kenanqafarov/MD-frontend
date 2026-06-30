import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FiDownload, FiEdit3 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";

import useBlackListResultStore from "../../../stores/blacklistReasonStore";
import "../../assets/style/Specialities/specialities.css";

function BlacklistReasons() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // 👈

  const {
    results,
    fetchResults,
    removeResult,
    updateResultStatus,
    exportToExcel,
    loading,
    error,
  } = useBlackListResultStore();

  useEffect(() => {
    fetchResults();
  }, []);

  const dataArray = Array.isArray(results?.data) ? results.data : [];

  const filteredData = dataArray.filter((row) => {
    const matchesName = row.statusName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? row.status === filterStatus : true;
    return matchesName && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`/edit-reason/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`"${row.statusName}" silinsin?`)) {
      await removeResult(row.id);
    }
  };
  const toggleStatus = async (row) => {
    if (!row.id) {
      alert("Xəta: ID tapılmadı, status dəyişdirilə bilməz!");
      return;
    }
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateResultStatus(row.id, { status: newStatus });
      setRefreshKey((prev) => prev + 1); // 👈 komponenti yenidən render et
    } catch {
      alert("Status yenilənərkən xəta baş verdi");
    }
  };
  useEffect(() => {
    fetchResults();
  }, [refreshKey]); // 👈 refresh olduqda yenidən fetch et
  return (
    <div className="specialitiesContainer">
      <div className="specialitiesContainerTopPart">
        <div className="leftPart">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="specialitiesQuickSearch">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchSpecialityIcon" />
          </div>
        </div>
        <div className="rightPart">
          <Link className="addSpeciality" to={"/add-reason"}>
            <IoMdAdd className="addSpecialityIcon" /> Yenisini əlavə et
          </Link>
          <button
            className="exportSpecialities"
            onClick={exportToExcel}
            disabled={loading}>
            <FiDownload className="exportSpecialitiesIcon" />
          </button>
        </div>
      </div>

      <div className="specialitiesTableWrapper">
        <table className="specialitiesTable">
          <thead>
            <tr>
              <th>
                {filteredData.length !== 0 ? `1-${filteredData.length}` : 0}
              </th>
              <th className="specialityName">
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Səbəb adı
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
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="specialityName">{row.statusName}</td>
                  <td>
                    <span
                      onClick={() => toggleStatus(row)}
                      className={`statusBadge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      style={{ cursor: "pointer" }}
                      title="Statusu dəyişmək üçün kliklə">
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="actionIcons">
                      <FiEdit3
                        className="editBtn"
                        onClick={() => handleEdit(row)}
                      />
                      <GoTrash
                        className="deleteBtn"
                        onClick={() => handleDelete(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Nəticə tapılmadı
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {loading && <p>Yüklənir...</p>}
        {error && (
          <p style={{ color: "red" }}>
            Xəta: {error.message || "Serverdən cavab alınmadı"}
          </p>
        )}
      </div>
    </div>
  );
}

export default BlacklistReasons;
