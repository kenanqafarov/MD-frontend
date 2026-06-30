import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useProductCategoryStore } from "../../../stores/productCategories";
import "../../assets/style/ProductCategory/productcategory.css";

function ProductCategory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    categories,
    fetchCategories,
    removeCategory,
    changeCategoryStatus,
    loading,
    error,
  } = useProductCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredData = categories.filter((row) => {
    const matchesSearch = row.categoryName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`./edit-category/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`${row.categoryName} silinsin?`)) return;

    try {
      await removeCategory(row.id);
      alert(`${row.categoryName} silindi`);
    } catch (err) {
      alert(`Silərkən xəta baş verdi: ${err.message}`);
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await changeCategoryStatus({ id: row.id, status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi");
    }
  };

  return (
    <div className="productCategoryContainer">
      <div className="productCategoryQuickSearch">
        <div className="productCategoryLeftPart">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="searchForNameProduct">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="productCategoryRightPart">
          <Link to={"./add"}>
            <p className="addNewProductCategory">
              <span>+</span>Yenisini əlavə et
            </p>
          </Link>
            <FiDownload className="exportProductCategoriesData" />
        </div>
      </div>

      <div className="productCategoryTableWrapper">
        <table className="productCategoryTable">
          <thead>
            <tr>
              <th>{filteredData.length === 0 ? 0 : `1-${filteredData.length}`}</th>
              <th className="productCategoryName">
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Məhsul kateqoriyasının adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Məhsulları
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
            {filteredData.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td className="productCategoryName">{row.categoryName}</td>
                <td>
                  {row.status === "PASSIVE" ? (
                    <span
                      style={{
                        color: "#999",
                        cursor: "not-allowed",
                        userSelect: "none",
                      }}
                    >
                      Məhsulları (0)
                    </span>
                  ) : (
                    <Link to={`./${row.categoryName}`}>
                      Məhsulları ({row.products?.length || 0})
                    </Link>
                  )}
                </td>
                <td>
                  <span
                    className={`statusBadge ${
                      row.status === "ACTIVE" ? "active" : "passive"
                    }`}
                    onClick={() => toggleStatus(row)}
                    style={{ cursor: "pointer" }}
                    title="Statusu dəyişmək üçün kliklə"
                  >
                    {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                  </span>
                </td>
                <td>
                  <div className="productCategoryActionIcons">
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
            ))}
          </tbody>
        </table>
        {loading && <p>Yüklənir...</p>}
        {error && <p style={{ color: "red" }}>Xəta: {error.message}</p>}
      </div>
    </div>
  );
}

export default ProductCategory;