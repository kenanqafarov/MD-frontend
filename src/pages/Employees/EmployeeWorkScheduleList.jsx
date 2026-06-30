import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
import useWorkersScheduleStore from "../../../stores/workersScheduleStore";

import "../../assets/style/EmployeesPage/employeeworkschedulelist.css";
import OrdinaryScheduleList from "../../components/OrdinaryList/OrdinaryScheduleList";

const weekDays = [
  { key: "MONDAY", label: "Bazar ertəsi" },
  { key: "TUESDAY", label: "Çərşənbə axşamı" },
  { key: "WEDNESDAY", label: "Çərşənbə" },
  { key: "THURSDAY", label: "Cümə axşamı" },
  { key: "FRIDAY", label: "Cümə" },
  { key: "SATURDAY", label: "Şənbə" },
  { key: "SUNDAY", label: "Bazar" },
];

function EmployeeWorkScheduleList() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schedules, loading, error, fetchSchedules, removeSchedule } = useWorkersScheduleStore();

  const [selectedDay, setSelectedDay] = useState("");
  const [isOpen, setIsOpen] = useState(false); 
  useEffect(() => {
    fetchSchedules(); 
  }, [fetchSchedules]);

  const filteredSchedules = schedules.filter((s) => {
    const dayMatch = selectedDay ? s.weekDay === selectedDay : true;
    const userMatch = id ? s.userId === id : true;
    return dayMatch && userMatch;
  });

  const handleEdit = (item) => {
    const scheduleId = typeof item === "object" ? item.id : item;
    navigate(`/employees/work-schedule/${scheduleId}/edit`);
  };

  const handleDelete = (schedule) => {
    if (window.confirm("Qrafiki silmək istədiyinizə əminsiniz?")) {
      removeSchedule(schedule.id);
    }
  };

  return (
    <div className="employeeWorkScheduleList">
      <OrdinaryScheduleList
        title="İş qrafiki"
        addText="Yenisini əlavə et"
        addLink="./add"
        // exportLink="/employees/export"
      />
      <div
        className="ews-table-controls-bar"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 0 24px" }}
      >
       <div className="relative inline-block">
          <select
            className="ews-filter-select appearance-none pr-8"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
          >
            <option value="" disabled hidden>
              Həftənin Günü
            </option>
            {weekDays.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          <HiChevronDown
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
        {/* <Link to={"./add"} className="anamnesisList-add-new-button">
          <span>+</span> Yenisini əlavə et
        </Link> */}
      </div>
      <div className="ews-table-wrapper">
        <table className="ews-table">
          <thead>
            <tr>
              <th className="border-r-1 border-gray-400 w-20">
                <span className="firstElementOfTHS items-center flex ">
                  {/* <HiOutlineArrowsUpDown /> */}
                  {filteredSchedules.length ? `1-${filteredSchedules.length}` : "1-8"}
                </span>
              </th>
              <th className="w-50">
                <span className="items-center flex gap-1 justify-center">
                  <HiOutlineArrowsUpDown /> Həftənin Günü
                </span>
              </th>
              <th className="w-50">
                <span className="items-center flex gap-1 justify-center">
                  <HiOutlineArrowsUpDown /> Kabinet
                </span>
              </th>
              <th className="w-55">
                <span className="items-center flex gap-1 justify-center">
                  <HiOutlineArrowsUpDown /> Başlama saatı
                </span>
              </th>
              <th className="w-55">
                <span className="items-center flex gap-1 justify-center">
                  <HiOutlineArrowsUpDown /> Bitiş saatı
                </span>
              </th>
              <th>
                <span className="flex justify-center">Düzəliş</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Yüklənir...</td>
              </tr>
            ) : filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan="6">Heç bir qrafik tapılmadı.</td>
              </tr>
            ) : (
              filteredSchedules.map((row, index) =>
                
                (
                <tr key={row.id}>
                  <td className="testTD" style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td className="!text-center" style={{ textAlign: 'left' }}>{weekDays.find((d) => d.key === row.weekDay)?.label || row.weekDay}</td>
                  <td className="!text-center" style={{ textAlign: 'left' }}>{row.cabinetName}</td>
                  <td className="!text-center" style={{ textAlign: 'left' }}>{formatTime(row.startTime)}</td>
                  <td className="!text-center" style={{ textAlign: 'left' }}>{formatTime(row.finishTime)}</td>
                  <td className="!text-center" style={{ textAlign: 'left' }}>
                    <div className="anamnesisList-action-icons !flex !justify-center gap-1">
                      <FiEdit3
                        className="anamnesisList-edit-button text-blue-400"
                        onClick={() => handleEdit(row)}
                      />
                      <GoTrash
                        className="anamnesisList-delete-button text-red-500"
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
      {error && <p className="errorText">Xəta baş verdi: {error.message}</p>}
    </div>
  );
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  if (typeof timeStr === "string") return timeStr.slice(0, 5);
  if (typeof timeStr === "object" && timeStr.hour !== undefined && timeStr.minute !== undefined) {
    return `${String(timeStr.hour).padStart(2, "0")}:${String(timeStr.minute).padStart(2, "0")}`;
  }
  return "";
}

export default EmployeeWorkScheduleList;
