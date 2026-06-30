import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import useBlackListResultStore from '../../../stores/blacklistReasonStore';
import "../../assets/style/Specialities/editspeciality.css"

function EditReason() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedResult,
    fetchResultById,
    updateResult,
    loading,
    error,
  } = useBlackListResultStore();

  const [name, setName] = useState("");

  useEffect(() => {
    fetchResultById(id);
  }, [id, fetchResultById]);

  useEffect(() => {
    if (selectedResult) {
      setName(selectedResult.statusName || "");
    }
  }, [selectedResult]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Səbəbin adı boş ola bilməz!");
      return;
    }
    await updateResult(id, { statusName: name });
    navigate("/blacklist-reasons");
  };

  if (loading) return <p>Yüklənir...</p>;
  if (error) return <p style={{ color: 'red' }}>Xəta: {error.message || error.toString()}</p>;

  return (
    <div className="editSpecialityContainer">
      <div className="editSpecialityWrapper">
        <form className="editSpecialityForm" onSubmit={(e) => e.preventDefault()}>
          <div className="topPartForm">
            <label htmlFor="name">Səbəbin adı <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Səbəbin adı"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="editSpecialityActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/blacklist-reasons")}
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
              <FiCheck /> Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReason;
