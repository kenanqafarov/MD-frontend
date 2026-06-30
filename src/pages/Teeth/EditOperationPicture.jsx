import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/style/Teeth/editoperationpicture.css";
import acceptButton from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelButton from "../../assets/images/EmployeesPage/cancelProcess.png";
import useTeethOperationStore from "../../../stores/teeth-opetaionStore";
import useOperationTypesStore from "../../../stores/operationsTypeStore";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";

const EditOperationPicture = () => {
  const { id: teethId, operationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { updateTeethOperations, loading: opLoading } = useTeethOperationStore();
  const { operationTypes, fetchAll: fetchAllCategories } = useOperationTypesStore();
  const { operationItemsType, fetchAllOp } = useOperationItemsTypeStore();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Parse operation name from location state
  useEffect(() => {
    const operationData = location.state?.operation;
    if (operationData?.operationName && operationTypes.length > 0) {
      const parts = operationData.operationName.split("-");
      if (parts.length >= 2) {
        const categoryName = parts[0].trim();
        const operationName = parts.slice(1).join("-").trim();

        const category = operationTypes.find((c) => c.categoryName === categoryName);
        if (category) {
          setSelectedCategory({ value: category.id, label: category.categoryName });
          fetchAllOp(category.id);
        }
      }
    }
  }, [location.state, operationTypes]);

  // Set selected operation after fetching operations
  useEffect(() => {
    const operationData = location.state?.operation;
    if (
      operationData?.operationName &&
      selectedCategory &&
      operationItemsType.length > 0
    ) {
      const parts = operationData.operationName.split("-");
      const operationName = parts.slice(1).join("-").trim();

      const operation = operationItemsType.find(
        (op) => op.operationName === operationName
      );
      if (operation) {
        setSelectedOperation({ value: operation.id, label: operation.operationName });
      }
    }
  }, [location.state, selectedCategory, operationItemsType]);

  const handleCategoryChange = (categoryId) => {
    const category = operationTypes.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory({ value: category.id, label: category.categoryName });
      fetchAllOp(categoryId);
      setSelectedOperation(null);
    }
  };

  const handleOperationChange = (operationId) => {
    const operation = operationItemsType.find((op) => op.id === operationId);
    if (operation) {
      setSelectedOperation({ value: operation.id, label: operation.operationName });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedOperation) {
      toast.warning("Zəhmət olmasa kateqoriya və əməliyyat seçin!");
      return;
    }

    const payload = {
      id: Number(operationId),
      teethId: Number(teethId),
      opTypeAndItemRequests: [
        {
          operationName: `${selectedCategory.label}-${selectedOperation.label}`,
        },
      ],
    };

    try {
      setFormLoading(true);
      await updateTeethOperations(payload);
      toast.success("Əməliyyat uğurla yeniləndi!");
      setTimeout(() => {
        navigate(`/teeth/${teethId}/operation-pictures`);
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Yenilənmə zamanı xəta baş verdi!");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const isLoading = opLoading || formLoading;

  return (
    <div className="editOperationPictureContainer">
      <ToastContainer />
      <form className="editOperationPictureForm" onSubmit={handleSubmit}>
        <div className="editOperationPictureRow">
          <label>
            Əməliyyat Kateqoriyası
            <span className="editOperationPictureRequired">*</span>
          </label>
          <select
            value={selectedCategory?.value || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="">Kateqoriya seçin</option>
            {operationTypes.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="editOperationPictureRow">
          <label>
            Əməliyyat
            <span className="editOperationPictureRequired">*</span>
          </label>
          <select
            value={selectedOperation?.value || ""}
            onChange={(e) => handleOperationChange(e.target.value)}
            disabled={isLoading || !selectedCategory}
            required
          >
            <option value="">Əməliyyat seçin</option>
            {operationItemsType.map((operation) => (
              <option key={operation.id} value={operation.id}>
                {operation.operationName}
              </option>
            ))}
          </select>
        </div>

        <div className="editOperationPictureActions">
          <button
            type="button"
            className="editOperationPictureCancelBtn"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <img src={cancelButton} alt="cancel" />
            İmtina et
          </button>

          <button
            type="submit"
            className="editOperationPictureSaveBtn"
            disabled={isLoading}
          >
            <img src={acceptButton} alt="accept" />
            {isLoading ? "Zəhmət olmasa gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOperationPicture;
