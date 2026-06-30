import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/style/PriceCategory/addpricecategory.css";
import { FaTimes, FaCheck } from "react-icons/fa";
import usePriceCategoryStore from "../../../stores/priceCategoryStore"

function AddPriceCategory() {
  const navigate = useNavigate();
  const addCategory = usePriceCategoryStore((state) => state.addCategory);
  const loading = usePriceCategoryStore((state) => state.loading);
  const [formData, setFormData] = useState({
    categoryName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.categoryName,
      status: "ACTIVE",
    };

    try {
      await addCategory(payload);
      toast.success("Qiymət kateqoriyası uğurla əlavə edildi");
      navigate("/price-category");
    } catch (error) {
      toast.error("Xəta baş verdi");
      console.error("Error:", error);
    }
  };

  return (
    <div className="addPriceCategoryFormWrapper">
      <div className="addPriceCategoryFormContainer">
        <form onSubmit={handleSubmit}>
          <div className="addPriceCategoryFormRow">
            <label className="addPriceCategoryLabel">
              Kateqoriya adı <span className="required">*</span>
            </label>
            <input
              type="text"
              className="addPriceCategoryField"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="addPriceCategoryActions">
            <button
              type="button"
              className="addPriceCategoryCancelBtn"
              onClick={() => navigate("/price-category")}
              disabled={loading}
            >
              <FaTimes /> İmtina et
            </button>
            <button
              type="submit"
              className="addPriceCategorySaveBtn"
              disabled={loading}
            >
              {loading ? "Yüklənir..." : <><FaCheck /> Yadda saxla</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPriceCategory;
