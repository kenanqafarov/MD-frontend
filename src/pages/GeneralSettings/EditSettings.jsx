import React, { useState } from "react";
import "../../assets/style/GeneralSettings/editsettings.css";

const EditSettings = () => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("23:00");
  const [interval, setInterval] = useState("15");
  const [diagnosisItems, setDiagnosisItems] = useState(["Müayinə", "14"]);
  const [labItems, setLabItems] = useState(["Endodontiya - 1Perio lateral"]);
  const [saving, setSaving] = useState(false);

  const removeItem = (type, index) => {
    if (type === "diagnosis") {
      setDiagnosisItems(diagnosisItems.filter((_, i) => i !== index));
    } else {
      setLabItems(labItems.filter((_, i) => i !== index));
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
      const response = await fetch(`${API_BASE_URL}/general-settings/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime,
          endTime,
          intervalMinutes: Number(interval),
        }),
      });
      if (response.ok) {
        alert("Tənzimləmələr uğurla yadda saxlandı!");
        window.history.back();
      } else {
        alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      }
    } catch (err) {
      console.error("Settings save error:", err);
      alert("Xəta baş verdi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editGeneralSettingsWrapper">
        <div className="editSettings-container">
        <div className="editSettings-row">
            <label className="editSettings-label">Təqvim: Başlama saatı</label>
            <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="editSettings-input"
            />
        </div>

        <div className="editSettings-row">
            <label className="editSettings-label">Təqvim: Bitış saatı</label>
            <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="editSettings-input"
            />
        </div>

        <div className="editSettings-row">
            <label className="editSettings-label">Təqvim: Interval (dəqiqə)</label>
            <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="editSettings-input"
            />
        </div>

        <div className="editSettings-row">
            <label className="editSettings-label">Diaqnoz üçün müayinələr</label>
            <div className="editSettings-tags">
            {diagnosisItems.map((item, index) => (
                <span key={index} className="editSettings-tag">
                {item}
                <button
                    type="button"
                    onClick={() => removeItem("diagnosis", index)}
                    className="editSettings-remove"
                >
                    ✕
                </button>
                </span>
            ))}
            </div>
        </div>

        <div className="editSettings-row">
            <label className="editSettings-label">Laboratoriya üçün əməliyyatlar</label>
            <div className="editSettings-tags">
            {labItems.map((item, index) => (
                <span key={index} className="editSettings-tag">
                {item}
                <button
                    type="button"
                    onClick={() => removeItem("lab", index)}
                    className="editSettings-remove"
                >
                    ✕
                </button>
                </span>
            ))}
            </div>
        </div>

        <div className="editSettings-actions">
            <button
              type="button"
              className="editSettings-cancel"
              onClick={handleCancel}
            >
              İmtina et
            </button>
            <button
              type="button"
              className="editSettings-save"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saxlanılır..." : "Yadda saxla"}
            </button>
        </div>
        </div>
    </div>
  );
};

export default EditSettings;
