import React, { useState, useRef, useEffect } from "react";
import "../../assets/style/QueuePage/addqueue.css";
import CustomDropdown from "../../components/CustomDropdown";
import acceptForm from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelForm from "../../assets/images/EmployeesPage/cancelProcess.png";
import { RiUserForbidLine } from "react-icons/ri";
import usePatientStore from "../../../stores/patiendStore";
import useCalendarStore from "../../../stores/calendarStore";
import useReservationStore from "../../../stores/reservationStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./quee.css";

function AddQueue() {
  const navigator = useNavigate();
  const { patients, fetchPatients } = usePatientStore();
  const { doctors, fetchDoctors } = useCalendarStore();
  const { addReservation } = useReservationStore();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");
  const [timeValidationError, setTimeValidationError] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const daysDropdownRef = useRef(null);

  const minYear = 1800;
  const maxYear = 3000;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchPatients(), fetchDoctors()]);
      } catch (err) {
        toast.error("Məlumatlar yüklənərkən xəta baş verdi.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPatients, fetchDoctors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        daysDropdownRef.current &&
        !daysDropdownRef.current.contains(event.target)
      ) {
        setIsDaysDropdownOpen(false);
      }
    };

    if (isDaysDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDaysDropdownOpen]);

  const formattedPatients = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.name} ${patient.surname} (${patient.finCode})`,
    labelText: `${patient.name} ${patient.surname} (${patient.finCode})`,
    icon: patient.isBlocked ? (
      <RiUserForbidLine
        style={{ color: "red", fontSize: "18px", marginLeft: "auto" }}
      />
    ) : null,
  }));

  const formattedDoctors = doctors.map((doctor) => ({
    value: doctor.doctorId,
    label: `${doctor.name} ${doctor.surname} (${doctor.username})`,
    labelText: `${doctor.name} ${doctor.surname} (${doctor.username})`,
  }));

  const weekDayOptions = [
    { value: "MONDAY", label: "Bazar ertəsi" },
    { value: "TUESDAY", label: "Çərşənbə axşamı" },
    { value: "WEDNESDAY", label: "Çərşənbə" },
    { value: "THURSDAY", label: "Cümə axşamı" },
    { value: "FRIDAY", label: "Cümə" },
    { value: "SATURDAY", label: "Şənbə" },
    { value: "SUNDAY", label: "Bazar" },
  ];

  const handlePatientChange = (option) => {
    setSelectedPatient(option);
  };

  const handleDoctorChange = (option) => {
    setSelectedDoctor(option);
  };

  const handleDaySelect = (day) => {
    const isSelected = selectedDays.some((d) => d.value === day.value);
    if (isSelected) {
      setSelectedDays(selectedDays.filter((d) => d.value !== day.value));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const formatTime = (t) => {
    return t && t.length === 5 ? `${t}:00` : "00:00:00";
  };

  const validateDates = (startDate, endDate) => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    if (
      startYear < minYear ||
      startYear > maxYear ||
      endYear < minYear ||
      endYear > maxYear
    ) {
      setDateValidationError(
        `Tarix ${minYear} və ${maxYear} illəri arasında olmalıdır.`
      );
      return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setDateValidationError(
        "Bitmə tarixi başlama tarixindən əvvələ ola bilməz"
      );
      return false;
    }

    setDateValidationError("");
    return true;
  };

  const validateTimes = (startTime, endTime) => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      if (start >= end) {
        setTimeValidationError(
          "Bitmə vaxtı başlama vaxtından əvvələ ola bilməz"
        );
        return false;
      }
    }

    setTimeValidationError("");
    return true;
  };

  const handleDateChange = () => {
    const startDate = startDateRef.current?.value;
    const endDate = endDateRef.current?.value;

    if (startDate && endDate) {
      validateDates(startDate, endDate);
    }
  };

  const handleTimeChange = () => {
    const startTime = formatTime(startTimeRef.current?.value);
    const endTime = formatTime(endTimeRef.current?.value);

    if (startTime && endTime) {
      validateTimes(startTime, endTime);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor || selectedDays.length === 0) {
      toast.error("Zəhmət olmasa bütün məlumatları doldurun.");
      return;
    }

    const startDate = startDateRef.current.value;
    const endDate = endDateRef.current.value;
    const startTime = formatTime(startTimeRef.current.value);
    const endTime = formatTime(endTimeRef.current.value);

    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Zəhmət olmasa tarix və saatları doldurun.");
      return;
    }

    const isDatesValid = validateDates(startDate, endDate);
    const isTimesValid = validateTimes(startTime, endTime);

    if (!isDatesValid || !isTimesValid) {
      return;
    }

    const payload = {
      startDate,
      endDate,
      startTime,
      endTime,
      doctorId: selectedDoctor.value,
      patientId: selectedPatient.value,
      weekDays: selectedDays.map((day) => day.value.toUpperCase()),
    };

    try {
      setLoading(true);
      await addReservation(payload);

      // Reset form
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setSelectedDays([]);
      startDateRef.current.value = "";
      endDateRef.current.value = "";
      startTimeRef.current.value = "";
      endTimeRef.current.value = "";
      setDateValidationError("");
      setTimeValidationError("");

      toast.success("Rezervasiya uğurla yaradıldı!");
      navigator("/queue");
    } catch (err) {
      console.error("❌ Xəta:", err.response?.data || err.message);

      // Backend validasiya xətalarını əldə et
      if (err.response?.data) {
        const errorData = err.response.data;

        if (
          errorData.validDateRange ===
          "Bitmə tarixi başlama tarixindən əvvələ ola bilməz"
        ) {
          setDateValidationError(
            "Bitmə tarixi başlama tarixindən əvvələ ola bilməz"
          );
        }

        if (
          errorData.validTimeRange ===
          "Bitmə vaxtı başlama vaxtından əvvələ ola bilməz"
        ) {
          setTimeValidationError(
            "Bitmə vaxtı başlama vaxtından əvvələ ola bilməz"
          );
        }

        if (!errorData.validDateRange && !errorData.validTimeRange) {
          toast.error("Rezervasiya zamanı xəta baş verdi.");
        }
      } else {
        toast.error("Rezervasiya zamanı xəta baş verdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setSelectedDays([]);
    setDateValidationError("");
    setTimeValidationError("");
    if (startDateRef.current) startDateRef.current.value = "";
    if (endDateRef.current) endDateRef.current.value = "";
    if (startTimeRef.current) startTimeRef.current.value = "";
    if (endTimeRef.current) endTimeRef.current.value = "";
    navigator("/queue");
  };

  const removePill = (e, day) => {
    e.stopPropagation();
    setSelectedDays(selectedDays.filter((d) => d.value !== day.value));
  };

  return (
    <div className="addQueuePageContainer">
      <div className="addQueuePageWrapper">
        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Pasiyent<span>*</span>
            </p>
            <CustomDropdown
              options={formattedPatients}
              onChange={handlePatientChange}
              placeholder="Pasiyent seçin"
              value={selectedPatient}
            />
          </div>

          <div className="queuePageWrapperInput">
            <p>
              Həkim<span>*</span>
            </p>
            <CustomDropdown
              options={formattedDoctors}
              onChange={handleDoctorChange}
              placeholder="Həkim seçin"
              value={selectedDoctor}
            />
          </div>
        </div>

        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Başlama tarixi<span>*</span>
            </p>
            <input
              className="addQueueBasicInput"
              type="date"
              ref={startDateRef}
              onChange={handleDateChange}
              required
            />
          </div>
          <div className="queuePageWrapperInput">
            <p>
              Bitmə tarixi<span>*</span>
            </p>
            <input
              className="addQueueBasicInput"
              type="date"
              ref={endDateRef}
              onChange={handleDateChange}
              required
            />
          </div>
        </div>
        {dateValidationError && (
          <div className="validation-error-container">
            <span className="validation-error-icon">� </span>
            <span className="validation-error-message">
              {dateValidationError}
            </span>
          </div>
        )}

        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Başlama saatı<span>*</span>
            </p>
            <input
              className="addQueueBasicInput"
              type="time"
              ref={startTimeRef}
              onChange={handleTimeChange}
              required
            />
          </div>
          <div className="queuePageWrapperInput">
            <p>
              Bitmə saatı<span>*</span>
            </p>
            <input
              className="addQueueBasicInput"
              type="time"
              ref={endTimeRef}
              onChange={handleTimeChange}
              required
            />
          </div>
        </div>
        {timeValidationError && (
          <div className="validation-error-container">
            <span className="validation-error-icon">� </span>
            <span className="validation-error-message">
              {timeValidationError}
            </span>
          </div>
        )}

        <div className="queuePageWrapperInputWeek">
          <p>
            Həftənin günləri<span>*</span>
          </p>
          <div className="dropdown-checklist" ref={daysDropdownRef}>
            <div
              className="checklist-header"
              onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}>
              <div className="selected-pills-container">
                {selectedDays.length > 0 ? (
                  selectedDays.map((day) => (
                    <span key={day.value} className="selected-item">
                      {day.label}
                      <span
                        className="remove-item"
                        onClick={(e) => removePill(e, day)}>
                        &times;
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="placeholder-text">Gün seçin</span>
                )}
              </div>
              <span
                className={`checklist-arrow ${
                  isDaysDropdownOpen ? "open" : ""
                }`}>
                <svg
                  className="arrow-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            {isDaysDropdownOpen && (
              <div className="dropdown-list-wrapper">
                <ul className="dropdown-list">
                  {weekDayOptions.map((day) => (
                    <li
                      key={day.value}
                      className="dropdown-item"
                      onClick={() => handleDaySelect(day)}>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedDays.some(
                            (d) => d.value === day.value
                          )}
                          onChange={() => {}}
                        />
                        <span>{day.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="addQueuePageAcceptOrDeny">
        <button className="cancelAddQueue" onClick={handleCancel}>
          <img src={cancelForm} alt="cancel" />
          İmtina et
        </button>
        <button
          className="acceptAddQueue"
          onClick={handleSubmit}
          disabled={loading}>
          <img src={acceptForm} alt="save" />
          {loading ? "Yüklənir..." : "Yadda saxla"}
        </button>
      </div>
    </div>
  );
}

export default AddQueue;
