import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWorkersScheduleStore from "../../../stores/workersScheduleStore";
import useCabinetStore from "../../../stores/cabinetStore";

import "../../assets/style/EmployeesPage/employeeworkscheduleadd.css";

import acceptProcess from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelProcess from "../../assets/images/EmployeesPage/cancelProcess.png";

function EmployeeWorkScheduleEdit() {
  const { id } = useParams(); // schedule id
  const navigate = useNavigate();

  const { schedules, updateSchedule, fetchSchedules, removeSchedule } =
    useWorkersScheduleStore();
  const { cabinets, fetchCabinets } = useCabinetStore();

  // Form üçün state-lər
  const [weekDay, setWeekDay] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [userId, setUserId] = useState("");

  const daysOfWeek = [
    { value: "MONDAY", label: "Bazar ertəsi" },
    { value: "TUESDAY", label: "Çərşənbə axşamı" },
    { value: "WEDNESDAY", label: "Çərşənbə" },
    { value: "THURSDAY", label: "Cümə axşamı" },
    { value: "FRIDAY", label: "Cümə" },
    { value: "SATURDAY", label: "Şənbə" },
    { value: "SUNDAY", label: "Bazar" },
  ];

  useEffect(() => {
    fetchCabinets(); // kabinetləri gətir
    if (schedules.length === 0) {
      fetchSchedules();
    } else {
      const sched = schedules.find((s) => s.id.toString() === id);
      if (sched) {
        setWeekDay(sched.weekDay);
        setCabinetName(sched.cabinetName);
        setStartTime(sched.startTime.slice(0, 5));
        setFinishTime(sched.finishTime.slice(0, 5));
        setUserId(sched.userId); // userId-ni təyin et
      }
    }
  }, [id, schedules, fetchSchedules, fetchCabinets]);

  // Form göndərmə funksiyası
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!weekDay || !cabinetName) {
      alert("Zəhmət olmasa, bütün * işarəli xanaları doldurun.");
      return;
    }

    const updatedData = {
      id: Number(id), // Əgər id UUID-dirsə sadəcə `id`
      weekDay,
      cabinetName,
      startTime: startTime + ":00",
      finishTime: finishTime + ":00",
    };

    updateSchedule(updatedData);
    navigate(`/employees/work-schedule/${userId}`);
  };

  // Silmə funksiyası
  const handleDelete = () => {
    if (window.confirm("Qrafiki silmək istədiyinizə əminsiniz?")) {
      removeSchedule(Number(id));
      navigate(`/employees/work-schedule/${userId}`);
    }
  };

  return (
    <div className="employeeWorkScheduleAddContainer">
      <form className="employeeWorkScheduleAdd" onSubmit={handleSubmit}>
        <div className="employeeWorkScheduleAddWrapper">
          {/* Həftənin günü */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Həftənin günü <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              value={weekDay}
              onChange={(e) => setWeekDay(e.target.value)}
              required
            >
              <option value="">Seçin</option>
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kabinet */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Kabinet <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              value={cabinetName}
              onChange={(e) => setCabinetName(e.target.value)}
              required
            >
              <option value="">Seçin</option>
              {cabinets.map((c) => (
                <option
                  key={c.id || c.value}
                  value={c.name || c.cabinetName || c.value}
                >
                  {c.name || c.cabinetName || c.value}
                </option>
              ))}
            </select>
          </div>

          {/* Başlama və bitmə saatı */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Başlama saatı</p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Bitmə saatı</p>
            <input
              type="time"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="employeeWorkScheduleAddActionsButtons"
          style={{ display: "flex", gap: "1rem" }}
        >
          <button
            type="button"
            className="employeeAddCancelProcess"
            onClick={() => navigate(`/employees/work-schedule/${userId}`)}
          >
            <img src={cancelProcess} alt="İmtina et" />
            İmtina et
          </button>

          <button type="submit" className="employeeAddAcceptProcess">
            <img src={acceptProcess} alt="Yadda saxla" />
            Yadda saxla
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Qrafiki Sil
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeWorkScheduleEdit;
