import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import "../../assets/style/ColorsPage/colorspage.css";
import { CiExport } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import useColorStore from "../../../stores/colorStore";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const ColorsPage = () => {
  const navigate = useNavigate();

  const colors = useColorStore((state) => state.colors);
  const fetchColors = useColorStore((state) => state.fetchColors);
  const updateStatus = useColorStore((state) => state.updateStatus);
  const updateLocalStatus = useColorStore((state) => state.updateLocalStatus);
  const removeColor = useColorStore((state) => state.removeColor);

  const [status, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredColors = colors.filter(
    (item) =>
      (status === "" || item.status === status) &&
      (typeof item.name === "string" ? item.name.toLowerCase() : "").includes(
        search.toLowerCase()
      )
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bu rəngi silmək istədiyinizə əminsiniz?");
    if (!confirm) return;

    try {
      await removeColor(id);
    } catch (error) {
      console.error("Silinmə zamanı xəta:", error);
    }
  };

  const handleStatusClick = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    try {
      await updateStatus(id, { status: newStatus });
      updateLocalStatus(id, newStatus); // local yeniləmə
    } catch (error) {
      console.error("Status dəyişdirilə bilmədi:", error);
    }
  };

  return (
    <div className="checkListPageWrapper">
      <div className="checklistPageContainer">
        <div className="checklistPageTopPart">
          <div className="leftPartOfTop">
            <select
              className="checklistStatusSelect"
              value={status}
              onChange={(e) => setStatusFilter(e.target.value)}>
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
            <Link
              to={"export"}
              className="exportDataOfChecklist"
              title="Export">
              <CiExport size={22} className="exportChecklistDataIcon" />
            </Link>
          </div>
        </div>

        <div className="checklistTableWrapper">
          <table className="checklistTable">
            <thead>
              <tr>
                <th>
                  <span>#</span>
                </th>
                <th>
                  <span>
                    <HiArrowsUpDown className="tableArrowIcon" /> Rəngin adı
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
              {filteredColors.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.name}</td>
                  <td>
                    <span
                      className={`status cursor-pointer ${
                        item.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      onClick={() => handleStatusClick(item.id, item.status)}>
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
              {filteredColors.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Nəticə tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ColorsPage;
