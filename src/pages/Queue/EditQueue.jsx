"use client";

import { useState, useRef, useEffect } from "react";
import "../../assets/style/QueuePage/editqueue.css";
import CustomDropdown from "../../components/CustomDropdown";
import DropdownMenuChecklist from "../../components/DropdownChecklist";
import acceptForm from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelForm from "../../assets/images/EmployeesPage/cancelProcess.png";
import { RiUserForbidLine } from "react-icons/ri";
import { useParams, useNavigate } from "react-router-dom";
import useReservationStore from "../../../stores/reservationStore";
import usePatientStore from "../../../stores/patiendStore";
import useCalendarStore from "../../../stores/calendarStore";

function EditQueue() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    fetchReservationById,
    selectedReservation,
    editReservation,
    loading,
    error: reservationError,
  } = useReservationStore();
  const { patients, fetchPatients, error: patientsError } = usePatientStore();
  const { doctors, fetchDoctors, error: doctorsError } = useCalendarStore();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [localError, setLocalError] = useState(null);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Load data on mount or id change
  useEffect(() => {
    setLocalError(null);
    fetchReservationById(id);
    fetchPatients();
    fetchDoctors();
  }, [id]);

  // Helper function to format time string for input (HH:mm:ss -> HH:mm)
  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return "";
    // If it's already in HH:mm format, return as is
    if (timeStr.length === 5) return timeStr;
    // If it's in HH:mm:ss format, take first 5 characters
    if (timeStr.length >= 5) return timeStr.substring(0, 5);
    return timeStr;
  };

  // Helper function to find patient by name
  const findPatientByName = (patientName) => {
    if (!patientName || !patients.length) return null;

    return patients.find((patient) => {
      const fullName = `${patient.name} ${patient.surname}`.trim();
      return fullName === patientName.trim();
    });
  };

  // Helper function to find doctor by name
  const findDoctorByName = (doctorName) => {
    if (!doctorName || !doctors.length) return null;

    return doctors.find((doctor) => {
      const fullName = `${doctor.name} ${doctor.surname}`.trim();
      return fullName === doctorName.trim();
    });
  };

  // When data loaded, fill the form fields
  useEffect(() => {
    if (selectedReservation && patients.length && doctors.length) {
      // Find patient by name
      const patient = findPatientByName(selectedReservation.patient);

      if (patient) {
        setSelectedPatient({
          value: patient.id,
          label: `${patient.name} ${patient.surname} (${patient.finCode})`,
        });
      } else {
        console.log("Patient not found for name:", selectedReservation.patient);
        setSelectedPatient(null);
      }

      // Find doctor by name
      const doctor = findDoctorByName(selectedReservation.doctor);

      if (doctor) {
        setSelectedDoctor({
          value: doctor.doctorId,
          label: `${doctor.name} ${doctor.surname} (${doctor.username})`,
        });
      } else {
        console.log("Doctor not found for name:", selectedReservation.doctor);
        setSelectedDoctor(null);
      }

      // Handle dates
      if (startDateRef.current) {
        startDateRef.current.value = selectedReservation.startDate || "";
      }
      if (endDateRef.current) {
        endDateRef.current.value = selectedReservation.endDate || "";
      }

      // Handle times - convert from "HH:mm:ss" to "HH:mm"
      if (startTimeRef.current) {
        startTimeRef.current.value = formatTimeForInput(
          selectedReservation.startTime
        );
      }
      if (endTimeRef.current) {
        endTimeRef.current.value = formatTimeForInput(
          selectedReservation.endTime
        );
      }

      // Initialize weekDays - since API doesn't return weekDays, set empty or default
      setSelectedDays(selectedReservation.weekDays || []);
    }
  }, [selectedReservation, patients, doctors]);

  const formattedPatients = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.name} ${patient.surname} (${patient.finCode})`,
    labelText: `${patient.name} ${patient.surname} (${patient.finCode})`,
    icon: patient.isBlocked ? (
      <RiUserForbidLine
        style={{ color: "red", fontSize: 18, marginLeft: "auto" }}
      />
    ) : null,
  }));

  const formattedDoctors = doctors.map((doctor) => ({
    value: doctor.doctorId,
    label: `${doctor.name} ${doctor.surname} (${doctor.username})`,
    labelText: `${doctor.name} ${doctor.surname} (${doctor.username})`,
  }));

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor || selectedDays.length === 0) {
      setLocalError("Zəhmət olmasa bütün məlumatları doldurun.");
      return;
    }

    if (
      !startDateRef.current.value ||
      !endDateRef.current.value ||
      !startTimeRef.current.value ||
      !endTimeRef.current.value
    ) {
      setLocalError("Zəhmət olmasa tarix və saatları doldurun.");
      return;
    }

    setLocalError(null);

    const formatTimeForApi = (timeStr) => {
      return timeStr ? `${timeStr}:00` : "";
    };

    const updatedData = {
      id: Number(id),
      startDate: startDateRef.current.value,
      endDate: endDateRef.current.value,
      startTime: formatTimeForApi(startTimeRef.current.value),
      endTime: formatTimeForApi(endTimeRef.current.value),
      doctorId: selectedDoctor.value,
      patientId: selectedPatient.value,
      weekDays: selectedDays.map((day) =>
        typeof day === "string" ? day : day.value
      ),
    };

    try {
      const updatedReservation = await editReservation(id, updatedData);
      alert("Rezervasiya uğurla yeniləndi!");
      // Instead of navigating away, you might want to stay on the page
      // or navigate to a different view
      navigate("/queue");
    } catch (err) {
      console.error("Update error:", err);
      setLocalError(err.message || "Yeniləmə zamanı xəta baş verdi.");
    }
  };

  if (loading) return <div className="loading-message">Yüklənir...</div>;

  const displayError =
    reservationError || patientsError || doctorsError || localError;

  return (
    <div className="editQueuePageContainer">
      <div className="editQueuePageWrapper">
        {displayError && <div className="error-message">{displayError}</div>}

        {/* Debug information - remove in production */}
        {/* <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            margin: "10px 0",
            fontSize: "12px",
          }}>
          <strong>Debug Info:</strong>
          <div>Loading: {loading ? "Yes" : "No"}</div>
          <div>
            Selected Reservation:{" "}
            {selectedReservation ? "Loaded" : "Not loaded"}
          </div>
          <div>Patients Count: {patients.length}</div>
          <div>Doctors Count: {doctors.length}</div>
          {selectedReservation && (
            <div>
              <div>Patient Name from API: "{selectedReservation.patient}"</div>
              <div>Doctor Name from API: "{selectedReservation.doctor}"</div>
              <div>
                Selected Patient:{" "}
                {selectedPatient ? selectedPatient.label : "None"}
              </div>
              <div>
                Selected Doctor:{" "}
                {selectedDoctor ? selectedDoctor.label : "None"}
              </div>
            </div>
          )}
        </div> */}

        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Pasiyent<span>*</span>
            </p>
            <CustomDropdown
              options={formattedPatients}
              onChange={setSelectedPatient}
              value={selectedPatient}
              placeholder="Pasiyent seçin"
            />
          </div>
          <div className="queuePageWrapperInput">
            <p>
              Həkim<span>*</span>
            </p>
            <CustomDropdown
              options={formattedDoctors}
              onChange={setSelectedDoctor}
              value={selectedDoctor}
              placeholder="Həkim seçin"
            />
          </div>
        </div>

        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Başlama tarixi<span>*</span>
            </p>
            <input
              className="editQueueBasicInput"
              type="date"
              ref={startDateRef}
              required
            />
          </div>
          <div className="queuePageWrapperInput">
            <p>
              Bitmə tarixi<span>*</span>
            </p>
            <input
              className="editQueueBasicInput"
              type="date"
              ref={endDateRef}
              required
            />
          </div>
        </div>

        <div className="queuePageWrapperInputRow">
          <div className="queuePageWrapperInput">
            <p>
              Başlama saatı<span>*</span>
            </p>
            <input
              className="editQueueBasicInput"
              type="time"
              ref={startTimeRef}
              required
            />
          </div>
          <div className="queuePageWrapperInput">
            <p>
              Bitmə saatı<span>*</span>
            </p>
            <input
              className="editQueueBasicInput"
              type="time"
              ref={endTimeRef}
              required
            />
          </div>
        </div>

        <div className="queuePageWrapperInputWeek">
          <p>
            Həftənin günləri<span>*</span>
          </p>
          <DropdownMenuChecklist
            onSelect={setSelectedDays}
            value={selectedDays}
            placeholder="Gün seçin"
            options={[
              { value: "MONDAY", label: "Bazar ertəsi" },
              { value: "TUESDAY", label: "Çərşənbə axşamı" },
              { value: "WEDNESDAY", label: "Çərşənbə" },
              { value: "THURSDAY", label: "Cümə axşamı" },
              { value: "FRIDAY", label: "Cümə" },
              { value: "SATURDAY", label: "Şənbə" },
              { value: "SUNDAY", label: "Bazar" },
            ]}
          />
        </div>
      </div>

      <div className="editQueuePageAcceptOrDeny">
        <button
          className="canceleditQueue"
          onClick={() => navigate(-1)}
          disabled={loading}>
          <img src={cancelForm || "/placeholder.svg"} alt="cancel" />
          İmtina et
        </button>
        <button
          className="accepteditQueue"
          onClick={handleSubmit}
          disabled={loading}>
          <img src={acceptForm || "/placeholder.svg"} alt="save" />
          {loading ? "Yenilənir..." : "Yadda saxla"}
        </button>
      </div>
    </div>
  );
}

export default EditQueue;
