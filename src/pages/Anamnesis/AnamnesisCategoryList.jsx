// AnamnesisList.js
import React, { useEffect, useState } from "react";
import "../../assets/style/Anamnesis/anamnesiscategorylist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAnamnesisCategoryStore from "../../../stores/anamnesisCategoryStore";

const AnamnesisList = () => {
  const navigate = useNavigate();
  const {
    categories,
    fetchCategories,
    deleteCategory,
    loading,
    updateCategoryStatus,
    exportToExcel,
  } = useAnamnesisCategoryStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (id) => {
    navigate(`/anamnesis/edit-category/${id}`);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `${name} kateqoriyasını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      toast.success(`${name} uğurla silindi.`);
    } catch (error) {
      toast.error("Silinmə zamanı xəta baş verdi.");
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateCategoryStatus(row.id, newStatus);
      toast.success("Status uğurla dəyişdirildi!");
    } catch (err) {
      toast.error("Status dəyişdirilə bilmədi!");
    }
  };

  const handleExport = async () => {
    try {
      await exportToExcel();
      toast.success("Fayllar uğurla yükləndi!");
    } catch (error) {
      toast.error("Export zamanı xəta baş verdi!");
    }
  };

  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .map((category) => ({
      ...category,
      anamnesisCount: category.anemnesisListReadResponse?.length || 0,
    }));

  return (
    <div className="anamnesisList-container">
      <ToastContainer />
      <div className="anamnesisList-controls-section">
        <div className="anamnesisList-filters">
          <select
            className="anamnesisList-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Hamısı</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="INACTIVE">Passiv</option>
          </select>
          <div className="anamnesisList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="anamnesisList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="anamnesisList-search-button">
              <CiSearch className="anamnesisList-search-icon" />
            </button>
          </div>
        </div>
        <div className="anamnesisList-actions">
          <button 
            className="anamnesisList-export-button"
            onClick={handleExport}
            disabled={loading}
            title="Excel formatında yüklə">
            <FiDownload /> Excel
          </button>
          <Link to="./add-category" className="anamnesisList-add-new-button">
            <span>+</span> Yeni kateqoriya əlavə et
          </Link>
        </div>
      </div>

      <div className="anamnesisList-table-section">
        <table className="anamnesisList-table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown /> Kategoriyanın adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown /> Anamnezlər
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
                <td colSpan="5">Yüklənir...</td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="5">Heç bir kateqoriya tapılmadı.</td>
              </tr>
            ) : (
              filteredCategories.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <Link to={`/anamnesis/anamnesis-details/${row.id}`}>
                      Anamnezləri ({row.anamnesisCount})
                    </Link>
                  </td>
                  <td>
                    <span
                      onClick={() => toggleStatus(row)}
                      style={{ cursor: "pointer" }}
                      className={`anamnesisList-status-badge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      title="Statusu dəyişmək üçün kliklə">
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="anamnesisList-action-icons">
                      <FiEdit3
                        className="anamnesisList-edit-button"
                        onClick={() => handleEdit(row.id)}
                      />
                      <GoTrash
                        className="anamnesisList-delete-button"
                        onClick={() => handleDelete(row.id, row.name)}
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
