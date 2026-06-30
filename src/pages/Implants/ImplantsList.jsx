import React, { useEffect, useState } from "react";
import "../../assets/style/Implants/implantslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import useImplantStore from "../../../stores/implantStore";

const ImplantsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { implants, fetchImplants, removeImplant, changeStatus, loading } =
    useImplantStore();

  useEffect(() => {
    fetchImplants();
  }, []);

  const filteredImplants = implants.filter((row) => {
    return (
      row.implantBrandName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter ? row.status === statusFilter : true)
    );
  });

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    const confirmMessage =
      newStatus === "ACTIVE"
        ? "İmplantı aktiv etmək istəyirsiniz?"
        : "İmplantı passiv etmək istəyirsiniz?";

    if (window.confirm(confirmMessage)) {
      await changeStatus(id, newStatus);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
      await removeImplant(id);
    }
  };

  return (
    <div className="implantsList-container">
      <div className="implantsList-controls-section">
        <div className="implantsList-filters">
          <select
            className="implantsList-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="implantsList-search-box">
            <input
              type="text"
              placeholder="Axtarış"
              className="implantsList-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="implantsList-search-button">
              <CiSearch className="implantsList-search-icon" />
            </button>
          </div>
        </div>
        <div className="implantsList-actions">
          <Link to={"./add"} className="implantsList-add-new-button">
            <span>+</span> Yenisini əlavə et
          </Link>
          <button className="implantsList-download-button">
            <FiDownload className="implantsList-download-icon" />
          </button>
        </div>
      </div>

      <div className="implantsList-table-section">
        <table className="implantsList-table">
          <thead>
            <tr>
              <th>№</th>
              <th className=" !text-center">
                <span className="!flex !justify-center gap-1">
                <HiOutlineArrowsUpDown className=" mt-1" /> Marka
                </span>
              </th>
              <th className=" !text-center">
                <span className="!flex !justify-center gap-1"> 
                <HiOutlineArrowsUpDown className=" mt-1" /> Ölçülər
                </span>
              </th>
              <th>
                <span className="gap-1 !flex !justify-center"> 
                <HiOutlineArrowsUpDown className="mt-1" /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Yüklənir...</td>
              </tr>
            ) : filteredImplants.length > 0 ? (
              filteredImplants.map((row, index) => (
                <tr key={row.id}>
                  <td className="!text-center">{index + 1}</td>
                  <td className="!text-center">{row.implantBrandName}</td>
                  <td className="!text-center">
                    <Link to={`./sizes/${row.id}`}>
                      Ölçüləri ({row.implantSizesReads?.length || 0})
                    </Link>
                  </td>
                  <td className="cursor-pointer !text-center">
                    <span
                      className={`implantsList-status-badge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      onClick={() => handleStatusChange(row.id, row.status)}>
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td className="flex gap-2 mt-2.5">
                    <FiEdit3
                      className="implantsList-edit-button"
                      onClick={() => navigate(`/implants/edit/${row.id}`)}
                    />
                    <GoTrash
                      className="implantsList-delete-button"
                      onClick={() => handleDelete(row.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Heç bir implant tapılmadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImplantsList;
