import React, { useEffect, useMemo } from "react";
import { FiEdit3, FiDownload } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { CiSearch } from "react-icons/ci";
import { PiWarningCircleLight } from "react-icons/pi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Teeth/operationpictures.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import useTeethStore from "../../../stores/teethStore";
import useTeethOperationStore from "../../../stores/teeth-opetaionStore";

const OperationPictures = () => {
  const navigate = useNavigate();
  const { id: teethId } = useParams();

  const { teeth, fetchTeeth, loading, error } = useTeethStore();
  const { removeTeethOperations } = useTeethOperationStore();

  useEffect(() => {
    fetchTeeth();
  }, [fetchTeeth]);

  // Dişi tap və onun operations array-ini götür
  const filteredOperations = useMemo(() => {
    if (!teethId || !teeth.length) return [];
    const tooth = teeth.find((t) => String(t.id) === String(teethId));
    return tooth?.operations || [];
  }, [teeth, teethId]);

  const handleEdit = (id, operation) => () => {
    navigate(`edit/${id}`, { state: { operation } });
  };

  const handleInfo = (id, operation) => () => {
    navigate(`info/${id}`, { state: { operation } });
  };

  const handleDelete = async (id, operationName) => {
    const confirmed = window.confirm(
      `"${operationName}" əməliyyatını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await removeTeethOperations(id);
      toast.success("Əməliyyat uğurla silindi!");
    } catch (error) {
      toast.error("Silinmə zamanı xəta baş verdi!");
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="operationPictures-container">
      <ToastContainer />
      <div className="operationPictures-controls-section">
        <div style={{ width: 250 }}>
          <div className="operationPictures-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="operationPictures-search-input"
            />
            <button className="operationPictures-search-button">
              <CiSearch className="operationPictures-search-icon" />
            </button>
          </div>
        </div>
        <div className="operationPictures-actions">
          <Link to={"add"} className="operationPictures-add-new-button">
            + Yenisini əlavə et
          </Link>
          <button className="operationPictures-download-button">
            <FiDownload className="operationPictures-download-icon" />
          </button>
        </div>
      </div>

      <div className="operationPictures-table-section">
        <table className="operationPictures-table">
          <thead>
            <tr>
              <th>
                <span className="operationPictures-firstElementOfTHS">
                  <HiArrowsUpDown style={{ marginRight: 4 }} />
                  {filteredOperations.length === 0
                    ? "0"
                    : `1-${filteredOperations.length}`}
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown style={{ marginRight: 4 }} /> Əməliyyat adı
                </span>
              </th>
              <th>
                <span>Düzəliş</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOperations.map((row, idx) => (
              <tr key={row.id}>
                <td>{idx + 1}</td>
                <td>{row.operationName}</td>
                <td>
                  <div className="operationPictures-action-icons">
                    <PiWarningCircleLight
                      onClick={handleInfo(row.id, row)}
                      className="operationPictures-warning-button"
                    />
                    <FiEdit3
                      onClick={handleEdit(row.id, row)}
                      className="operationPictures-edit-button"
                    />
                    <GoTrash
                      onClick={() => handleDelete(row.id, row.operationName)}
                      className="operationPictures-delete-button"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {/* Boş sətirlər vizual stabillik üçün */}
            {Array.from({
              length: Math.max(0, 8 - filteredOperations.length),
            }).map((_, i) => (
              <tr key={"empty-" + i}>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p style={{ textAlign: "center" }}>Yüklənir...</p>}
        {error && (
          <p style={{ textAlign: "center", color: "red" }}>
            Xəta: {error.message || "Naməlum xəta"}
          </p>
        )}
      </div>
    </div>
  );
};

export default OperationPictures;
