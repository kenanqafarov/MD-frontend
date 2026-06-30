import "../../assets/style/ReceptsPage/receptslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useRecipeStore from "../../../stores/receptsStore";
import useMedicineStore from "../../../stores/medicineStore";

function ReceptsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { recipes, fetchRecipes, deleteRecipeById, exportExcel, updateStatus } =
    useRecipeStore();
  const { medicines, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    fetchRecipes();
    fetchMedicines();
  }, []);

  const getMedicineCount = (recipeId) => {
    return medicines.filter((m) => m.recipeId === recipeId).length;
  };

  const handleEdit = (id) => {
    navigate(`/recepts/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const recept = recipes.find((r) => r.id === id);
    const confirmDelete = window.confirm(
      `${recept.name} reseptini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    await deleteRecipeById(id);
    alert(`${recept.name} uğurla silindi.`);
  };

  // Statusa kliklə dəyişmə funksiyası
  const toggleStatus = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(item.id, { status: newStatus });
    } catch (error) {
      alert("Status dəyişdirilə bilmədi!");
    }
  };

  const filteredRecepts = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="receptsList-container">
      <div className="receptsList-controls-section">
        <div className="receptsList-filters">
          <select className="receptsList-status-dropdown">
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="receptsList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="receptsList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="receptsList-search-button">
              <CiSearch className="receptsList-search-icon" />
            </button>
          </div>
        </div>
        <div className="receptsList-actions">
          <Link to={"./add"} className="receptsList-add-new-button">
            <span>+</span> Yenisini əlavə et
          </Link>
          <button className="receptsList-download-button" onClick={exportExcel}>
            <FiDownload className="receptsList-download-icon" />
          </button>
        </div>
      </div>

      <div className="receptsList-table-section">
        <table className="receptsList-table">
          <thead>
            <tr>
              <th>
                <span className="firstElementOfTHS !flex !justify-center gap-1">
                  <HiOutlineArrowsUpDown className="receptsList-sort-icon mt-1" />
                  {filteredRecepts.length === 0
                    ? "0"
                    : `1-${filteredRecepts.length}`}
                </span>
              </th>
              <th>
                <span className="!flex !justify-center gap-1">
                  <HiOutlineArrowsUpDown className="receptsList-sort-icon" />{" "}
                  Reseptin adı
                </span>
              </th>
              <th>
                <span className="!flex !justify-center gap-1">
                  <HiOutlineArrowsUpDown className="receptsList-sort-icon" />{" "}
                  Dərmanları
                </span>
              </th>
              <th>
                <span className="!flex !justify-center gap-1">
                  <HiOutlineArrowsUpDown className="receptsList-sort-icon" />{" "}
                  Status
                </span>
              </th>
              <th>
                <span className="!flex !justify-center">Düzəliş</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecepts.map((row, index) => (
              <tr key={row.id}>
                <td className="!text-center">{index + 1}</td>
                <td className="!text-center">{row.name}</td>
                <td className="!text-center">
                  <Link to={`/recepts/${row.id}`}>
                    Dərmanlar({getMedicineCount(row.id)})
                  </Link>
                </td>
                <td className="!text-center">
                  <span
                    onClick={() => toggleStatus(row)}
                    style={{ cursor: "pointer" }}
                    className={`receptsList-status-badge ${
                      row.status === "ACTIVE" ? "active" : "passive"
                    }`}
                    title="Statusu dəyişmək üçün kliklə"
                  >
                    {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                  </span>
                </td>
                <td>
                  <div className="receptsList-action-icons !flex !justify-center">
                    <FiEdit3  
                      className="receptsList-edit-button"
                      onClick={() => handleEdit(row.id)}
                    />
                    <GoTrash
                      className="receptsList-delete-button"
                      onClick={() => handleDelete(row.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReceptsList;
