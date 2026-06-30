import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "../../assets/style/Specialities/editspeciality.css";
import useSpecializationStore from '../../../stores/useSpecializationStore';

function EditSpeciality() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Zustand store'dan lazımi funksiyaları və məlumatları götürürük
  const { specializations, fetchSpecializations, editSpecialization, loading } = useSpecializationStore();

  const [name, setName] = useState("");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
        navigate("/specialities");
      }
      setInitialDataLoaded(true);
    };

    if (id) {
      loadData();
    }
  }, [id, specializations, fetchSpecializations, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("İxtisasın adı boş ola bilməz!");
      return;
    }

    const data = { id: parseInt(id), name };

    try {
      await editSpecialization(data);
      toast.success("İxtisas uğurla yeniləndi!");
      setTimeout(() => navigate("/specialities"), 1500);
    } catch (err) {
      toast.error(`Xəta baş verdi: ${err.message}`);
    }
  };

  // Komponent yüklənərkən 'Yüklənir...' mesajını göstəririk
  if (loading && !initialDataLoaded) {
    return <div>Yüklənir...</div>;
  }

  return (
    <div className="editSpecialityContainer">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />

      <div className="editSpecialityWrapper">
        <form className="editSpecialityForm" onSubmit={handleSave}>
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

          <div className="editSpecialityActions">
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

export default EditSpeciality;