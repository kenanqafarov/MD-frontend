import React, { useEffect, useState } from "react";
import { CiSearch, CiExport } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import "../../assets/style/PriceCategory/pricecategory.css";
import { Link, useNavigate } from "react-router-dom";
import usePriceCategoryStore from "../../../stores/priceCategoryStore";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const PriceCategory = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const {
    categories,
    loading,
    fetchCategories,
    exportToExcel,
    removeCategory,
    updateCategoryStatus, // Status update funksiyası
  } = usePriceCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) {
      removeCategory(id);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateCategoryStatus(item.id, { status: newStatus });
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
    }
  };

  const filteredCategories = categories.filter(
    (item) =>
      (status === "" || item.status === status) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="priceCategoryWrapper">
      <div className="priceCategoryContainer">
        <div className="priceCategoryTopPart">
          <div className="leftPartOfTop">
            <select
              className="priceCategoryStatusSelect"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="searchBarContainer">
              <input
                type="text"
                placeholder="Axtarış"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="searchIconBTN" />
            </div>
          </div>
          <div className="rightPartOfTop">
            <Link to={"add"} className="addNewPriceCategory">
              <FaPlus /> Yeni kateqoriya əlavə et
            </Link>
            <button
              className="exportDataOfPriceCategory"
              title="Export"
              onClick={exportToExcel}
            >
              <CiExport size={22} className="exportPriceCategoryDataIcon" />
            </button>
          </div>
        </div>

        <div className="priceCategoryTableWrapper">
          <table className="priceCategoryTable">
            <thead>
              <tr>
                <th>
                  <span>1-{filteredCategories.length}</span>
                </th>
                <th>
                  <span>
                    <HiArrowsUpDown className="tableArrowIcon" /> Kateqoriya adı
                  </span>
                </th>
                <th>
                  <span>
                    <HiArrowsUpDown className="tableArrowIcon" /> Status
                  </span>
                </th>
                <th>Düzəliş</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Yüklənir...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4}>Heç bir nəticə tapılmadı</td>
                </tr>
              ) : (
                filteredCategories.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.name}</td>
                    <td
                      onClick={() => handleStatusToggle(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        className={`status ${
                          item.status === "ACTIVE" ? "active" : "passive"
                        }`}
                      >
                        {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                      </span>
                    </td>
                    <td>
                      <div className="icons flex gap-3 cursor-pointer">
                        <FiEdit3
                          className="edit"
                          onClick={() => handleEdit(item.id)}
                        />
                        <GoTrash
                          className="delete"
                          onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default PriceCategory;
