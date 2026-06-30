import React, { useEffect } from "react";
import { FiEdit3, FiDownload } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { CiSearch } from "react-icons/ci";
import { PiWarningCircleLight } from "react-icons/pi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Teeth/operationpictures.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import useTeethExaminationStore from "../../../stores/teeth-examinationStore";

const ExaminationPictures = () => {
  const navigate = useNavigate();
  const { id: teethId } = useParams();
  const { teethExaminations, fetchAllTeethExaminations, deleteTeethExamination } =
    useTeethExaminationStore();

  useEffect(() => {
    fetchAllTeethExaminations();
  }, []);

  const filteredExaminations = teethExaminations.filter(
    (exam) => String(exam.teeth?.id) === String(teethId)
  );

  const handleEdit = (id, examination) => () => {
    navigate(`edit/${id}`, { state: { examination } });
  };

  const handleInfo = (id, examination) => () => {
    navigate(`info/${id}`, { state: { examination } });
  };

  const handleDelete = async (id, examName) => {
    const confirmed = window.confirm(
      `"${examName}" müayinəsini silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await deleteTeethExamination(id);
      toast.success("Müayinə uğurla silindi!");
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
                  {filteredExaminations.length === 0
                    ? "0"
                    : `1-${filteredExaminations.length}`}
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown style={{ marginRight: 4 }} /> Müayinə /
                  Əməliyyat
                </span>
              </th>
              <th>
                <span>Düzəliş</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExaminations.map((row, idx) => (
              <tr key={row.id}>
                <td>{idx + 1}</td>
                <td>{row.examination?.typeName || "—"}</td>
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
                      onClick={() =>
                        handleDelete(row.id, row.examination?.typeName)
                      }
                      className="operationPictures-delete-button"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {Array.from({
              length: Math.max(0, 8 - filteredExaminations.length),
            }).map((_, i) => (
              <tr key={"empty-" + i}>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExaminationPictures;
