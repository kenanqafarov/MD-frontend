import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import OrdinaryListHeader from "../../components/OrdinaryList/OrdinaryListHeader";
import "../../assets/style/QueuePage/queuelist.css";
import useReservationStore from "../../../stores/reservationStore";

function QueueList() {
  const [searchName, setSearchName] = useState("");
  const [searchUserName, setSearchUserName] = useState("");
  const [searchSurname, setSearchSurname] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchPatronymic, setSearchPatronymic] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");

  const {
    reservations,
    fetchReservations,
    removeReservation,
    searchReservations,
    changeReservationStatus,
    loading,
    error,
  } = useReservationStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleSearch = async () => {
    const filters = {
      userName: searchUserName,
      patientName: searchName,
      patientSurname: searchSurname,
      mobilePhone: searchPhone,
      doctorName: searchDoctor,
      status: searchStatus,
    };
    await searchReservations(filters);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu rezervasiyanı silmək istədiyinizə əminsiniz?")) {
      await removeReservation(id);
    }
  };

  const handleEdit = (id) => {
    navigate(`/queue/edit-queue/${id}`);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const changeStatusHandler = async (id, newStatus) => {
    try {
      await changeReservationStatus(id, { status: newStatus });
      await fetchReservations();
    } catch (error) {
      alert("Status yenilənərkən xəta baş verdi.");
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const fullName = reservation.patient || "";
    const nameParts = fullName.toLowerCase().split(" ");
    const name = nameParts[0] || "";
    const surname = nameParts.slice(1).join(" ") || "";

    return (
      name.includes(searchName.toLowerCase()) &&
      surname.includes(searchSurname.toLowerCase()) &&
      (reservation.mobilePhone || "").includes(searchPhone) &&
      (reservation.doctor || "")
        .toLowerCase()
        .includes(searchDoctor.toLowerCase()) &&
      (reservation.status || "")
        .toLowerCase()
        .includes(searchStatus.toLowerCase())
    );
  });

  return (
    <div className="queuePageContainer p-4">
      <OrdinaryListHeader
        title="Növbə gözləyənlər"
        addText="Yenisini əlavə et"
        addLink="/queue/add-new"
        exportLink="/queue/export"
      />

      <div className="queueSearchInputs">
        <div className="leftPart -ml-5">
          <input
            type="text"
            placeholder="Ad"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Soyad"
            value={searchSurname}
            onChange={(e) => setSearchSurname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Mobil nömrə"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
          />

          {/* NEW: Doctor Search Input */}
          <input
            type="text"
            placeholder="Həkim"
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
          />

          <CiSearch className="searchBTN" onClick={handleSearch} />
        </div>

        <div className="rightPart">
          <select
            className="workersStatusChecker"
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PASSIVE">Passiv</option>
          </select>
        </div>
      </div>

      <div className="queueListWrapper">
        {loading && <div className="loading-message">Yüklənir...</div>}
        {error && (
          <div className="error-message text-red-500">
            {" "}
            Heç bir nəticə tapılmadı
          </div>
        )}

        <div className="queueListTableWrapper">
          <table className="queueListTable">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />{" "}
                      Pasiyent
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Mobil nömrə
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Həkim
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Başlama tarixi
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Bitmə tarixi
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Başlama saatı
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span className="flex items-center gap-1">
                      <HiArrowsUpDown className="tableArrowIcon !text-sm" />
                      Bitmə saatı
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
                    <span className="-ml-1">Düzəliş</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <div className="queueListAvatarNameWrapper">
                      {reservation.patient}
                    </div>
                  </td>
                  <td>{reservation.mobilePhone}</td>
                  <td>{reservation.doctor}</td>
                  <td>{reservation.startDate}</td>
                  <td>{reservation.endDate}</td>
                  <td>{formatTime(reservation.startTime)}</td>
                  <td>{formatTime(reservation.endTime)}</td>
                  <td>
                    <span
                      className={`queueListStatus ${
                        reservation.status === "ACTIVE" ? "active" : "passive"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        changeStatusHandler(
                          reservation.id,
                          reservation.status === "ACTIVE" ? "PASSIVE" : "ACTIVE"
                        )
                      }>
                      {reservation.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="queueListActionsWrapper">
                      <FiEdit3
                        className="queueListIcon edit"
                        onClick={() => handleEdit(reservation.id)}
                      />
                      <GoTrash
                        className="queueListIcon delete"
                        onClick={() => handleDelete(reservation.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredReservations.length === 0 && (
            <div className="queueListNoResults">Nəticə tapılmadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueList;
