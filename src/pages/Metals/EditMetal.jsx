import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import useMetalStore from "../../../stores/metalsStore";
import "../../assets/style/Metals/editmetals.css";

function EditMetal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedMetal,
    fetchMetalById,
    updateMetal,
    loading,
    error,
  } = useMetalStore();

  const [name, setName] = useState("");

  // Seçilmiş metalı store-dan yüklə
  useEffect(() => {
    fetchMetalById(id);
  }, [id, fetchMetalById]);

  // selectedMetal dəyişdikdə name state-inə set et
  useEffect(() => {
    if (selectedMetal) {
      setName(selectedMetal.name || "");
    }
  }, [selectedMetal]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Metalın adı boş ola bilməz!");
      return;
    }

    await updateMetal(id, { name: name.trim() });

    if (!error) {
      alert("Metal uğurla yeniləndi");
      navigate("/metals");
    }
  };

  return (
    <div className="editMetalContainer">
      <div className="editMetalWrapper">
        <form className="editMetalForm" onSubmit={(e) => e.preventDefault()}>
          <div className="topPartForm">
            <label htmlFor="name">
              Metalın adı: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Metalın adı"
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            {error && <p style={{ color: 'red' }}>{error.message || error.toString()}</p>}
          </div>

          <div className="editMetalActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/metals")}
              disabled={loading}
            >
              <RxCross2 /> İmtina et
            </button>
            <button
              type="submit"
              className="saveBtn"
              onClick={handleSave}
              disabled={loading}
            >
              <FiCheck /> {loading ? "Yüklənir..." : "Yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMetal;
