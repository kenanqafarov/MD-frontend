import React, { useEffect, useRef, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import CustomSelect from "../../components/CustomSelect";
import AddPhoto from "../../assets/icons/AddPhoto";
import downloadIcon from "../../assets/images/EmployeesPage/verifyProcess.png";
import "../../assets/style/Teeth/addoperationpicture.css";
import { useParams, useNavigate } from "react-router-dom";

import useOperationTypesStore from "../../../stores/operationsTypeStore";
import useOperationItemsTypeStore from "../../../stores/operationItemTypeStore";
import useTeethOperationStore from "../../../stores/teeth-opetaionStore";

const AddOperationPicture = () => {
  const { id } = useParams(); // teethId
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { fetchAll: fetchAllCategories, operationTypes } =
    useOperationTypesStore();

  const { fetchAllOp, operationItemsType } =
    useOperationItemsTypeStore();

  const { createTeethOperations, loading, error } =
    useTeethOperationStore();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [image, setImage] = useState(null);

  // Kateqoriyalar
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Əməliyyatlar
  useEffect(() => {
    if (selectedCategory) {
      fetchAllOp(selectedCategory.value);
      setSelectedOperation(null);
    }
  }, [selectedCategory]);

  // Şəkil upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageDelete = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedOperation) {
      alert("Kateqoriya və əməliyyat seçilməlidir");
      return;
    }

    const payload = {
      teethId: Number(id),
      status: "ACTIVE", // 🔴 VACİB
      opTypeAndItemRequests: [
        {
          operationName: `${selectedCategory.label}-${selectedOperation.label}`,
          // Əgər backend ID istəyirsə:
          // opTypeItemId: selectedOperation.value,
        },
      ],
    };

    try {
      await createTeethOperations(payload);
      alert("Əlavə olundu!");
      navigate(`/teeth/${id}/operation-pictures`);
    } catch (err) {
      console.error(err);
      alert("Xəta baş verdi");
    }
  };

  const categoryOptions = operationTypes.map((c) => ({
    value: c.id,
    label: c.categoryName,
  }));

  const operationOptions = operationItemsType.map((op) => ({
    value: op.id,
    label: op.operationName,
  }));

  return (
    <div className="addOperationPictureContainer">
      <div className="header-icons">
        <MdEdit 
          className="icon edit-icon" 
          style={{
            fontSize: "24px",
            color: "#3B82F6",
            cursor: "pointer",
            transition: "all 0.3s ease",
            padding: "1px",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        />
        <MdDelete
          className="icon delete-icon"
          onClick={handleImageDelete}
          style={{
            fontSize: "24px",
            color: "#EF4444",
            cursor: "pointer",
            transition: "all 0.3s ease",
            padding: "1px",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        />
      </div>

      <form className="addoperationpicture-form" onSubmit={handleSubmit}>
        <div className="addoperationpicture-row">
          <label>
            Əməliyyat Kateqoriyası
            <span className="addoperationpicture-required">*</span>
          </label>
          <CustomSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Kateqoriya seçin"
          />
        </div>

        <div className="addoperationpicture-row">
          <label>
            Əməliyyat
            <span className="addoperationpicture-required">*</span>
          </label>
          <CustomSelect
            options={operationOptions}
            value={selectedOperation}
            onChange={setSelectedOperation}
            placeholder="Əməliyyat seçin"
            isDisabled={!selectedCategory}
          />
        </div>

        <div className="addoperationpicture-row imagesRowToUploadOperation">
          <label>Şəkil</label>
          <div className="image-upload-area">
            {image ? (
              <div className="image-preview">
                <img src={image} alt="Uploaded" />
                <div className="download-overlay">
                  <img
                    src={downloadIcon}
                    alt="Download"
                    className="download-icon"
                  />
                </div>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="image-placeholder"
              >
                <AddPhoto className="add-photo-icon" />
                <span>Şəkil yükləyin</span>
              </label>
            )}

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              hidden
            />
          </div>
        </div>

        <div className="addoperationpicture-actions">
          <button
            type="button"
            className="addoperationpicture-cancel-btn"
            onClick={() => navigate(-1)}
          >
            İmtina et
          </button>

          <button
            type="submit"
            className="addoperationpicture-save-btn"
            disabled={loading}
          >
            {loading ? "Yüklənir..." : "Yadda saxla"}
          </button>
        </div>

        {error && (
          <p className="error-message">
            Xəta: {error.message || "Naməlum xəta"}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddOperationPicture;
