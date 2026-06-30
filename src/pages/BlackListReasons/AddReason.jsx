import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

import useBlackListReasonStore from "../../../stores/blacklistReasonStore";
import "../../assets/style/Specialities/addspeciality.css";

function AddReason() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { addResult } = useBlackListReasonStore();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Səbəbin adı boş ola bilməz");
      return;
    }

    const reasonData = {
      statusName: name,
    };

    try {
      await addResult(reasonData);
      toast.success("Səbəb uğurla əlavə olundu");
      navigate("/blacklist-reasons");
    } catch (error) {
      toast.error("Xəta baş verdi");
    }
  };

  return (
    <div className="addSpecialityContainer">
      <div className="addSpecialityWrapper">
        <form
          className="addSpecialityForm"
          onSubmit={(e) => e.preventDefault()}>
          <div className="topPartForm">
            <label htmlFor="name">
              Səbəbin adı <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Səbəbin adı"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="addSpecialityActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/blacklist-reasons")}>
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

export default AddReason;
