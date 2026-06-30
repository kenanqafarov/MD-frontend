import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useTechnicianStore from "../../../stores/technicianStore";
import { CiSearch, CiExport, CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import "../../assets/style/Technicians/technicians.css";
import "./tech.css";

function Technicians() {
  const {
    technicians,
    fetchTechnicians,
    removeTechnician,
    exportToExcel,
    searchTechs,
    updateTechStatus,
    loading,
    error,
  } = useTechnicianStore();

  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigate();

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const getStatus = (tech) => (tech.status === "ACTIVE" ? "Aktiv" : "Passiv");

  const toggleStatus = async (tech) => {
    const newStatus = tech.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateTechStatus(tech.id, newStatus);
    } catch (error) {
      alert("Status dəyişdirilə bilmədi.");
      console.error(error);
    }
  };

  const handleDelete = async (tech) => {
    const confirmDelete = window.confirm(
      `İşçini silmək istədiyinizə əminsiniz? (${tech.username})`
    );
    if (!confirmDelete) return;

    try {
      await removeTechnician(tech.id);
      alert("İşçi uğurla silindi!");
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi.");
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    await searchTechs({ search: term });
  };

  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigation(`${row.id}`),
      className: "info",
    },
    {
      icon: FiEdit3,
      action: (row) => navigation(`edit/${row.id}`),
      className: "edit",
    },
    {
      icon: GoTrash,
      action: (row) => handleDelete(row),
      className: "delete",
    },
  ];

  if (loading) {
    return <div>Yüklənir...</div>;
  }

  if (error) {
    return <div>Xəta: {error}</div>;
  }
  
  // `technicians` məlumatının Array olub olmadığını yoxlayın
  const techList = Array.isArray(technicians) ? technicians : [];

  return (
    <div className="techniciansPageContainer">
      <div className="techiniciansPageTopPart">
        <div className="leftPartOfTop">
          <select name="" id="">
            <option value="">Status</option>
            <option value="active">Aktiv</option>
            <option value="passive">Passiv</option>
          </select>
          <div className="searchBarContainer relative flex items-center">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pr-10"
            />
          </div>
        </div>
        <div className="rightPartOfTop">
          <Link className="addNewTechnicianNow" to={"add"}>
            <span>+</span> Yenisini əlavə et
          </Link>
          <button
            className="exportDataOfTechs"
            onClick={exportToExcel}
            title="Export to Excel"
          >
            <CiExport className="exportDataOfTechsIcon" />
          </button>
        </div>
      </div>

      <div className="techniciansTableWrapper">
        <table className="techniciansTable">
          <thead>
            <tr>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> İstifadəçi adı
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> Adı
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> Soyadı
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> Ata adı
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> İcazələr
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> Mobil nömrə
                </span>
              </th>
              <th>Qiymətlər</th>
              <th>
                <span className="flex items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon" /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {techList.length > 0 ? (
              techList.map((tech) => 
                // Hər bir "tech" obyektinin mövcudluğunu yenidən yoxlayın
                tech && tech.username ? (
                  <tr key={tech.id}>
                    <td className="usernameOfTech">
                      <img
                        src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(
                          tech.username
                        )}`}
                        className="imageOfTech"
                        alt={tech.username}
                      />
                      {tech.username}
                    </td>
                    <td>{tech.name}</td>
                    <td>{tech.surname}</td>
                    <td>{tech.patronymic}</td>
                    <td>Texnik</td>
                    <td>{tech.phone}</td>
                    <td>
                      <Link className="priceListLinkTech" to={`prices/${tech.id}`}>
                        Qiymətlər
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          tech.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        onClick={() => toggleStatus(tech)}
                        style={{ cursor: "pointer" }}
                        title="Statusu dəyişmək üçün klikləyin"
                      >
                        {getStatus(tech)}
                      </span>
                    </td>
                    <td>
                      <div className="icons flex gap-3 cursor-pointer">
                        {icons.map(
                          ({ icon: IconComp, className, action }, idx) => (
                            <IconComp
                              key={idx}
                              className={className}
                              onClick={() => action(tech)}
                            />
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ) : null
              )
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  Heç bir texnik tapılmadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Technicians;