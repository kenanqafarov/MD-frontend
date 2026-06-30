import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import useCeramicsStore from "../../../stores/ceramicStore";
import "../../assets/style/Ceramics/editceramics.css";

function EditCeramics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const { fetchCeramicById, updateCeramic, selectedCeramic, loading, error } =
    useCeramicsStore();

  useEffect(() => {
    fetchCeramicById(id);
  }, [id, fetchCeramicById]);

  useEffect(() => {
    if (selectedCeramic) {
      setName(selectedCeramic.name || "");
    }
  }, [selectedCeramic]);

  const handleSave = async () => {
    try {
      await updateCeramic(id, { name });
      navigate("/ceramics");
    } catch (err) {
      console.error("Yadda saxlanılmadı:", err);
      alert("Xəta baş verdi!");
    }
  };

  return (
    <div className="editCeramicsContainer">
      <div className="editCeramicsWrapper">
        {loading ? (
          <p>Yüklənir...</p>
        ) : error ? (
          <p style={{ color: "red" }}>
            Xəta: {error?.message || "Naməlum xəta baş verdi"}
          </p>
        ) : (
          <form
            className="editCeramicsForm"
            onSubmit={(e) => e.preventDefault()}>
            <div className="topPartForm">
              <label htmlFor="name">
                Keramikanın adı: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                placeholder="Keramikanın adı"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="editCeramicsActions">
              <button
                type="button"
                className="cancelBtn"
                onClick={() => navigate("/ceramics")}>
                <RxCross2 /> İmtina et
              </button>
              <button type="submit" className="saveBtn" onClick={handleSave}>
                <FiCheck /> Yadda saxla
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditCeramics;
