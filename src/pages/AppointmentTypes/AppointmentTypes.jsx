import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import "../../assets/style/AppointmentTypes/appointmenttypes.css";
import { CiExport } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import useAppointmentTypeStore from "../../../stores/appointment-type-store";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const AppointmentTypes = () => {
  const {
    appointmentTypes = [],
    loading,
    error,
    fetchAppointmentTypes,
    removeAppointmentType,
    updateAppointmentTypeStatus,
  } = useAppointmentTypeStore();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointmentTypes();
  }, [fetchAppointmentTypes]);

  const filteredAppointmentTypes = (appointmentTypes || []).filter(
    (type) =>
      (status === "" || (type?.status || "") === status) &&
      (type?.appointmentTypeName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu randevu tipini silmək istədiyinizə əminsinizmi?")) {
      await removeAppointmentType(id);
    }
  };

  const toggleStatus = async (type) => {
    if (!updateAppointmentTypeStatus) return;

    const newStatus = type.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";

    await updateAppointmentTypeStatus({ id: type.id, status: newStatus });
  };

  const handleSearch = async () => {
    if (search.trim()) {
    } else {
      await fetchAppointmentTypes();
    }
  };

  if (loading)
    return (
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
        </div>
      </div>
    );
  if (error) return <div>Error: {error.message || error.toString()}</div>;

  return (
    <div className="appointmentTypesPageContainer">
      <div className="appointmentTypesPageTopPart">
        <div className="leftPartOfTop">
          <select
            className="appointmentTypesStatusSelect"
            value={status}
            onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="searchBarContainer">
            <input
              type="text"
              placeholder="Axtarış"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <CiSearch className="searchIconBTN" onClick={handleSearch} />
          </div>
        </div>

        <div className="rightPartOfTop">
          <Link to={"add"} className="addNewAppointmentType">
            <FaPlus /> Yenisini əlavə et
          </Link>
          <Link className="exportDataOfAppointmentTypes" title="Export">
            <CiExport size={22} className="exportAppointmentTypeDataIcon" />
          </Link>
        </div>
      </div>

      <div className="appointmentTypesTableWrapper">
        <table className="appointmentTypesTable">
          <thead>
            <tr>
              <th>
                <span>1-{filteredAppointmentTypes.length}</span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Randevu tipinin
                  adı
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Müddət
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointmentTypes.map((type, idx) => (
              <tr key={type?.id || idx}>
                <td>{idx + 1}</td>
                <td>{type?.appointmentTypeName || ""}</td>
                <td>{type?.time ? type.time.slice(0, 5) : ""}</td>
                <td>
                  <span
                    onClick={() => toggleStatus(type)}
                    className={`status ${
                      (type?.status || "") === "ACTIVE" ? "active" : "passive"
                    }`}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Statusu dəyişmək üçün kliklə">
                    {(type?.status || "") === "ACTIVE" ? "Aktiv" : "Passiv"}
                  </span>
                </td>
                <td>
                  <div className="icons flex gap-3 cursor-pointer">
                    <FiEdit3
                      className="edit"
                      onClick={() => handleEdit(type?.id)}
                    />
                    <GoTrash
                      className="delete"
                      onClick={() => handleDelete(type?.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentTypes;
