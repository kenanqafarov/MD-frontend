import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";

// Style
import "../../assets/style/Specialities/specialities.css";

// Libraries
import { Link } from 'react-router-dom';
import useSpecializationStore from "../../../stores/useSpecializationStore";

function Specialities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Zustand store'dan məlumatları və funksiyaları götürürük
  const { 
    specializations, 
    loading, 
    error, 
    fetchSpecializations, 
    removeSpecialization 
  } = useSpecializationStore();

  // Komponent yüklənəndə ixtisasları API-dan gətiririk
  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

  // Axtarış və status filterləmə əməliyyatı
  const filteredData = specializations.filter((specialization) => {
    const nameMatch = specialization.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "" || specialization.status.toLowerCase() === filterStatus.toLowerCase();
    return nameMatch && statusMatch;
  });

  const handleEdit = (row) => {
    navigate(`/edit-speciality/${row.id}`);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Siz "${name}" ixtisasını silməyə əminsiniz?`)) {
      try {
        await removeSpecialization(id);
        alert(`"${name}" ixtisası uğurla silindi.`);
      } catch (err) {
        alert(`"${name}" ixtisası silinərkən xəta baş verdi.`);
        console.error("Silinmə xətası:", err);
      }
    }
  };

  if (loading) {
    return <div>Yüklənir...</div>;
  }

  if (error) {
    return <div>Xəta: {error}</div>;
  }

  return (
    <div className="specialitiesContainer">
      <div className="specialitiesContainerTopPart">
        <div className="leftPart">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="specialitiesQuickSearch">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchSpecialityIcon" />
          </div>
        </div>
        <div className="rightPart">
          <Link className="addSpeciality" to={'add'}>
            <IoMdAdd className="addSpecialityIcon" /> Yenisini əlavə et
          </Link>
          <Link className="exportSpecialities">
            <FiDownload className="exportSpecialitiesIcon" />
          </Link>
        </div>
      </div>

      <div className="specialitiesTableWrapper">
        <table className="specialitiesTable">
          <thead>
            <tr>
              <th>{filteredData.length !== 0 ? `1-${filteredData.length}` : 0}</th>
              <th className='specialityName'>
                <span>
                  <HiOutlineArrowsUpDown className='arrowIconsNow' /> İxtisasın adı
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className='arrowIconsNow' /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td className='specialityName'>{row.name}</td>
                <td>
                  <span className={`statusBadge ${row.status.toLowerCase() === "active" ? "active" : "passive"}`}>
                    {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                  </span>
                </td>
                <td>
                  <div className="actionIcons">
                    <FiEdit3 className="editBtn" onClick={() => handleEdit(row)} />
                    <GoTrash className="deleteBtn" onClick={() => handleDelete(row.id, row.name)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Specialities;