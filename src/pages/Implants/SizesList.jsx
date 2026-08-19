import "../../assets/style/Implants/sizeslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useImplantSizeStore from "../../../stores/ImplantSizeStore";
import { usePermission } from "../../hooks/usePermission";

function SizesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("İmplantlar", "CREATE");
  const canUpdate = hasPermission("İmplantlar", "UPDATE");
  const canDelete = hasPermission("İmplantlar", "DELETE");
  const canStatus = hasPermission("İmplantlar", "STATUS");
  const {
    implants,
    fetchImplantsWithSizes,
    removeImplantSize,
    updateStatus,
    loading,
    error,
  } = useImplantSizeStore();

  const [filteredSizes, setFilteredSizes] = useState([]);

  useEffect(() => {
    fetchImplantsWithSizes();
  }, []);

  useEffect(() => {
    if (id && implants.length > 0) {
      const implant = implants.find((impl) => impl.id === Number(id));
      setFilteredSizes(implant?.implantSizesReads || []);
    }
  }, [id, implants]);

  const handleEdit = (row) => {
    navigate(`/implants/sizes/${id}/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `${row.diameter} ölçüsünü silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    try {
      await removeImplantSize(Number(id), row.id);
      setFilteredSizes((prev) => prev.filter((size) => size.id !== row.id));
      alert(`${row.diameter} uğurla silindi.`);
    } catch (err) {
      alert("Xəta baş verdi: " + err.message);
    }
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus({ implantSizeId: row.id, status: newStatus });
      setFilteredSizes((prev) =>
        prev.map((size) =>
          size.id === row.id ? { ...size, status: newStatus } : size
        )
      );
    } catch (err) {
      alert("Status dəyişdirilə bilmədi: " + err.message);
    }
  };

  return (
    <div className="sizesPageWrapper">
      <div className="sizesCategoryQuickSearch">
        <div className="sizesCategoryLeftPart">
          <div className="searchForNameSizes">
            <input type="text" placeholder="Axtarış" />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="sizesCategoryRightPart">
          {canCreate && (
            <Link to={`./add`}>
              <p className="addNewSizesCategory">
                <span>+</span> Yenisini əlavə et
              </p>
            </Link>
          )}
          <Link to={"/export"}>
            <FiDownload className="exportSizesCategoriesData" />
          </Link>
        </div>
      </div>

      <div className="sizesPageTableWrapper">
        {loading ? (
          <p>Yüklənir...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredSizes.length === 0 ? (
          <p>Heç bir ölçü tapılmadı.</p>
        ) : (
          <table className="sizesPageTable">
            <thead>
              <tr>
                <th>{`1-${filteredSizes.length}`}</th>
                <th>
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" /> Diametir
                  </span>
                </th>
                <th>
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" /> Uzunluq
                  </span>
                </th>
                <th>
                  <span>
                    <HiOutlineArrowsUpDown className="arrowIconsNow" /> Status
                  </span>
                </th>
                {(canUpdate || canDelete) && <th>Düzəliş</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSizes.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="sizesNameCol">{row.diameter}</td>
                  <td>{row.length}</td>
                  <td>
                    <span
                      className={`statusBadge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      onClick={() => canStatus && toggleStatus(row)}
                      style={{
                        cursor: canStatus ? "pointer" : "default",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor:
                          row.status === "ACTIVE" ? "green" : "red",
                      }}
                    >
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td>
                      <div className="sizesActionIcons">
                        {canUpdate && (
                          <FiEdit3
                            className="editBtn"
                            onClick={() => handleEdit(row)}
                          />
                        )}
                        {canDelete && (
                          <GoTrash
                            className="deleteBtn"
                            onClick={() => handleDelete(row)}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SizesList;
