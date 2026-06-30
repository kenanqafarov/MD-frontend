import "../../assets/style/ProductCategory/product.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { useProductStore } from "../../../stores/productStore";

function Products() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const {
    products,
    fetchProducts,
    removeProduct,
    changeProductStatus,
    loading,
    error,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredByCategory = name
    ? products.filter(
        (item) =>
          item.categoryName &&
          item.categoryName.toLowerCase() === name.toLowerCase()
      )
    : products;

  const filteredData = filteredByCategory.filter((row) => {
    const matchesSearchTerm = row.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || row.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearchTerm && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`/product-categories/${name}/edit-product/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.productName} məhsulunu silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeProduct(row.id);
      alert(`${row.productName} silindi`);
    } catch (err) {
      alert("Silərkən xəta baş verdi: " + err.message);
    }
  };

  const toggleStatus = async (row) => {
    const currentStatus = row.status?.toUpperCase() || "";
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    
    console.log("Status update payload:", {
      productId: row.id,
      status: newStatus,
    });

    try {
      await changeProductStatus({ productId: row.id, status: newStatus });
      console.log("Status changed successfully");
    } catch (err) {
      console.error("Status change error:", err);
      alert("Status dəyişdirilə bilmədi");
    }
  };

  return (
    <div className="productPageWrapper">
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
          <Link to={"./add-new"}>
            <p className="addNewProductCategory">
              <span>+</span> Yenisini əlavə et
            </p>
          </Link>
          <Link to={"/export"}>
            <FiDownload className="exportProductCategoriesData" />
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Yüklənir...</p>
      ) : error ? (
        <p>Xəta baş verdi: {error.message}</p>
      ) : (
        <div className="productPageTableWrapper">
          <table className="productPageTable">
            <thead>
              <tr>
                <th>{filteredData.length === 0 ? 0 : `1-${filteredData.length}`}</th>
                <th className="productNameCol">
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" /> Məhsulun
                    adı
                  </span>
                </th>
                <th>
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" /> Məhsulun
                    kodu
                  </span>
                </th>
                <th>
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" />{" "}
                    Özəllikləri
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
                  <td className="productNameCol">{row.productName}</td>
                  <td>{row.productNo}</td>
                  <td>{row.productTitle}</td>
                  <td>
                    <span
                      className={`statusBadge ${row.status?.toLowerCase() === "active" ? "active" : "passive"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStatus(row)}
                      title="Statusu dəyişmək üçün kliklə">
                      {row.status?.toLowerCase() === "active" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="productActionIcons">
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
        </div>
      )}
    </div>
  );
}

export default Products;