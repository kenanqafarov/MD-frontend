import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "../../assets/style/Specialities/addspeciality.css";
import useSpecializationStore from '../../../stores/useSpecializationStore';

function AddSpeciality() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Zustand store'dan lazımi funksiyaları götürürük
  const { specializations, addSpecialization, editSpecialization, fetchSpecializations } = useSpecializationStore();

  const [name, setName] = useState("");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Əgər id varsa, yəni redaktə rejimindəyiksə
      if (id) {
        // Əgər ixtisaslar siyahısı boşdursa, API-dan gətiririk
        if (specializations.length === 0) {
          await fetchSpecializations();
        }
        
        // Gətirilmiş siyahıdan redaktə ediləcək ixtisası tapırıq
        const specializationToEdit = specializations.find(spec => spec.id === parseInt(id));
        
        if (specializationToEdit) {
          setName(specializationToEdit.name);
        } else {
          toast.error("İxtisas tapılmadı!");
        }
      }
      setInitialDataLoaded(true);
    };

    loadData();
  }, [id, specializations, fetchSpecializations, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("İxtisasın adı boş ola bilməz!");
      return;
    }

    const data = { name };

    try {
      if (id) {
        // Redaktə əməliyyatı
        await editSpecialization({ ...data, id: parseInt(id) });
        toast.success("İxtisas uğurla yeniləndi!");
      } else {
        // Əlavə etmə əməliyyatı
        await addSpecialization(data);
        toast.success("İxtisas uğurla əlavə edildi!");
      }
      setTimeout(() => navigate("/specialities"), 1000);
    } catch (err) {
      toast.error(`Xəta baş verdi: ${err.message}`);
    }
  };

  if (id && !initialDataLoaded) {
      return <div>Yüklənir...</div>;
  }

  return (
    <div className="addSpecialityContainer">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />

      <div className="addSpecialityWrapper">
        <form className="addSpecialityForm" onSubmit={handleSave}>
          <div className="topPartForm">
            <label htmlFor="name">İxtisasın adı <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="İxtisas adı"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="addSpecialityActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/specialities")}
            >
              <RxCross2 /> imtina et
            </button>
            <button
              type="submit"
              className="saveBtn"
            >
              <FiCheck /> Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSpeciality;