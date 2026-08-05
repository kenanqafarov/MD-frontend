import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faTooth } from "@fortawesome/free-solid-svg-icons";
import CustomDropdown from "./CustomDropdown";
import MultiFileForm from "./MultiFileForm";
import useDentalOrderStore from "../../stores/dentalOrderStore";
import { readAllTeeth, createTooth } from "../api/teeth";

import useGarnitureStore from "../../stores/garnitureStore";
import useColorStore from "../../stores/colorStore";
import useTechnicianStore from "../../stores/technicianStore";
import usePatientStore from "../../stores/patiendStore";
import useCalendarStore from "../../stores/calendarStore";
import useCeramicsStore from "../../stores/ceramicStore";
import useMetalStore from "../../stores/metalsStore";
import "../assets/style/form.css";

// Fallback data
const fallbackColors = [
  { value: 1, label: "A1" },
  { value: 2, label: "A2" },
  { value: 3, label: "A3" },
  { value: 4, label: "A3.5" },
  { value: 5, label: "A4" },
  { value: 6, label: "B1" },
  { value: 7, label: "B2" },
  { value: 8, label: "C1" },
  { value: 9, label: "D2" },
  { value: 10, label: "BL1" },
];
const fallbackMetals = [
  { value: 1, label: "Nikel-Krom" },
  { value: 2, label: "Kobalt-Krom" },
  { value: 3, label: "Titanyum" },
  { value: 4, label: "Altın Alaşım" },
  { value: 5, label: "Zirkonium" },
];
const fallbackCeramics = [
  { value: 1, label: "E-Max" },
  { value: 2, label: "Feldspatik" },
  { value: 3, label: "Zirkon Keramika" },
  { value: 4, label: "Vita VM9" },
];
const fallbackGarnitures = [
  { value: 1, label: "Standard" },
  { value: 2, label: "Premium" },
  { value: 3, label: "Lüks" },
];

// Helper function to format date strings to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return "";
  }
};

// Adult FDI Teeth Numbers matching exact paper layout:
// Upper: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
// Lower: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];

const OrderForm = ({
  initialData,
  mode = "create",
  onSubmit,
  onCancel,
  lockedPatientId = null,
}) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: initialData || {},
  });

  // State for dropdown options
  const [garnitures, setGarnitures] = useState([]);
  const [colors, setColors] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [ceramics, setCeramics] = useState([]);
  const [metals, setMetals] = useState([]);

  // Tooth selection states
  const [selectedTeeth, setSelectedTeeth] = useState(
    initialData?.teethList?.map(t => (typeof t === 'object' ? t.toothNo : t)) || []
  );
  const [isChild, setIsChild] = useState(
    initialData?.isChild !== undefined ? initialData.isChild : false
  );
  const [toothDetails, setToothDetails] = useState(
    initialData?.toothDetailIds || []
  );
  const [files, setFiles] = useState([]);

  // Initialize stores
  const dentalOrderStore = useDentalOrderStore();

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        orderDate: formatDate(initialData.orderDate || new Date()),
        inspectionDateM: formatDate(
          initialData.inspectionDateM || initialData.checkDate || initialData.inspectionDate
        ),
        inspectionDateK: formatDate(
          initialData.inspectionDateK || initialData.checkDateK
        ),
        deliveryDate: formatDate(initialData.deliveryDate),
        doctor: initialData.doctorId || initialData.doctor,
        technician: initialData.technicianId || initialData.technician,
        patient: initialData.patientId || initialData.patient,
        workType: initialData.dentalWorkType || "QAPAQ",
        metalWork: initialData.metalWork || "",
        ceramicWork: initialData.ceramicWork || "",
        report: initialData.description || initialData.notes || initialData.report || "",
        color: initialData.orderDentureInfo?.color || initialData.color ? Number(initialData.orderDentureInfo?.color || initialData.color) : null,
        metal: initialData.metalId || initialData.metal ? Number(initialData.metalId || initialData.metal) : null,
        ceramic: initialData.ceramicId || initialData.ceramic ? Number(initialData.ceramicId || initialData.ceramic) : null,
        garniture: initialData.orderDentureInfo?.garniture ? Number(initialData.orderDentureInfo?.garniture) : null,
      };
      reset(formattedData);

      const teethList = initialData.teethList || [];
      const detailsList = initialData.toothDetails || initialData.toothDetailIds || [];

      const localSelectedTeeth = teethList.map(t => (typeof t === 'object' ? t.toothNo : t));
      const localToothDetails = teethList.map((t, idx) => {
        const toothNumber = typeof t === 'object' ? t.toothNo : t;
        const details = detailsList[idx] || {};
        return {
          toothNumber,
          colorId: details.colorId || null,
          metalId: details.metalId || null,
          ceramicId: details.ceramicId || null,
        };
      });

      setToothDetails(localToothDetails);
      setSelectedTeeth(localSelectedTeeth);
      setIsChild(
        initialData.isChild !== undefined ? initialData.isChild : false
      );
    } else {
      // Set default current date for orderDate if creating new
      setValue("orderDate", formatDate(new Date()));
      setValue("workType", "QAPAQ");
    }
  }, [initialData, reset, setValue]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.allSettled([
          useGarnitureStore.getState().fetchGarnitureList(),
          useColorStore.getState().fetchColorList(),
          useTechnicianStore.getState().fetchTechnicians(),
          usePatientStore.getState().fetchPatients(),
          useCalendarStore.getState().fetchDoctors(),
          useCeramicsStore.getState().fetchCeramicsList(),
          useMetalStore.getState().fetchMetals(),
        ]);

        const fetchedGarnitures = useGarnitureStore.getState().garnitures;
        setGarnitures(
          fetchedGarnitures && fetchedGarnitures.length > 0
            ? fetchedGarnitures.map((item) => ({
                value: item.id,
                label: item.name || "N/A",
              }))
            : fallbackGarnitures
        );

        const fetchedColors = useColorStore.getState().colors;
        setColors(
          fetchedColors && fetchedColors.length > 0
            ? fetchedColors.map((item) => ({
                value: item.id,
                label: item.name || "N/A",
              }))
            : fallbackColors
        );

        const fetchedTechs = useTechnicianStore.getState().technicians;
        setTechnicians(
          fetchedTechs && fetchedTechs.length > 0
            ? fetchedTechs.map((item) => ({
                value: item.id,
                label: `${item.name} ${item.surname}`,
              }))
            : []
        );

        const fetchedPatients = usePatientStore.getState().patients;
        setPatients(
          fetchedPatients && fetchedPatients.length > 0
            ? fetchedPatients.map((item) => ({
                value: item.id,
                label: `${item.name} ${item.surname}`,
              }))
            : []
        );

        const fetchedDoctors = useCalendarStore.getState().doctors;
        setDoctors(
          fetchedDoctors && fetchedDoctors.length > 0
            ? fetchedDoctors.map((item) => ({
                value: item.doctorId || item.id,
                label: `${item.name} ${item.surname}`,
              }))
            : []
        );

        const fetchedCeramics = useCeramicsStore.getState().ceramics;
        setCeramics(
          fetchedCeramics && fetchedCeramics.length > 0
            ? fetchedCeramics.map((item) => ({ value: item.id, label: item.name }))
            : fallbackCeramics
        );

        const fetchedMetals = useMetalStore.getState().metals;
        setMetals(
          fetchedMetals && fetchedMetals.length > 0
            ? fetchedMetals.map((item) => ({ value: item.id, label: item.name }))
            : fallbackMetals
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleToothToggle = (toothNum) => {
    if (mode === "view") return;
    const isSelected = selectedTeeth.includes(toothNum);
    const updatedTeeth = isSelected
      ? selectedTeeth.filter((t) => t !== toothNum)
      : [...selectedTeeth, toothNum];

    setSelectedTeeth(updatedTeeth);

    // Update tooth details
    const updatedDetails = [...toothDetails];
    if (!isSelected) {
      if (!updatedDetails.find((d) => d.toothNumber === toothNum)) {
        updatedDetails.push({
          toothNumber: toothNum,
          colorId: null,
          metalId: null,
          ceramicId: null,
        });
      }
    }
    setToothDetails(updatedDetails.filter((d) => updatedTeeth.includes(d.toothNumber)));
  };

  const handleToothDetailChange = (toothNumber, field, value) => {
    const updatedDetails = toothDetails.map((detail) =>
      detail.toothNumber === toothNumber
        ? { ...detail, [field]: value }
        : detail
    );
    setToothDetails(updatedDetails);
  };

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const parseFDINumber = (toothNo) => {
    const t = Number(toothNo);
    if (t >= 11 && t <= 18) return { type: "ADULT", location: "TOP_RIGHT", num: t - 10 };
    if (t >= 21 && t <= 28) return { type: "ADULT", location: "TOP_LEFT", num: t - 20 };
    if (t >= 31 && t <= 38) return { type: "ADULT", location: "BOTTOM_LEFT", num: t - 30 };
    if (t >= 41 && t <= 48) return { type: "ADULT", location: "BOTTOM_RIGHT", num: t - 40 };
    if (t >= 51 && t <= 55) return { type: "CHILD", location: "TOP_RIGHT", num: t - 50 };
    if (t >= 61 && t <= 65) return { type: "CHILD", location: "TOP_LEFT", num: t - 60 };
    if (t >= 71 && t <= 75) return { type: "CHILD", location: "BOTTOM_LEFT", num: t - 70 };
    if (t >= 81 && t <= 85) return { type: "CHILD", location: "BOTTOM_RIGHT", num: t - 80 };
    return null;
  };

  const handleFormSubmit = async (data) => {
    try {
      const finalPatientId = data.patient ? parseInt(data.patient) : (lockedPatientId ? parseInt(lockedPatientId) : (initialData?.patientId ? parseInt(initialData.patientId) : null));
      const finalDoctorId = data.doctor ? String(data.doctor) : (initialData?.doctorId ? String(initialData.doctorId) : null);

      if (!finalPatientId) {
        toast.error("Zəhmət olmasa, pasiyenti seçin.");
        return;
      }
      if (!data.orderDate || !data.deliveryDate) {
        toast.error("Zəhmət olmasa, işin giriş və təhvil tarixlərini seçin.");
        return;
      }

      // Fetch registered teeth from DB
      const currentDbTeeth = await readAllTeeth();
      const resolvedTeethIds = [];

      for (const toothNo of selectedTeeth) {
        let dbTooth = currentDbTeeth.find((t) => Number(t.toothNo) === Number(toothNo));
        if (!dbTooth) {
          const parsed = parseFDINumber(toothNo);
          if (parsed) {
            dbTooth = await createTooth({
              toothNo: Number(toothNo),
              toothType: parsed.type,
              toothLocation: parsed.location
            });
            currentDbTeeth.push(dbTooth);
          }
        }
        if (dbTooth) {
          resolvedTeethIds.push(Number(dbTooth.id));
        }
      }

      // Prepare tooth detail IDs matching resolved teeth IDs
      const toothDetailIds = resolvedTeethIds.map((teethId) => {
        const dbTooth = currentDbTeeth.find((t) => Number(t.id) === Number(teethId));
        const toothNo = dbTooth ? dbTooth.toothNo : null;
        const localDetail = toothDetails.find((d) => Number(d.toothNumber) === Number(toothNo)) || {};

        const colorId = localDetail.colorId ? Number(localDetail.colorId) : (data.color ? Number(data.color) : null);
        const metalId = localDetail.metalId ? Number(localDetail.metalId) : (data.metal ? Number(data.metal) : null);
        const ceramicId = localDetail.ceramicId ? Number(localDetail.ceramicId) : (data.ceramic ? Number(data.ceramic) : null);

        return { colorId, metalId, ceramicId };
      }).filter((detail) => detail.colorId !== null || detail.metalId !== null || detail.ceramicId !== null);

      // Construct description with full paper form fields
      const descriptionLines = [];
      if (data.metalWork) descriptionLines.push(`Metal işi: ${data.metalWork}`);
      if (data.ceramicWork) descriptionLines.push(`Keramikanın işi: ${data.ceramicWork}`);
      if (data.report) descriptionLines.push(`Hesabat: ${data.report}`);
      const fullDescription = descriptionLines.join(" | ");

      // Filter resolvedTeethIds to ensure valid non-null numbers
      const validTeethIds = resolvedTeethIds.filter((id) => id !== null && id !== undefined && !isNaN(id));

      const submitData = {
        checkDate: data.inspectionDateM || data.inspectionDateK || data.orderDate,
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate,
        description: fullDescription || data.report || "",
        dentalWorkType: data.workType || "QAPAQ",
        toothDetailIds: toothDetailIds,
        teethList: validTeethIds,
        doctorId: finalDoctorId,
        technicianId: data.technician ? String(data.technician) : null,
        patientId: finalPatientId,
      };

      if (data.workType === "PROTEZ" || data.color || data.garniture) {
        submitData.orderDentureInfo = {
          color: data.color ? String(data.color) : null,
          garniture: data.garniture ? String(data.garniture) : null,
        };
      }

      const base64Files = files
        .map((file) => (typeof file === "object" ? file.base64 : file))
        .filter((file) => typeof file === "string" && file.startsWith("data:"));

      if (base64Files.length > 0) {
        submitData.files = base64Files;
      }

      if (mode === "create") {
        await dentalOrderStore.addOrder(submitData);
      } else if (mode === "edit") {
        await dentalOrderStore.editOrder({ ...submitData, id: initialData.id });
      }

      toast.success("Sifariş uğurla saxlanıldı!");

      if (onSubmit) {
        onSubmit(submitData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const workTypes = [
    { value: "QAPAQ", label: "Qapaq / Metal-Keramika" },
    { value: "PROTEZ", label: "Protez" },
    { value: "IMPLANT", label: "İmplant Üstü" },
    { value: "ZIRKON", label: "Zirkon" },
  ];

  const formValues = watch();

  const selectedDoctor = useMemo(() => {
    const found = doctors.find((d) => d.value === formValues.doctor);
    if (!found && formValues.doctor) {
      return { value: formValues.doctor, label: String(formValues.doctor) };
    }
    return found || null;
  }, [doctors, formValues.doctor]);

  const selectedTechnician = useMemo(() => {
    const found = technicians.find((t) => t.value === formValues.technician);
    if (!found && formValues.technician) {
      return { value: formValues.technician, label: String(formValues.technician) };
    }
    return found || null;
  }, [technicians, formValues.technician]);

  const selectedPatient = useMemo(() => {
    const found = patients.find((p) => p.value === formValues.patient);
    if (!found && formValues.patient) {
      return { value: formValues.patient, label: String(formValues.patient) };
    }
    return found || null;
  }, [patients, formValues.patient]);

  const selectedWorkType = useMemo(
    () => workTypes.find((w) => w.value === formValues.workType) || workTypes[0],
    [formValues.workType]
  );

  const selectedColor = useMemo(
    () => colors.find((c) => c.value === formValues.color) || null,
    [colors, formValues.color]
  );
  const selectedMetal = useMemo(
    () => metals.find((m) => m.value === formValues.metal) || null,
    [metals, formValues.metal]
  );
  const selectedCeramic = useMemo(
    () => ceramics.find((c) => c.value === formValues.ceramic) || null,
    [ceramics, formValues.ceramic]
  );

  const upperRightTeeth = isChild ? CHILD_UPPER_RIGHT : ADULT_UPPER_RIGHT;
  const upperLeftTeeth = isChild ? CHILD_UPPER_LEFT : ADULT_UPPER_LEFT;
  const lowerRightTeeth = isChild ? CHILD_LOWER_RIGHT : ADULT_LOWER_RIGHT;
  const lowerLeftTeeth = isChild ? CHILD_LOWER_LEFT : ADULT_LOWER_LEFT;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-2"
    >
      <ToastContainer />
      {/* Paper Form Header Card - MÜASİR STOMATOLOGİYA */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-xl shadow-lg p-6 border-b-4 border-blue-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase flex items-center gap-3">
              <FontAwesomeIcon icon={faTooth} className="text-blue-400 text-3xl" />
              MÜASİR STOMATOLOGİYA
            </h1>
            <p className="text-blue-200 text-sm font-medium mt-1">
              DENTAL LABORATORİYA SİFARİŞ FORMASI
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
            <span className="text-xs uppercase font-semibold text-blue-200">Rejim:</span>
            <span className="text-sm font-bold text-white uppercase">{mode === "view" ? "Baxış" : mode === "edit" ? "Düzəliş" : "Yeni Sifariş"}</span>
          </div>
        </div>
      </div>

      {/* Main Metadata Section (Matching Form Fields) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          Əsas Məlumatlar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Həkim */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Həkim <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              options={doctors}
              value={selectedDoctor}
              onChange={(option) => setValue("doctor", option ? option.value : null)}
              placeholder="Həkim seçin (məs: N.Çobanov)"
              name="doctor"
              disabled={mode === "view"}
            />
          </div>

          {/* Xəstə (Patient) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Xəstə (Pasiyent) <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              options={patients}
              value={selectedPatient}
              onChange={(option) => setValue("patient", option ? option.value : null)}
              placeholder="Xəstəni seçin"
              name="patient"
              disabled={mode === "view" || lockedPatientId !== null}
            />
          </div>

          {/* Texnik */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Texnik
            </label>
            <CustomDropdown
              options={technicians}
              value={selectedTechnician}
              onChange={(option) => setValue("technician", option ? option.value : null)}
              placeholder="Texnik seçin"
              name="technician"
              disabled={mode === "view"}
            />
          </div>

          {/* İşin növü */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin növü <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              options={workTypes}
              value={selectedWorkType}
              onChange={(option) => setValue("workType", option ? option.value : "QAPAQ")}
              placeholder="İşin növünü seçin"
              name="workType"
              disabled={mode === "view"}
            />
          </div>
        </div>

        {/* Date Fields Grid matching physical form:
            - İşin giriş vaxtı
            - İşin yoxlanma vaxtı (M)
            - İşin yoxlanma vaxtı (K)
            - İşin təhvil vaxtı
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="orderDate" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin giriş vaxtı <span className="text-red-500">*</span>
            </label>
            <input
              id="orderDate"
              type="date"
              {...register("orderDate", { required: true })}
              readOnly={mode === "view"}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="inspectionDateM" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin yoxlanma vaxtı (M)
            </label>
            <input
              id="inspectionDateM"
              type="date"
              {...register("inspectionDateM")}
              readOnly={mode === "view"}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="inspectionDateK" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin yoxlanma vaxtı (K)
            </label>
            <input
              id="inspectionDateK"
              type="date"
              {...register("inspectionDateK")}
              readOnly={mode === "view"}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="deliveryDate" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin təhvil vaxtı <span className="text-red-500">*</span>
            </label>
            <input
              id="deliveryDate"
              type="date"
              {...register("deliveryDate", { required: true })}
              readOnly={mode === "view"}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* FDI Tooth Selection Grid - Exact Paper Form Layout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Diş Qrafiki (FDI)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Təsirə məruz qalan dişləri seçin</p>
          </div>

          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isChild ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => {
                if (mode === "view") return;
                setIsChild(false);
                setSelectedTeeth([]);
                setToothDetails([]);
              }}
            >
              Yetkin
            </button>
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isChild ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => {
                if (mode === "view") return;
                setIsChild(true);
                setSelectedTeeth([]);
                setToothDetails([]);
              }}
            >
              Uşaq
            </button>
          </div>
        </div>

        {/* 2-Row FDI Teeth Table matching paper document */}
        <div className="overflow-x-auto py-2">
          <div className="min-w-[640px] flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Upper Teeth Row */}
            <div className="flex justify-center items-center gap-1 sm:gap-2">
              <div className="flex gap-1 sm:gap-1.5 pr-3 border-r-2 border-gray-400">
                {upperRightTeeth.map((num) => {
                  const active = selectedTeeth.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={mode === "view"}
                      onClick={() => handleToothToggle(num)}
                      className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center border ${
                        active
                          ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 scale-105"
                          : "bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-1 sm:gap-1.5 pl-3">
                {upperLeftTeeth.map((num) => {
                  const active = selectedTeeth.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={mode === "view"}
                      onClick={() => handleToothToggle(num)}
                      className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center border ${
                        active
                          ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 scale-105"
                          : "bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full border-t border-gray-300 my-1"></div>

            {/* Lower Teeth Row */}
            <div className="flex justify-center items-center gap-1 sm:gap-2">
              <div className="flex gap-1 sm:gap-1.5 pr-3 border-r-2 border-gray-400">
                {lowerRightTeeth.map((num) => {
                  const active = selectedTeeth.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={mode === "view"}
                      onClick={() => handleToothToggle(num)}
                      className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center border ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 scale-105"
                          : "bg-white text-gray-800 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-1 sm:gap-1.5 pl-3">
                {lowerLeftTeeth.map((num) => {
                  const active = selectedTeeth.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={mode === "view"}
                      onClick={() => handleToothToggle(num)}
                      className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center border ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 scale-105"
                          : "bg-white text-gray-800 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {selectedTeeth.length > 0 && (
          <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="font-semibold">Seçilmiş dişlər ({selectedTeeth.length}):</span>{" "}
            {selectedTeeth.sort((a,b) => a-b).join(", ")}
          </div>
        )}
      </div>

      {/* Materials & Work Specification Section matching paper document:
          - İşin rəngi
          - Metal növü
          - Keramika növü
          - Metal işi
          - Keramikanın işi
          - Hesabat
      */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
          Materiallar və İşin Təfərrüatları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* İşin rəngi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              İşin rəngi
            </label>
            <CustomDropdown
              options={colors}
              value={selectedColor}
              onChange={(option) => setValue("color", option ? option.value : null)}
              placeholder="Rəng seçin (məs: A2)"
              disabled={mode === "view"}
            />
          </div>

          {/* Metal növü */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Metal növü
            </label>
            <CustomDropdown
              options={metals}
              value={selectedMetal}
              onChange={(option) => setValue("metal", option ? option.value : null)}
              placeholder="Metal növünü seçin"
              disabled={mode === "view"}
            />
          </div>

          {/* Keramika növü */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Keramika növü
            </label>
            <CustomDropdown
              options={ceramics}
              value={selectedCeramic}
              onChange={(option) => setValue("ceramic", option ? option.value : null)}
              placeholder="Keramika növünü seçin"
              disabled={mode === "view"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Metal işi */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="metalWork" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Metal işi
            </label>
            <textarea
              id="metalWork"
              {...register("metalWork")}
              readOnly={mode === "view"}
              rows={3}
              placeholder="Metal işi təfərrüatları..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Keramikanın işi */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ceramicWork" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Keramikanın işi
            </label>
            <textarea
              id="ceramicWork"
              {...register("ceramicWork")}
              readOnly={mode === "view"}
              rows={3}
              placeholder="Keramika işi təfərrüatları..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Hesabat (Report / Notes) */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label htmlFor="report" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Hesabat (Qeydlər)
          </label>
          <textarea
            id="report"
            {...register("report")}
            readOnly={mode === "view"}
            rows={3}
            placeholder="Hesabat və əlavə qeydlər..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
          />
        </div>

        {/* Multi-file Attachments */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Əlavə olunmuş Fayllar / Şəkillər
          </label>
          <MultiFileForm
            onFilesChange={handleFilesChange}
            disabled={mode === "view"}
            initialFiles={initialData?.files || []}
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faXmark} /> Ləğv et
        </button>

        {mode !== "view" && (
          <button
            type="submit"
            disabled={dentalOrderStore.loading}
            className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faCheck} />
            {dentalOrderStore.loading ? "Yadda saxlanılır..." : "Yadda saxla"}
          </button>
        )}
      </div>
    </form>
  );
};

export default OrderForm;
