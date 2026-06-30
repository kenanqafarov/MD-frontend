import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import useMetalStore from "../../../stores/metalsStore";
import "../../assets/style/Metals/addmetal.css";

function AddMetal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMetal, fetchMetalById, createMetal, updateMetal, loading } =
    useMetalStore();

  const [name, setName] = useState("");

  useEffect(() => {
    if (id) {
      fetchMetalById(id);
    }
  }, [id, fetchMetalById]);

  useEffect(() => {
    if (selectedMetal && id) {
      setName(selectedMetal.name || "");
    }
  }, [selectedMetal, id]);

  const handleSave = async () => {
    if (!name.trim()) return;

    const formData = { name };

    if (id) {
      await updateMetal(id, formData);
    } else {
      await createMetal(formData);
    }
    navigate("/metals");
  };

  return (
    <div className="addMetalContainer">
      <div className="addMetalWrapper">
        <form
          className="addMetalForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}>
          <div className="topPartForm">
            <label htmlFor="name">
              Metalın adı <span style={{ color: "red" }}>*</span>
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
          </div>

          <div className="addMetalActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/specialities")}
              disabled={loading}>
              <RxCross2 /> İmtina et
            </button>
            <button type="submit" className="saveBtn" disabled={loading}>
              <FiCheck /> Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMetal;
