import "../../assets/style/ReceptsPage/medicineslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import useMedicineStore from "../../../stores/medicineStore";

function MedicinesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    medicines,
    fetchMedicines,
    removeMedicine,
    downloadExcel,
    changeMedicineStatus, // <-- status update funksiyası
  } = useMedicineStore();

  const [searchTerm, setSearchTerm] = useState("");

  // Data yüklə
  useEffect(() => {
    if (id) {
      fetchMedicines(Number(id));
    }
  }, [id]);

  // Filtrləmə
  const filteredData = medicines.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Edit funksiyası
  const handleEdit = (row) => {
    navigate(`/recepts/${row.recipeId}/edit/${row.id}`);
  };

  // Silmə funksiyası
  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.name} dərmanını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeMedicine(row.id);
      alert(`${row.name} uğurla silindi.`);
    } catch (err) {
      alert("Silinərkən xəta baş verdi.");
    }
  };

  // Statusa kliklə dəyişmə funksiyası
  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await changeMedicineStatus(row.id, { status: newStatus });
    } catch (err) {
      alert("Status dəyişdirilə bilmədi!");
    }
  };

  return (
    <div className="medicinesPageWrapper">
      <div className="medicinesCategoryQuickSearch">
        <div className="medicinesCategoryLeftPart">
          <select>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="searchForNameMedicine">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="medicinesCategoryRightPart">
          <Link to={`add`}>
            <p className="addNewMedicineCategory">
              <span>+</span> Yenisini əlavə et
            </p>
          </Link>
          <button onClick={downloadExcel}>
            <FiDownload className="exportMedicinesCategoriesData" />
          </button>
        </div>
      </div>

      <div className="medicinesPageTableWrapper">
        <table className="medicinesPageTable">
          <thead>
            <tr>
              <th>
                {filteredData.length === 0 ? "0" : `1-${filteredData.length}`}
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Dərmanın
                  adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Qeyd
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
                  <td className="medicineNameCol">{row.name}</td>
                  <td>{row.description || "-"}</td>
                  <td>
                    <span
                      onClick={() => toggleStatus(row)}
                      style={{ cursor: "pointer" }}
                      className={`statusBadge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      title="Statusu dəyişmək üçün kliklə"
                    >
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="medicinesActionIcons">
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
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Dərman tapılmadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicinesList;
