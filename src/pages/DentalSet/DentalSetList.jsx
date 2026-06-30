import { Link, useNavigate } from "react-router-dom";
import "../../assets/style/DentalSet/dentalsetlist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { useEffect, useState } from "react";
import useGarnitureStore from "../../../stores/garnitureStore";

function DentalSetList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    garnitures,
    fetchGarnitures,
    removeGarniture,
    updateStatus,
    loading,
    error,
  } = useGarnitureStore();

  useEffect(() => {
    fetchGarnitures();
  }, []);

  useEffect(() => {}, [garnitures]);

  const filteredData = garnitures.filter((row) => {
    const matchesName = row.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? row.status.toLowerCase() === statusFilter
      : true;
    return matchesName && matchesStatus;
  });

  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.name} qarniturunu silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeGarniture(row.id);
      alert(`${row.name} uğurla silindi.`);
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi!");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus =
      currentStatus.toLowerCase() === "active" ? "passive" : "active";
    const confirmMessage =
      newStatus === "active"
        ? "Qarnituru aktiv etmək istədiyinizə əminsiniz?"
        : "Qarnituru passiv etmək istədiyinizə əminsiniz?";

    if (window.confirm(confirmMessage)) {
      try {
        await updateStatus(id, { status: newStatus.toUpperCase() }); // backendə böyük hərflə göndər
        alert(
          `Qarnitur uğurla ${
            newStatus === "active" ? "aktiv" : "passiv"
          } edildi!`
        );
      } catch (error) {
        alert("Status dəyişdirilməsi zamanı xəta baş verdi!");
      }
    }
  };

  return (
    <div className="dentalSetPageWrapper">
      <div className="dentalSetCategoryQuickSearch">
        <div className="dentalSetCategoryLeftPart">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            <option value="active">Aktiv</option>
            <option value="passive">Passiv</option>
          </select>
          <div className="searchForNameDentalSet">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="dentalSetCategoryRightPart">
          <Link to={"./add"}>
            <p className="addNewDentalSetCategory">
              <span>+</span> Yenisini əlavə et
            </p>
          </Link>
          <Link to={"/export"}>
            <FiDownload className="exportDentalSetCategoriesData" />
          </Link>
        </div>
      </div>

      <div className="dentalSetPageTableWrapper">
        <table className="dentalSetPageTable">
          <thead>
            <tr>
              <th>
                {garnitures.length === 0 ? "0" : `1-${garnitures.length}`}
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Qarniturun
                  adı
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
            {loading ? (
              <tr>
                <td colSpan="4">Yüklənir...</td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="dentalSetNameCol">{row.name}</td>
                  <td>
                    <span
                      className={`statusBadge ${
                        row.status.toLowerCase() === "active"
                          ? "active"
                          : "passive"
                      }`}
                      onClick={() => handleStatusChange(row.id, row.status)}
                      style={{ cursor: "pointer" }}>
                      {row.status.toLowerCase() === "active"
                        ? "Aktiv"
                        : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="dentalSetActionIcons">
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
                <td colSpan="4">Heç bir qarnitur tapılmadı</td>
              </tr>
            )}
          </tbody>
        </table>
        {error && (
          <div style={{ color: "red", marginTop: 10 }}>Xəta: {error}</div>
        )}
      </div>
    </div>
  );
}

export default DentalSetList;
