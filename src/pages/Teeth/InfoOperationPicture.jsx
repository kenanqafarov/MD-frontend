import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiEdit3, FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { GoTrash } from "react-icons/go";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Teeth/infooperationpicture.css";
import useTeethOperationStore from "../../../stores/teeth-opetaionStore";

const InfoOperationPicture = () => {
  const { id: teethId, operationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { removeTeethOperations, loading } = useTeethOperationStore();

  const [operationDetails] = useState(location.state?.operation || null);

  const handleEdit = () => {
    navigate(`/teeth/${teethId}/operation-pictures/edit/${operationId}`, { state: { operation: operationDetails } });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${operationDetails?.operationName}" əməliyyatını silmək istədiyinizə əminsiniz?`
    );
    if (!confirmed) return;

    try {
      await removeTeethOperations(operationId);
      toast.success("Əməliyyat uğurla silindi!");
      setTimeout(() => {
        navigate(`/teeth/${teethId}/operation-pictures`);
      }, 1500);
    } catch (error) {
      toast.error("Silinmə zamanı xəta baş verdi!");
      console.error("Delete error:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!operationDetails) {
    return <div className="infoOperationPictureContainer">Əməliyyat tapılmadı!</div>;
  }

  return (
    <div className="infoOperationPictureContainer">
      <ToastContainer />
      <div className="infoOperationPictureWrapper">
        <div className="infoOperationPictureHeader">
          <h2>Əməliyyat Detalları</h2>
          <button className="infoOperationPictureEditIconButton" onClick={handleEdit}>
            <FiEdit3 className="infoOperationPictureEditIcon" />
          </button>
        </div>

        <div className="infoOperationPictureContent">
          <div className="infoOperationPictureRow">
            <label>Əməliyyat Adı:</label>
            <span>{operationDetails?.operationName || "—"}</span>
          </div>

          <div className="infoOperationPictureRow">
            <label>Status:</label>
            <span
              className={`infoOperationPictureStatusBadge ${
                operationDetails?.status === "ACTIVE" ? "active" : "inactive"
              }`}
            >
              {operationDetails?.status === "ACTIVE" ? "Aktiv" : "Passiv"}
            </span>
          </div>
        </div>

        <div className="infoOperationPictureActions">
          <button
            className="infoOperationPictureCancelButton"
            onClick={handleCancel}
            disabled={loading}
          >
            <RxCross2 style={{ marginRight: 8 }} />
            İmtina et
          </button>
          <button
            className="infoOperationPictureDeleteButton"
            onClick={handleDelete}
            disabled={loading}
          >
            <GoTrash style={{ marginRight: 8 }} />
            Sil
          </button>
          <button
            className="infoOperationPictureConfirmButton"
            onClick={handleEdit}
            disabled={loading}
          >
            <FiCheck style={{ marginRight: 8 }} />
            Düzəlt
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoOperationPicture;
