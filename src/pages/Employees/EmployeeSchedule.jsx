"use client";

import { useState, useEffect, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import "./EmployeeSchedule.css";

// Həftə günləri və qısa adlar
const weekDays = [
  { key: "MONDAY", label: "B.e" },
  { key: "TUESDAY", label: "Ç.a" },
  { key: "WEDNESDAY", label: "Ç." },
  { key: "THURSDAY", label: "C.a" },
  { key: "FRIDAY", label: "C." },
  { key: "SATURDAY", label: "Ş." },
  { key: "SUNDAY", label: "B." },
];

const azMonths = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

// Saatı formatlamaq üçün funksiya
function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

// Həftənin bazar ertəsini tap
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Həftənin bütün günlərini qaytar
function getWeekDates(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Rəng seçimi üçün funksiya
const blockColors = ["blue", "green", "pink", "red"];
function getBlockColor(idx) {
  return blockColors[idx % blockColors.length];
}

// Generate 30-minute time intervals between two times
function generateTimeIntervals(startTime, endTime) {
  const intervals = [];
  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);

  let hour = start[0];
  let minute = start[1];

  while (hour < end[0] || (hour === end[0] && minute < end[1])) {
    intervals.push({
      hour,
      minute,
      timeStr: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`,
    });

    minute += 30;
    if (minute >= 60) {
      hour += 1;
      minute -= 60;
    }
  }

  return intervals;
}

// Get number of 30-min intervals between two times
function getIntervalCount(startTime, endTime) {
  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  const minutes = endMinutes - startMinutes;
  return Math.ceil(minutes / 30);
}

const EmployeeSchedule = () => {
  // Həftənin başlanğıc günü
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Select values
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Həftənin günləri və tarixləri
  const weekDates = getWeekDates(weekStart);
  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
  const monthName = azMonths[weekStart.getMonth()];
  const rangeStr = `${weekDates[0].getDate()} ${monthName} - ${weekDates[6].getDate()} ${
    azMonths[weekDates[6].getMonth()]
  }`;

  // API-dan məlumatları yüklə
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
        const [employeesResponse, schedulesResponse, roomsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/add-worker/read`, {
              headers,
            }),
            fetch(
              `${API_BASE_URL}/workers-work-schedule/read`,
              { headers }
            ),
            fetch(
              `${API_BASE_URL}/general-calendar/read-rooms`,
              { headers }
            ),
          ]);

        if (!employeesResponse.ok)
          throw new Error(
            `Failed to fetch employees: ${employeesResponse.status}`
          );
        if (!schedulesResponse.ok)
          throw new Error(
            `Failed to fetch schedules: ${schedulesResponse.status}`
          );
        if (!roomsResponse.ok)
          throw new Error(`Failed to fetch rooms: ${roomsResponse.status}`);

        const employeesData = await employeesResponse.json();
        const schedulesData = await schedulesResponse.json();
        const roomsData = await roomsResponse.json();

        setEmployees(employeesData);
        setSchedules(schedulesData);
        setRooms(roomsData);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(getMonday(prev));
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(getMonday(next));
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedEmployee("");
    setSelectedRoom("");
  };

  function getScheduleForEmployeeAndDay(userId, weekDay) {
    return schedules.find(
      (s) =>
        s.userId === userId &&
        s.weekDay === weekDay &&
        (!selectedRoom || s.cabinetName === selectedRoom)
    );
  }

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (selectedEmployee) {
      result = result.filter((e) => e.id === selectedEmployee);
    } else if (selectedRoom) {
      const employeeIdsWithRoom = new Set(
        schedules
          .filter((s) => s.cabinetName === selectedRoom)
          .map((s) => s.userId)
      );
      result = result.filter((e) => employeeIdsWithRoom.has(e.id));
    }
    return result;
  }, [employees, schedules, selectedEmployee, selectedRoom]);

  const showDetailedView = useMemo(
    () => selectedEmployee || selectedRoom,
    [selectedEmployee, selectedRoom]
  );

  if (error) {
    return (
      <div className="schedule-out">
        <div style={{ textAlign: "center", padding: "40px 0", color: "red" }}>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#155EEF",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
            Yenidən yüklə
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employeeScheduleContainer">
      <div className="schedule-out">
        <div className="schedule-header">
          <div className="search-and-selects">
            <select
              className="ews-filter-select"
              value={selectedEmployee}
              onChange={handleEmployeeChange}>
              <option value="">İşçi seç</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.surname}
                </option>
              ))}
            </select>
            <select
              className="ews-filter-select"
              style={{ marginLeft: 8 }}
              value={selectedRoom}
              onChange={handleRoomChange}>
              <option value="">Otaq</option>
              {rooms.map((room) => (
                <option key={room.cabinetName} value={room.cabinetName}>
                  {room.cabinetName}
                </option>
              ))}
            </select>
            <button className="ews-filter-btn" onClick={handleClearFilters}>
              <FiX className="ews-filter-btn-icon" />
            </button>
          </div>
          <div className="date-and-navigation">
            <div className="date-display">
              <div className="current-month">
                {monthName} {weekStart.getFullYear()}
              </div>
              <div className="date-range">{rangeStr}</div>
            </div>
            <div className="navigation-controls">
              <button className="nav-button" onClick={handlePrevWeek}>
                <FiChevronLeft />
              </button>
              <button className="nav-button" onClick={handleNextWeek}>
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span
              className="spinner"
              style={{
                display: "inline-block",
                width: 32,
                height: 32,
                border: "4px solid #e0e0e0",
                borderTop: "4px solid #155EEF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: "16px", color: "#666" }}>
              Məlumatlar yüklənir...
            </p>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="ews-table">
              <thead>
                <tr>
                  <th
                    className="text-left"
                    style={{ width: showDetailedView ? "auto" : "120px" }}>
                    {showDetailedView ? "Ad, soyad" : "Ad, soyad"}
                  </th>
                  {weekDates.map((d, i) => {
                    const isToday = isSameDay(weekDates[i], today);
                    return (
                      <th
                        key={i}
                        className={`dateContainerTH ${
                          isToday ? "current-day-header" : ""
                        }`}>
                        <div
                          className={
                            isToday ? "day-name current-day-name" : "day-name"
                          }>
                          {weekDays[i].label}
                        </div>
                        <div
                          className={
                            isToday ? "day-date current-day-date" : "day-date"
                          }>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {showDetailedView
                  ? filteredEmployees.map((emp, empIdx) => {
                      let minHour = 9,
                        maxHour = 18;
                      weekDays.forEach((d) => {
                        const sched = getScheduleForEmployeeAndDay(
                          emp.id,
                          d.key
                        );
                        if (sched) {
                          const startHour = Number.parseInt(
                            sched.startTime.split(":")[0]
                          );
                          const endHour = Number.parseInt(
                            sched.finishTime.split(":")[0]
                          );
                          minHour = Math.min(minHour, startHour);
                          maxHour = Math.max(maxHour, endHour);
                        }
                      });

                      const intervals = generateTimeIntervals(
                        `${String(minHour).padStart(2, "0")}:00`,
                        `${String(maxHour + 1).padStart(2, "0")}:00`
                      );

                      const empSchedules = weekDays.map((d) =>
                        getScheduleForEmployeeAndDay(emp.id, d.key)
                      );
                      const blockRendered = Array(weekDays.length).fill(false);

                      return intervals.map((interval, intervalIdx) => (
                        <tr key={`${emp.id}-${intervalIdx}`}>
                          {intervalIdx === 0 && (
                            <td
                              className="vertical-header"
                              rowSpan={intervals.length}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: "100%",
                                  textAlign: "center",
                                }}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}>
                                  <img
                                    src={`https://avatar.iran.liara.run/username?username=${emp.name}+${emp.surname}`}
                                    alt="avatar"
                                    className="employee-avatar"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      marginBottom: "4px",
                                    }}
                                  />
                                  <div>
                                    {emp.name} {emp.surname}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                          {weekDays.map((d, dayIdx) => {
                            const sched = empSchedules[dayIdx];
                            const intervalTime =
                              interval.hour * 60 + interval.minute;
                            const isTimeSlotInSchedule =
                              sched &&
                              intervalTime >=
                                Number.parseInt(sched.startTime.split(":")[0]) *
                                  60 +
                                  Number.parseInt(
                                    sched.startTime.split(":")[1]
                                  ) &&
                              intervalTime <
                                Number.parseInt(
                                  sched.finishTime.split(":")[0]
                                ) *
                                  60 +
                                  Number.parseInt(
                                    sched.finishTime.split(":")[1]
                                  );

                            if (!sched)
                              return (
                                <td key={d.key} className="empty-cell"></td>
                              );

                            if (
                              !blockRendered[dayIdx] &&
                              isTimeSlotInSchedule
                            ) {
                              const span = getIntervalCount(
                                sched.startTime,
                                sched.finishTime
                              );
                              blockRendered[dayIdx] = true;
                              return (
                                <td
                                  key={d.key}
                                  rowSpan={span}
                                  className="schedule-cell">
                                  <div
                                    className={`ews-schedule-block ews-schedule-block-${getBlockColor(
                                      empIdx
                                    )} vertical-view`}
                                    style={{ height: 60 * span - 8 }}>
                                    <div className="block-doctor">
                                      {emp.name} {emp.surname}
                                    </div>
                                    <div className="block-time">
                                      {formatTime(sched.startTime)} -{" "}
                                      {formatTime(sched.finishTime)}
                                    </div>
                                    <div className="block-room">
                                      {sched.cabinetName}
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            if (blockRendered[dayIdx] && isTimeSlotInSchedule)
                              return <></>;
                            return <td key={d.key} className="empty-cell"></td>;
                          })}
                        </tr>
                      ));
                    })
                  : filteredEmployees.map((emp, empIdx) => (
                      <tr key={emp.id}>
                        <td className="font-medium">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}>
                            <img
                              src={`https://avatar.iran.liara.run/username?username=${emp.name}+${emp.surname}`}
                              alt="avatar"
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                              }}
                            />
                            <span>
                              {emp.name} {emp.surname}
                            </span>
                          </div>
                        </td>
                        {weekDays.map((d, dayIdx) => {
                          const sched = getScheduleForEmployeeAndDay(
                            emp.id,
                            d.key
                          );
                          return (
                            <td key={d.key}>
                              {sched ? (
                                <div
                                  className={`ews-schedule-block ews-schedule-block-${getBlockColor(
                                    dayIdx
                                  )}`}
                                  style={{ minWidth: 120, margin: "0 auto" }}>
                                  <div>
                                    {formatTime(sched.startTime)} -{" "}
                                    {formatTime(sched.finishTime)}
                                  </div>
                                  <div className="ews-room">
                                    {sched.cabinetName}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmployeeSchedule;
