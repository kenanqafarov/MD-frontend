import React from 'react';
import '../../assets/style/GeneralSettings/generalsettings.css'; 
import { FiEdit3 } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const GeneralSettings = () => {
    const navigator = useNavigate()
    const handleClick = ()=>{
        navigator("./edit")
    }
  return (
    <div className="generalSettingsWrapper">
        <div className="general-settings-container ">

        <FiEdit3 onClick={handleClick} className="editIconForGeneralSettings"/>
        <div className="setting-item">
            <label htmlFor="sample-check">Nümune Check</label>
            <div className="toggle-switch">
            <input type="checkbox" id="sample-check"  checked={false} />
            <span className="status-label">Passiv</span>
            </div>
        </div>

        <div className="setting-item">
            <label htmlFor="start-time">Təqvim: Başlama saatı</label>
            <input type="text" id="start-time" value="9:00" readOnly />
        </div>

        <div className="setting-item">
            <label htmlFor="end-time">Təqvim: Bitiş saatı</label>
            <input type="text" id="end-time" value="23:00" readOnly />
        </div>

        <div className="setting-item">
            <label htmlFor="interval">Təqvim: Interval (dəqiqə)</label>
            <input type="text" id="interval" value="15" readOnly />
        </div>

        <div className="setting-item">
            <label htmlFor="diagnosis-examinations">Diaqnoz üçün müayinələr</label>
            <input type="text" id="diagnosis-examinations" value="Müayinə" readOnly />
        </div>
        </div>
    </div>
  );
};

export default GeneralSettings;