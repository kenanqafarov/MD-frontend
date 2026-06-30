import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/style/EmployeesPage/employeeworkscheduleadd.css";
import acceptProcess from "../../assets/images/EmployeesPage/verifyProcess.png";
import cancelProcess from "../../assets/images/EmployeesPage/cancelProcess.png";
import useWorkersScheduleStore from "../../../stores/workersScheduleStore";
import useCabinetStore from "../../../stores/cabinetStore";

function EmployeeWorkScheduleAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addSchedule } = useWorkersScheduleStore();
  const { cabinets, fetchCabinets } = useCabinetStore();

  const [formData, setFormData] = useState({
    weekDay: "",
    cabinetName: "",
    startTime: "",
    finishTime: "",
  });

  const [errors, setErrors] = useState({
    weekDay: false,
    cabinetName: false,
  });

  const həftəninGünləri = [
    { value: "MONDAY", label: "Bazar ertəsi" },
    { value: "TUESDAY", label: "Çərşənbə axşamı" },
    { value: "WEDNESDAY", label: "Çərşənbə" },
    { value: "THURSDAY", label: "Cümə axşamı" },
    { value: "FRIDAY", label: "Cümə" },
    { value: "SATURDAY", label: "Şənbə" },
    { value: "SUNDAY", label: "Bazar" },
  ];

  useEffect(() => {
    fetchCabinets();
  }, []);

  const dəyişiklikləriİdarəEt = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const formuYoxla = () => {
    const yeniXətalar = {
      weekDay: !formData.weekDay,
      cabinetName: !formData.cabinetName,
    };
    setErrors(yeniXətalar);
    return !Object.values(yeniXətalar).some((err) => err);
  };

  const göndər = () => {
    if (!formuYoxla()) return;

    const işQrafikiMəlumatları = {
      weekDay: formData.weekDay,
      cabinetName: formData.cabinetName,
      userId: id,
      startTime: formData.startTime ? `${formData.startTime}:00` : "00:00:00",
      finishTime: formData.finishTime
        ? `${formData.finishTime}:00`
        : "00:00:00",
    };

    addSchedule(işQrafikiMəlumatları)
      .then(() => {
        toast.success("İş qrafiki uğurla əlavə edildi!");
        navigate(`/employees/work-schedule/${id}`);
      })
      .catch((xəta) => {
        console.error("İş qrafiki əlavə edilərkən xəta:", xəta);
        toast.error("İş qrafiki əlavə edilərkən xəta baş verdi!");
      });
  };

  const ləğvEt = () => navigate(`/employees/work-schedule/${id}`);

  return (
    <div className="employeeWorkScheduleAddContainer">
      <div className="employeeWorkScheduleAdd">
        <div className="employeeWorkScheduleAddWrapper">
          {/* Həftənin günü */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Həftənin günü{" "}
              <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              name="weekDay"
              value={formData.weekDay}
              onChange={dəyişiklikləriİdarəEt}
              className={`${errors.weekDay
                  ? "border-2 border-red-500 !bg-red-50 text-red-500"
                  : "border border-gray-300 bg-white text-gray-900"
                } w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option
                value=""
                disabled
                hidden
                className={errors.weekDay ? "text-red-500" : "text-gray-500"}
              >
                {errors.weekDay ? "Bu sahə mütləq doldurulmalıdır" : "Seçin"}
              </option>
              {həftəninGünləri.map((gün) => (
                <option
                  key={gün.value}
                  value={gün.value}
                  className="text-gray-900 bg-white"
                >
                  {gün.label}
                </option>
              ))}
            </select>
          </div>

          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">
              Kabinet <span className="requiredStarForEmployeeAdd">*</span>
            </p>
            <select
              name="cabinetName"
              value={formData.cabinetName}
              onChange={dəyişiklikləriİdarəEt}
              className={`${errors.cabinetName
                  ? "border-2 border-red-500 !bg-red-50 text-red-500"
                  : "border border-gray-300 bg-white text-gray-900"
                } w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option
                value=""
                disabled
                hidden
                className={
                  errors.cabinetName ? "text-red-500" : "text-gray-500"
                }
              >
                {errors.cabinetName
                  ? "Bu sahə mütləq doldurulmalıdır"
                  : "Seçin"}
              </option>
              {cabinets.map((k) => (
                <option
                  key={k.id || k.value}
                  value={k.name || k.cabinetName || k.value}
                  className="text-gray-900 bg-white"
                >
                  {k.name || k.cabinetName || k.value}
                </option>
              ))}
            </select>
          </div>

          {/* Başlama və bitmə saatı */}
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Başlama saatı</p>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={dəyişiklikləriİdarəEt}
            />
          </div>
          <div className="employeeWorkScheduleAddRow">
            <p className="employeeWorkScheduleAddRowTitle">Bitmə saatı</p>
            <input
              type="time"
              name="finishTime"
              value={formData.finishTime}
              onChange={dəyişiklikləriİdarəEt}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="employeeWorkScheduleAddActionsButtons">
          <button
            type="button"
            className="employeeAddCancelProcess"
            onClick={ləğvEt}
          >
            <img src={cancelProcess} alt="Ləğv et" /> İmtina et
          </button>
          <button
            type="button"
            className="employeeAddAcceptProcess"
            onClick={göndər}
          >
            <img src={acceptProcess} alt="Yadda saxla" /> Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeWorkScheduleAdd;
