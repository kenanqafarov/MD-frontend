import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/style/CabinetsPage/cabinetspage.css";
import useCabinetStore from "../../../stores/cabinetStore";
import "./cabinet.css";

const statusOptions = [
  { value: "", label: "Status" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PASSIVE", label: "Passiv" },
];

const formatStatus = (status) => {
  return status === "ACTIVE" ? "Aktiv" : "Passiv";
};

const CabinetsPage = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { cabinets, fetchCabinets, deleteCabinet, updateStatus, loading } =
    useCabinetStore();

  useEffect(() => {
    fetchCabinets();
  }, []);

  const filteredCabinetItems = cabinets.filter(
    (item) =>
      (status === "" || item.status === status) &&
      item.cabinetName.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      deleteCabinet(id);
    }
  };

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    const statusData = { id, status: newStatus };
    updateStatus(statusData);
  };

  return (
    <div className="cabinetsPageWrapper">
      <div className="cabinetsPageContainer">
        <div className="cabinetsPageTopPart">
          <div className="leftPartOfTop">
            <select
              className="cabinetsStatusSelect"
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
            <Link to={"add"} className="addNewCabinetItem">
              <FaPlus /> Yenisini əlavə et
            </Link>
            <Link className="exportDataOfCabinets" title="Export">
              <CiExport size={22} className="exportCabinetDataIcon" />
            </Link>
          </div>
        </div>

        <div className="cabinetsTableWrapper">
          <table className="cabinetsTable">
            <thead>
              <tr>
                <th>
                  <span>№</span>
                </th>
                <th>
                  <span>
                    <HiArrowsUpDown className="tableArrowIcon" /> Kabinetin adı
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
              {loading ? (
                <tr>
                  <td colSpan="4">Yüklənir...</td>
                </tr>
              ) : filteredCabinetItems.length === 0 ? (
                <tr>
                  <td colSpan="4">Nəticə tapılmadı</td>
                </tr>
              ) : (
                filteredCabinetItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.cabinetName}</td>
                    <td>
                      <span
                        className={`status-toggle ${
                          item.status === "ACTIVE" ? "active" : "passive"
                        }`}
                        onClick={() =>
                          handleStatusToggle(item.id, item.status)
                        }>
                        {formatStatus(item.status)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CabinetsPage;
