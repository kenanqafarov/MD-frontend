import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import "../../assets/style/ChecklistPage/checklistpage.css";
import { Link, useNavigate } from "react-router-dom";
import useExaminationStore from "../../../stores/examinationStore";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const ChecklistPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const {
    examinations,
    fetchAllExaminations,
    deleteExamination,
    updateExaminationStatus,
  } = useExaminationStore();

  useEffect(() => {
    fetchAllExaminations();
  }, []);

  const filteredChecklistItems = examinations.filter(
    (item) =>
      (status === "" || item.status === status) &&
      item.typeName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await deleteExamination(id);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    await updateExaminationStatus({
      id: item.id,
      typeName: item.typeName,
      status: newStatus,
    });
  };

  return (
    <div className="checkListPageWrapper">
      <div className="checklistPageContainer">
        <div className="checklistPageTopPart">
          <div className="leftPartOfTop">
            <select
              className="checklistStatusSelect"
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
              />
              <CiSearch className="searchIconBTN" />
            </div>
          </div>
          <div className="rightPartOfTop">
            <Link to={"add"} className="addNewChecklistItem">
              <FaPlus /> Yenisini əlavə et
            </Link>
            <Link className="exportDataOfChecklist" title="Export">
              <CiExport size={22} className="exportChecklistDataIcon" />
            </Link>
          </div>
        </div>

        <div className="checklistTableWrapper">
          <table className="checklistTable">
            <thead>
              <tr>
                <th>
                  <span>{`1-${filteredChecklistItems.length}`}</span>
                </th>
                <th>
                  <span>
                    <HiArrowsUpDown className="tableArrowIcon" /> Növün adı
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
              {filteredChecklistItems.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.typeName}</td>
                  <td>
                    <span
                      className={`status ${
                        item.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      style={{
                        backgroundColor:
                          item.status === "ACTIVE" ? "#d4edda" : "#f8d7da",
                        color: item.status === "ACTIVE" ? "#155724" : "#721c24",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                      onClick={() => toggleStatus(item)}>
                      {item.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="icons flex gap-3 cursor-pointer">
                      <FiEdit3
                        className="edit"
                        onClick={() => handleEdit(item.id)}
                      />
                      <GoTrash
                        className="delete"
                        onClick={() => handleDelete(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredChecklistItems.length === 0 && (
                <tr>
                  <td colSpan="4">Nəticə tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
