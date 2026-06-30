import React, { useEffect, useState, useMemo, useCallback } from "react";
import OrdinaryListHeader from "../../components/OrdinaryList/OrdinaryListHeader";
import { CiSearch, CiCircleInfo, CiCalendar } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import "../../assets/style/EmployeesPage/employeespage.css";
import useEmployeeStore from "../../../stores/workerStore";
import { useNavigate, Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import "./EmployeList.css";

const EmployeesList = () => {
  // Zustand selector optimization - sadece ihtiyaç duyulan state'leri al
  const workers = useEmployeeStore(state => state.workers);
  const searchResult = useEmployeeStore(state => state.searchResult);
  const loading = useEmployeeStore(state => state.loading);
  const permissions = useEmployeeStore(state => state.permissions);
  const fetchWorkers = useEmployeeStore(state => state.fetchWorkers);
  const searchWorkers = useEmployeeStore(state => state.searchWorkers);
  const removeWorker = useEmployeeStore(state => state.removeWorker);
  const setSearchResult = useEmployeeStore(state => state.setSearchResult);
  const fetchByPermission = useEmployeeStore(state => state.fetchByPermission);
  const fetchPermissions = useEmployeeStore(state => state.fetchPermissions);

  const [searchParams, setSearchParams] = useState({
    username: "",
    name: "",
    surname: "",
    patronymic: "",
    phone: "",
    enabled: "",
  });

  const [selectedPermission, setSelectedPermission] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigation = useNavigate();
  
  // Debounce search params
  const debouncedSearchParams = useDebounce(searchParams, 300);

  useEffect(() => {
    fetchWorkers();
    fetchPermissions();
  }, [fetchWorkers, fetchPermissions]);

  useEffect(() => {
    if (
      workers.length > 0 &&
      searchResult.length === 0 &&
      Object.values(searchParams).every(
        (val) => val === "" || val === undefined
      )
    ) {
      setSearchResult(workers);
    }
  }, [workers, searchResult, setSearchResult, searchParams]);

  const getStatus = (emp) => (emp.enabled ? "Aktiv" : "Passiv");

  const handlePermissionChange = async (e) => {
    const perm = e.target.value;
    setSelectedPermission(perm);

    if (perm === "") {
      setSearchResult(workers);
    } else {
      await fetchByPermission(perm);
      setCurrentPage(1);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    // Reset other search parameters if a specific one is being typed
    if (name !== 'enabled' && selectedPermission) {
      setSelectedPermission("");
    }
  }, [selectedPermission]);
  
  const handleSearch = useCallback(async (currentParams) => {
    try {
      const allSearchParamsEmpty = Object.values(currentParams).every(
        (val) => val === "" || val === undefined
      );

      if (allSearchParamsEmpty && !selectedPermission) {
        await fetchWorkers();
        const updatedWorkers = useEmployeeStore.getState().workers;
        setSearchResult(updatedWorkers);
        setCurrentPage(1);
        return;
      }
      
      const enabledBoolean =
        currentParams.enabled === "true"
          ? true
          : currentParams.enabled === "false"
          ? false
          : undefined;

      await searchWorkers({
        username: currentParams.username || undefined,
        name: currentParams.name || undefined,
        surname: currentParams.surname || undefined,
        patronymic: currentParams.patronymic || undefined,
        phone: currentParams.phone || undefined,
        enabled: enabledBoolean,
      });

      setCurrentPage(1);
    } catch (error) {
      console.error("Axtarış xətası:", error);
      alert("Axtarış zamanı xəta baş verdi");
    }
  }, [selectedPermission, fetchWorkers, searchWorkers, setSearchResult]);
  
  // Debounced search effect
  useEffect(() => {
    handleSearch(debouncedSearchParams);
  }, [debouncedSearchParams, handleSearch]);
  

  // Memoized icons with handlers
  const handleInfoClick = useCallback((row) => {
    navigation(`employee/${row.id}`);
  }, [navigation]);

  const handleEditClick = useCallback((row) => {
    navigation(`edit-employee/${row.id}`);
  }, [navigation]);

  const handleDeleteClick = useCallback(async (row) => {
    const confirmDelete = window.confirm(
      `İşçini silmək istədiyinizə əminsiniz? (${row.username})`
    );
    if (confirmDelete) {
      try {
        await removeWorker(row.id);
        alert("İşçi uğurla silindi!");

        const allSearchParamsEmpty = Object.values(searchParams).every(
          (val) => val === "" || val === undefined
        );

        if (allSearchParamsEmpty) {
          await fetchWorkers();
          const updatedWorkers = useEmployeeStore.getState().workers;
          setSearchResult(updatedWorkers);
        } else {
          handleSearch(searchParams);
        }
      } catch (err) {
        alert("Silinmə zamanı xəta baş verdi.");
      }
    }
  }, [removeWorker, searchParams, fetchWorkers, setSearchResult, handleSearch]);

  const icons = useMemo(() => [
    {
      icon: CiCircleInfo,
      action: handleInfoClick,
      className: "info",
    },
    {
      icon: FiEdit3,
      action: handleEditClick,
      className: "edit",
    },
    {
      icon: GoTrash,
      action: handleDeleteClick,
      className: "delete",
    },
  ], [handleInfoClick, handleEditClick, handleDeleteClick]);

  // Memoized pagination
  const totalPages = useMemo(() => {
    return Math.ceil(searchResult.length / itemsPerPage);
  }, [searchResult.length, itemsPerPage]);

  const currentEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return searchResult.slice(indexOfFirstItem, indexOfLastItem);
  }, [searchResult, currentPage, itemsPerPage]);

  // Memoized pagination buttons
  const paginationButtons = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        className={`pagination-button ${
          currentPage === i + 1 ? "active" : ""
        }`}
        onClick={() => setCurrentPage(i + 1)}>
        {i + 1}
      </button>
    ));
  }, [totalPages, currentPage]);

  return (
    <div className="employeesListWrapper">
      <OrdinaryListHeader
        title="İşçilərin Siyahısı"
        addText="Yenisini əlavə et"
        addLink="/employees/employee-add"
        exportLink="/employees/export"
      />

      <div className="patientsListSearch">
        <div className="leftPart">
          <input
            name="username"
            placeholder="İstifadəçi adı"
            value={searchParams.username}
            onChange={handleInputChange}
            className="ml-3 w-40 border-1 border-gray-400 rounded-md pl-3 h-8"
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchParams)}
          />
          <input
            name="name"
            placeholder="Ad"
            value={searchParams.name}
            onChange={handleInputChange}
            className="ml-2 w-40 border-1 border-gray-400 rounded-md pl-3 h-8"
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchParams)}
          />
          <input
            name="surname"
            placeholder="Soyad"
            value={searchParams.surname}
            onChange={handleInputChange}
            className="ml-2 w-40 border-1 border-gray-400 rounded-md pl-3 h-8"
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchParams)}
          />
          <input
            name="patronymic"
            placeholder="Ata adı"
            value={searchParams.patronymic}
            onChange={handleInputChange}
            className="ml-2 w-40 border-1 border-gray-400 rounded-md pl-3 h-8"
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchParams)}
          />
          <input
            name="phone"
            placeholder="Telefon"
            value={searchParams.phone}
            onChange={handleInputChange}
            className="ml-2 w-40 border-1 border-gray-400 rounded-md pl-3 h-8"
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchParams)}
          />
          <button className="cursor-pointer" onClick={() => handleSearch(searchParams)}>
            <CiSearch className="searchBTN ml-10 font-semibold" />
          </button>

          {/* <div className="rightPart"> */}
          {/* <select value={selectedPermission} onChange={handlePermissionChange} >
            <option value="">Hamısı</option>
            {permissions.map((perm) => (
              <option key={perm.id} value={perm.permissionName}>
                {perm.permissionName}
              </option>
            ))}
          </select> */}

          <select
            className="workersStatusChecker ml-20 w-40 border-1 border-gray-400 h-8 rounded-md pl-2 text-gray-400"
            name="enabled"
            value={searchParams.enabled}
            onChange={handleInputChange}>
            <option value="">Hamısı</option>
            <option value="true">Aktiv</option>
            <option value="false">Passiv</option>
          </select>
        {/* </div> */}
          
        </div>

      </div>

      <div className="employeesTableWrapper">
        {loading ? (
          <div className="flex-col gap-4 w-full flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
              <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            <table className="employeesTable">
              <thead>
                <tr>
                  <th className="w-37">
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon ml-7 !text-sm"/> İstifadəçi adı
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon !text-sm" /> Ad
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon -ml-6 !text-sm" /> Soyad
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon -ml-10 !text-sm"/> Ata adı
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon !text-sm -ml-14"/> Telefon
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <HiArrowsUpDown className="tableArrowIcon !text-sm -ml-1 "/> İcazələr
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>
                        <CiCalendar className="tableArrowIcon !text-sm"/> İş qrafiki
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span className="-ml-1">Status</span>
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span className="-ml-12">Düzəliş</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="!text-left">
                {currentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="!text-left !pl-7">{emp.username}</td>
                    <td className="!text-left !pl-12">{emp.name}</td>
                    <td className="!text-left !pl-6">{emp.surname}</td>
                    <td className="!text-left !pl-3">{emp.patronymic}</td>
                    <td className="!text-left !pl-1">{emp.phone}</td>
                    <td className="!text-left !pl-7">{emp.permissions?.join(", ")}</td>
                    <td>
                      <Link
                        className="employeeScheduleTableData"
                        to={`work-schedule/${emp.id}`}>
                        <CiCalendar className="employeeScheduleTableDataIcon" />{" "}
                        İş qrafiki
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          emp.enabled ? "active" : "passive"
                        }`}>
                        {getStatus(emp)}
                      </span>
                    </td>
                    <td>
                      <div className="icons flex gap-3 cursor-pointer">
                        {icons.map((iconObj, idx) => {
                          const IconComponent = iconObj.icon;
                          return (
                            <IconComponent
                              key={idx}
                              className={iconObj.className}
                              onClick={() => iconObj.action(emp)}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {paginationButtons}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeesList;