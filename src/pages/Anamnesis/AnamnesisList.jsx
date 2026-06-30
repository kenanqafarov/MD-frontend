// AnamnesisList.js
import React, { useEffect, useState } from "react";
import "../../assets/style/Anamnesis/anamnesiscategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAnamnesisListStore from "../../../stores/anamnesStore";
import { exportAnamnesisItemsToExcel } from "../../../src/api/anamnesis-list";

const AnamnesisList = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const {
    anamnesisList,
    fetchAnamnesisList,
    removeAnamnesis,
    loading,
    updateAnamnesisStatus,
  } = useAnamnesisListStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchAnamnesisList(categoryId);
    }
  }, [categoryId, fetchAnamnesisList]);

  const handleEdit = (id) => {
    navigate(`/anamnesis/anamnesis-details/${categoryId}/edit/${id}`);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `"${name}" anamnezini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await removeAnamnesis(id);
      await fetchAnamnesisList(categoryId);
      toast.success(`${name} uğurla silindi.`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silinmə zamanı xəta baş verdi.");
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateAnamnesisStatus(row.id, { status: newStatus });
      // Refresh the list to reflect the change
      setTimeout(() => {
        fetchAnamnesisList(categoryId);
      }, 500);
      toast.success("Status uğurla dəyişdirildi!");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Status dəyişdirilə bilmədi!");
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportAnamnesisItemsToExcel();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "anamnesis-list.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel faylı uğurla yükləndi!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export zamanı xəta baş verdi.");
    } finally {
      setExporting(false);
    }
  };

  const filteredAnamnesis = anamnesisList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="anamnesisList-container">
      <ToastContainer />
      <div className="anamnesisList-controls-section">
        <div className="anamnesisList-filters">
          <select
            className="anamnesisList-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Hamısı ({anamnesisList.length})</option>
            <option value="ACTIVE">
              Aktiv ({anamnesisList.filter(a => a.status === "ACTIVE").length})
            </option>
            <option value="INACTIVE">
              Passiv ({anamnesisList.filter(a => a.status === "INACTIVE").length})
            </option>
          </select>
          <div className="anamnesisList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="anamnesisList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="anamnesisList-search-button" type="button">
              <CiSearch className="anamnesisList-search-icon" />
            </button>
          </div>
        </div>
        <div className="anamnesisList-actions">
          <button
            onClick={handleExport}
            disabled={exporting || anamnesisList.length === 0}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#155EEF",
            }}
            title="Excel'ə ixrac et"
          >
            <FiDownload />
          </button>
          <div
            className="anamnesisList-add-new-button"
            onClick={() =>
              navigate(`/anamnesis/anamnesis-details/${categoryId}/add`)
            }
            style={{ cursor: "pointer" }}
          >
            <FaPlus style={{ marginRight: "4px" }} /> Yeni anamnez əlavə et
          </div>
        </div>
      </div>

      <div className="anamnesisList-table-section">
        <table className="anamnesisList-table">
          <thead>
            <tr>
              <th>
                #{" "}
                <span>
                  ({filteredAnamnesis.length === 0 ? "0" : `1-${filteredAnamnesis.length}`})
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown /> Anamnezin adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Yüklənir...
                </td>
              </tr>
            ) : filteredAnamnesis.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Heç bir anamnez tapılmadı.
                </td>
              </tr>
            ) : (
              filteredAnamnesis.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <span
                      onClick={() => toggleStatus(row)}
                      style={{ cursor: "pointer" }}
                      className={`anamnesisList-status-badge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      title="Statusu dəyişmək üçün kliklə"
                    >
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="anamnesisList-action-icons">
                      <FiEdit3
                        className="anamnesisList-edit-button"
                        onClick={() => handleEdit(row.id)}
                        title="Düzəlt"
                      />
                      <GoTrash
                        className="anamnesisList-delete-button"
                        onClick={() => handleDelete(row.id, row.name)}
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
};

export default AnamnesisList;
