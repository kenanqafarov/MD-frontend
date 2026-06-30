import "../../assets/style/Insurance/insurancelist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useInsuranceCompanyStore from "../../../stores/insuranceStore";

function InsuranceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    insuranceCompanies, // artıq bu düz massivdir
    fetchAll,
    remove,
    updateStatus,
  } = useInsuranceCompanyStore();

  useEffect(() => {
    fetchAll();
  }, []);

  // Məlumat artıq düz massiv olduğu üçün:
  const filteredData = (insuranceCompanies || []).filter((row) =>
    row.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`${row.companyName} sığortasını silmək istədiyinizə əminsiniz?`)) return;

    try {
      await remove(row.id);
      alert(`${row.companyName} uğurla silindi.`);
    } catch (err) {
      alert("Silinmə zamanı xəta baş verdi.");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    if (!window.confirm(`Sığortanı ${newStatus === "ACTIVE" ? "aktiv" : "passiv"} etmək istədiyinizə əminsiniz?`))
      return;

    try {
      await updateStatus(id, { status: newStatus });
      alert(`Sığorta uğurla ${newStatus === "ACTIVE" ? "aktiv" : "passiv"} edildi!`);
    } catch (error) {
      alert("Status dəyişdirmə zamanı xəta baş verdi!");
    }
  };

  return (
    <div className="insurancePageWrapper">
      <div className="insuranceCategoryQuickSearch">
        <div className="insuranceCategoryLeftPart">
          <select>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
          <div className="searchForNameInsurance">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="insuranceCategoryRightPart">
          <Link to={"./add"}>
            <p className="addNewInsuranceCategory">
              <span>+</span> Yenisini əlavə et
            </p>
          </Link>
          <Link to={"/export"}>
            <FiDownload className="exportInsuranceCategoriesData" />
          </Link>
        </div>
      </div>

      <div className="insurancePageTableWrapper">
        <table className="insurancePageTable">
          <thead>
            <tr>
              <th>{filteredData.length}</th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Sığorta şirkəti
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Azadolma məbləği
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Status
                </span>
              </th>
              <th>Düzəliş</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Sığorta şirkəti tapılmadı.
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="insuranceNameCol">{row.companyName}</td>
                  <td>{row.deductibleAmount} ₼</td>
                  <td>
                    <span
                      className={`statusBadge ${
                        row.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      onClick={() => handleStatusChange(row.id, row.status)}
                      style={{ cursor: "pointer" }}
                    >
                      {row.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="insuranceActionIcons">
                      <FiEdit3
                        className="editBtn"
                        onClick={() => handleEdit(row)}
                      />
                      <GoTrash
                        className="deleteBtn"
                        onClick={() => handleDelete(row)}
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
  );
}

export default InsuranceList;
