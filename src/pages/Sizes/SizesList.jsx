import "../../assets/style/Sizes/sizeslist.css";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// Static data for example
const staticSizesData = [
  { id: "1", diameter: "2.0", length: "6", status: "Aktiv" },
  { id: "2", diameter: "2.5", length: "8", status: "Aktiv" },
  { id: "3", diameter: "3.0", length: "10", status: "Passiv" },
  { id: "4", diameter: "3.5", length: "12", status: "Aktiv" },
];

function SizesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sizesData] = useState(staticSizesData);

  const filteredData = sizesData.filter((row) =>
    row.diameter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (row) => {
    navigate(`edit/${row.id}`);
  };

  const handleDelete = (row) => {
    const confirmDelete = window.confirm(
      `${row.diameter} ölçüsünü silmək istədiyinizə əminsiniz?`
    );
    if (!confirmDelete) return;

    // Here you would typically make an API call to delete
    console.log("Deleting size:", row.id);
    alert(`${row.diameter} uğurla silindi.`);
  };

  return (
    <div className="sizesPageWrapper">
      <div className="sizesCategoryQuickSearch">
        <div className="sizesCategoryLeftPart">
          <select>
            <option value="">Status</option>
            <option value="Aktiv">Aktiv</option>
            <option value="Passiv">Passiv</option>
          </select>
          <div className="searchForNameSizes">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch className="searchForNameIcon" />
          </div>
        </div>
        <div className="sizesCategoryRightPart">
          <Link to={"./add"}>
            <p className="addNewSizesCategory">
              <span>+</span> Yenisini əlavə et
            </p>
          </Link>
          <Link to={"/export"}>
            <FiDownload className="exportSizesCategoriesData" />
          </Link>
        </div>
      </div>

      <div className="sizesPageTableWrapper">
        <table className="sizesPageTable">
          <thead>
            <tr>
              <th > {staticSizesData.length===0?'0':`1-${staticSizesData.length}`}</th>
              <th >
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Diametir
                </span>
              </th>
              <th>
                <span>
                  <HiOutlineArrowsUpDown className="arrowIconsNow" /> Uzunluq
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
            {filteredData.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td className="sizesNameCol">{row.diameter}</td>
                <td>{row.length}</td>
                <td>
                  <span
                    className={`statusBadge ${row.status === "Aktiv" ? "active" : "passive"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <div className="sizesActionIcons">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SizesList; 