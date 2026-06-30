import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import useCeramicsStore from "../../../stores/ceramicStore";

import "../../assets/style/Ceramics/addceramics.css";

function AddCeramics() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const createCeramic = useCeramicsStore((state) => state.createCeramic);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Ad boş ola bilməz");
      return;
    }
    setError(null);

    try {
      await createCeramic({ name });
      navigate("/ceramics");
    } catch (err) {
      setError("Yaratmaqda xəta baş verdi");
      console.error(err);
    }
  };

  return (
    <div className="addCeramicsContainer">
      <div className="addCeramicsWrapper">
        <form className="addCeramicsForm" onSubmit={(e) => e.preventDefault()}>
          <div className="topPartForm">
            <label htmlFor="name">
              Keramikanın adı <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Keramikanın adı"
              onChange={(e) => setName(e.target.value)}
              required
            />
            {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}
          </div>

          <div className="addCeramicsActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/ceramics")}>
              <RxCross2 /> imtina et
            </button>
            <button type="submit" className="saveBtn" onClick={handleSave}>
              <FiCheck /> Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCeramics;
