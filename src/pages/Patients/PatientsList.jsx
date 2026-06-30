import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowsUpDown } from "react-icons/hi2";
import axios from "axios";

// Icons
import { CiSearch, CiCircleInfo } from "react-icons/ci";
import { GoTrash, GoChevronLeft, GoChevronRight } from "react-icons/go";

// Style
import "../../assets/style/PatientsPage/patientslist.css";

// Components
import OrdinaryListHeader from "../../components/OrdinaryList/OrdinaryListHeader";
import { useDebounce } from "../../hooks/useDebounce";

const initialSearch = {
  name: "",
  surname: "",
  patronymic: "",
  fin: "",
  phone: "",
  gender: "",
  status: "",
};

// Memoized table row component
const PatientRow = React.memo(({ item, onInfoClick, onDeleteClick }) => {
  return (
    <tr>
      <td>{item.id}</td>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.finCode}</td>
      <td>{item.genderStatus === "MAN" ? "Kişi" : "Qadın"}</td>
      <td>{item.phone}</td>
      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('az-AZ') : item.dateOfBirth}</td>
      <td>{item.priceCategoryName || "Standart"}</td>
      <td>{item.isBlocked ? "Bəli" : "Xeyr"}</td>
      <td>
        <div className="actionsWrapper">
          <CiCircleInfo
            className="icon info"
            onClick={() => onInfoClick(item)}
          />
          <GoTrash
            className="icon delete"
            onClick={() => onDeleteClick(item)}
          />
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => prevProps.item.id === nextProps.item.id);

PatientRow.displayName = 'PatientRow';

function PatientsList() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  // Debounce search for better performance
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Əvvəlcə cache-dən oxu
    const cachedData = localStorage.getItem("patients_cache");
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
        return; // Cache-dən oxuduqsa, API-yə istek atma
      } catch (e) {
        console.error("Cache parse xətası:", e);
      }
    }

    // Cache yoxdursa, API-dən gətir
    const token = localStorage.getItem("token");
    const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
    axios
      .get(`${API_BASE_URL}/patient/read`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        setData(data);
        // Cache-ə yaddaşa saxla
        localStorage.setItem("patients_cache", JSON.stringify(data));
        localStorage.setItem("patients_cache_timestamp", Date.now().toString());
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const removePatient = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
      await axios.delete(
        `${API_BASE_URL}/patient/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  }, []);

  // Memoized reversed data
  const reversedData = useMemo(() => {
    return [...data].reverse();
  }, [data]);

  // Memoized filtered data - use debouncedSearch for filtering
  const filteredData = useMemo(() => {
    return reversedData.filter(
      (item) =>
        (item.name || "")
          .toLowerCase()
          .includes(debouncedSearch.name.toLowerCase()) &&
        (item.surname || "")
          .toLowerCase()
          .includes(debouncedSearch.surname.toLowerCase()) &&
        (item.patronymic || "")
          .toLowerCase()
          .includes(debouncedSearch.patronymic.toLowerCase()) &&
        (item.finCode || "")
          .toLowerCase()
          .includes(debouncedSearch.fin.toLowerCase()) &&
        (item.phone || "")
          .toLowerCase()
          .includes(debouncedSearch.phone.toLowerCase()) &&
        (debouncedSearch.gender ? item.genderStatus === debouncedSearch.gender : true) &&
        (debouncedSearch.status ? item.priceCategoryName === debouncedSearch.status : true)
    );
  }, [reversedData, debouncedSearch]);

  // Memoized pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, itemsPerPage]);

  const paginate = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  // Memoized event handlers
  const handleInfoClick = useCallback((row) => {
    navigate(`/patients/patient/${row.id}/general`);
  }, [navigate]);

  const handleDeleteClick = useCallback((row) => {
    const confirmed = window.confirm(
      `Silmək istədiyinizə əminsiniz? (${row.name})`
    );
    if (confirmed) {
      removePatient(row.id);
    }
  }, [removePatient]);

  // Memoized pagination buttons
  const paginationButtons = useMemo(() => {
    return [...Array(totalPages).keys()].map((number) => (
      <button
        key={number + 1}
        onClick={() => paginate(number + 1)}
        className={currentPage === number + 1 ? "active" : ""}
      >
        {number + 1}
      </button>
    ));
  }, [totalPages, currentPage, paginate]);

  return (
    <>
      <div className="patientsListWrapper">
        <OrdinaryListHeader
          title="Pasiyentlər"
          addText="Yenisini əlavə et"
          addLink="/patients/add-patient"
          exportLink="/patients/export"
        />
        <div className="patientsListSearch ml-1">
          <div className="leftPart">
            <input
              type="text"
              placeholder="Ad"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
            
            <input
              type="text"
              placeholder="Fin kodu"
              value={search.fin}
              onChange={(e) => setSearch({ ...search, fin: e.target.value })}
            />
            <input
              type="number"
              placeholder="Mobil nömrə"
              value={search.phone}
              onChange={(e) => setSearch({ ...search, phone: e.target.value })}
            />
          </div>
          <div className="rightPart">
            <select
              value={search.gender}
              onChange={(e) =>
                setSearch({ ...search, gender: e.target.value })
              }
            >
              <option value="">Cinsiyyət</option>
              <option value="MAN">Kişi</option>
              <option value="WOMAN">Qadın</option>
            </select>
            <select
              value={search.status}
              onChange={(e) =>
                setSearch({ ...search, status: e.target.value })
              }
            >
              <option value="">Status</option>
              <option value="Vip">Vip</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        <div className="tableWrapper">
          <table className="employeeTable">
            <thead>
              <tr>
               <th>1-8</th>
                <th>
                  <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" /> ID
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" /> Pasiyent
                    </span>
                  </div>
                 </th>
                <th>
                  <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" /> Fin Kodu
                    </span>
                  </div>
                  </th>
                <th>
                   <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" />  Cinsiyyət
                    </span>
                  </div>
                 </th>
                <th>
                   <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" />  Mobil nömrə
                    </span>
                  </div>
                  </th>
                <th>
                   <div className="th-content">
                    <span className="!flex !items-center gap-1">
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" />  Qeydiyyat
                    </span>
                  </div>
                </th>
                <th>Status</th>
                <th>Qara siyahı</th>
                <th>Düzəliş</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <PatientRow
                  key={item.id}
                  item={item}
                  onInfoClick={handleInfoClick}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <GoChevronLeft />
          </button>
          {paginationButtons}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <GoChevronRight />
          </button>
        </div>
      </div>
    </>
  );
}

export default PatientsList;
