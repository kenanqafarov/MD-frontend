import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faTooth } from "@fortawesome/free-solid-svg-icons";
import CustomDropdown from "./CustomDropdown";
import MultiFileForm from "./MultiFileForm";
import ToothShadeSelector from "./ToothShadeSelector";
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

const getTeethSequence = (toothNum) => {
  const t = Number(toothNum);
  if (ADULT_UPPER_RIGHT.includes(t) || ADULT_UPPER_LEFT.includes(t)) {
    return [...ADULT_UPPER_RIGHT, ...ADULT_UPPER_LEFT];
  }
  if (ADULT_LOWER_RIGHT.includes(t) || ADULT_LOWER_LEFT.includes(t)) {
    return [...ADULT_LOWER_RIGHT, ...ADULT_LOWER_LEFT];
  }
  if (CHILD_UPPER_RIGHT.includes(t) || CHILD_UPPER_LEFT.includes(t)) {
    return [...CHILD_UPPER_RIGHT, ...CHILD_UPPER_LEFT];
  }
  if (CHILD_LOWER_RIGHT.includes(t) || CHILD_LOWER_LEFT.includes(t)) {
    return [...CHILD_LOWER_RIGHT, ...CHILD_LOWER_LEFT];
  }
  return [];
};

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
  // shadeZones: { [toothNumber]: { CROWN: colorId|null, MIDDLE: colorId|null, GUM: colorId|null } }
  const [shadeZones, setShadeZones] = useState({});
  const [files, setFiles] = useState([]);

  const [selectionMode, setSelectionMode] = useState(
    initialData?.isBridge ? "bridge" : "single"
  );
  const [bridgeStart, setBridgeStart] = useState(
    initialData?.startTooth || null
  );
  const [bridgeEnd, setBridgeEnd] = useState(
    initialData?.endTooth || null
  );

  // Initialize stores
  const dentalOrderStore = useDentalOrderStore();

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Fallback extraction from toothDetails if root fields are missing
      let extractedColor = null;
      let extractedMetal = null;
      let extractedCeramic = null;
      if (initialData.toothDetails && initialData.toothDetails.length > 0) {
        const withColor = initialData.toothDetails.find(d => d.colorId);
        if (withColor) extractedColor = Number(withColor.colorId);

        const withMetal = initialData.toothDetails.find(d => d.metalId);
        if (withMetal) extractedMetal = Number(withMetal.metalId);

        const withCeramic = initialData.toothDetails.find(d => d.ceramicId);
        if (withCeramic) extractedCeramic = Number(withCeramic.ceramicId);
      }

      // Fallback parsing of description for metalWork, ceramicWork, and report
      let metalWork = initialData.metalWork || "";
      let ceramicWork = initialData.ceramicWork || "";
      let report = initialData.report || "";
      const rawDesc = initialData.description || initialData.notes || "";
      if (!metalWork && !ceramicWork && !report && rawDesc) {
        if (rawDesc.includes(" | ")) {
          const parts = rawDesc.split(" | ");
          let parsedMetal = "";
          let parsedCeramic = "";
          let parsedReport = "";
          parts.forEach(part => {
            if (part.startsWith("Metal işi: ")) {
              parsedMetal = part.replace("Metal işi: ", "");
            } else if (part.startsWith("Keramikanın işi: ")) {
              parsedCeramic = part.replace("Keramikanın işi: ", "");
            } else if (part.startsWith("Hesabat: ")) {
              parsedReport = part.replace("Hesabat: ", "");
            }
          });
          if (parsedMetal || parsedCeramic || parsedReport) {
            metalWork = parsedMetal;
            ceramicWork = parsedCeramic;
            report = parsedReport;
          } else {
            report = rawDesc;
          }
        } else {
          report = rawDesc;
        }
      } else if (!report && rawDesc) {
        report = rawDesc;
      }

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
        metalWork: metalWork,
        ceramicWork: ceramicWork,
        report: report,
        color: initialData.orderDentureInfo?.color || initialData.colorId || initialData.color ? Number(initialData.orderDentureInfo?.color || initialData.colorId || initialData.color) : (extractedColor || null),
        metal: initialData.metalId || initialData.metal ? Number(initialData.metalId || initialData.metal) : (extractedMetal || null),
        ceramic: initialData.ceramicId || initialData.ceramic ? Number(initialData.ceramicId || initialData.ceramic) : (extractedCeramic || null),
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

      // Edit mode-da mövcud shade zone-larını yüklə
      // toothDetails-dən toothSection məlumatını bərpa et
      if (initialData.toothDetails && initialData.toothDetails.length > 0) {
        const restoredZones = {};
        // Tooth number sırası ilə toothDetails-i eşlə
        teethList.forEach((t, idx) => {
          const toothNo = typeof t === 'object' ? t.toothNo : t;
          // Həmin diş üçün bütün detail-ları tap (CROWN, MIDDLE, GUM)
          const detailsForTooth = initialData.toothDetails.filter((d, di) => {
            // Əgər toothSection varsa onu istifadə et
            if (d.toothSection) return true; // hamısı bu diş üçün ola bilər
            return di === idx; // fallback: index-ə görə
          });
          const zones = { CROWN: null, MIDDLE: null, GUM: null };
          detailsForTooth.forEach(d => {
            const sec = d.toothSection || 'CROWN';
            if (zones[sec] !== undefined) {
              zones[sec] = d.colorId || null;
            }
          });
          restoredZones[toothNo] = zones;
        });
        setShadeZones(restoredZones);
      }
      setSelectionMode(initialData.isBridge ? "bridge" : "single");
      setBridgeStart(initialData.startTooth || null);
      setBridgeEnd(initialData.endTooth || null);
    } else {
      // Set default current date for orderDate if creating new
      setValue("orderDate", formatDate(new Date()));
      setValue("workType", "QAPAQ");
      setSelectionMode("single");
      setBridgeStart(null);
      setBridgeEnd(null);
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

    if (selectionMode === "bridge") {
      if (bridgeStart === null || (bridgeStart !== null && bridgeEnd !== null)) {
        setBridgeStart(toothNum);
        setBridgeEnd(null);
        setSelectedTeeth([toothNum]);
        setToothDetails([
          {
            toothNumber: toothNum,
            colorId: null,
            metalId: null,
            ceramicId: null,
          }
        ]);
        setShadeZones({});
      } else {
        const seq = getTeethSequence(bridgeStart);
        if (seq && seq.includes(toothNum)) {
          const idx1 = seq.indexOf(bridgeStart);
          const idx2 = seq.indexOf(toothNum);
          const startIdx = Math.min(idx1, idx2);
          const endIdx = Math.max(idx1, idx2);
          const range = seq.slice(startIdx, endIdx + 1);

          setBridgeEnd(toothNum);
          setSelectedTeeth(range);

          const newDetails = range.map((num) => {
            const existing = toothDetails.find((d) => Number(d.toothNumber) === Number(num));
            return existing || {
              toothNumber: num,
              colorId: null,
              metalId: null,
              ceramicId: null,
            };
          });
          setToothDetails(newDetails);
        } else {
          setBridgeStart(toothNum);
          setBridgeEnd(null);
          setSelectedTeeth([toothNum]);
          setToothDetails([
            {
              toothNumber: toothNum,
              colorId: null,
              metalId: null,
              ceramicId: null,
            }
          ]);
          setShadeZones({});
        }
      }
    } else {
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

      // Diş silinəndə shade zone-ları da sil
      if (isSelected) {
        setShadeZones(prev => {
          const updated = { ...prev };
          delete updated[toothNum];
          return updated;
        });
      }
    }
  };

  const handleShadeZoneChange = (toothNum, zones) => {
    setShadeZones(prev => ({ ...prev, [toothNum]: zones }));
  };

  const handleBridgeShadeChange = (zones) => {
    setShadeZones(prev => {
      const updated = { ...prev };
      selectedTeeth.forEach((toothNum) => {
        updated[toothNum] = zones;
      });
      return updated;
    });
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

      // Prepare tooth detail IDs — shade zones daxil
      // Hər diş üçün: əgər shadeZones varsa 3 ayrı entry (CROWN/MIDDLE/GUM),
      // əgər yoxdursa köhnə üsulla (ümumi rəng + metal + keramika)
      const toothDetailIds = [];

      resolvedTeethIds.forEach((teethId) => {
        const dbTooth = currentDbTeeth.find((t) => Number(t.id) === Number(teethId));
        const toothNo = dbTooth ? dbTooth.toothNo : null;
        const localDetail = toothDetails.find((d) => Number(d.toothNumber) === Number(toothNo)) || {};
        const metalId = localDetail.metalId ? Number(localDetail.metalId) : (data.metal ? Number(data.metal) : null);
        const ceramicId = localDetail.ceramicId ? Number(localDetail.ceramicId) : (data.ceramic ? Number(data.ceramic) : null);

        const zones = shadeZones[toothNo];
        const hasZones = zones && (zones.CROWN || zones.MIDDLE || zones.GUM);

        if (hasZones) {
          // Hər zona üçün ayrıca entry
          ["CROWN", "MIDDLE", "GUM"].forEach((section) => {
            const colorId = zones[section] ? Number(zones[section]) : null;
            if (colorId || metalId || ceramicId) {
              toothDetailIds.push({ colorId, metalId, ceramicId, toothSection: section });
            }
          });
        } else {
          // Zone seçilməyibsə ümumi rəng ilə köhnə üsul
          const colorId = localDetail.colorId ? Number(localDetail.colorId) : (data.color ? Number(data.color) : null);
          if (colorId !== null || metalId !== null || ceramicId !== null) {
            toothDetailIds.push({ colorId, metalId, ceramicId, toothSection: null });
          }
        }
      });

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
        isBridge: selectionMode === "bridge",
        startTooth: selectionMode === "bridge" ? Number(bridgeStart) : null,
        endTooth: selectionMode === "bridge" ? Number(bridgeEnd) : null,
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

  const handlePrint = () => {
    const originalTitle = document.title;
    const patientName = selectedPatient?.label || "Xəstə";
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    document.title = `${patientName} - ${formattedDate}`;
    window.print();
    document.title = originalTitle;
  };

  const PrintArea = () => {
    const isSelected = (fdi) => selectedTeeth.includes(fdi);

    const urTeeth = [17, 16, 15, 14, 13, 12, 11];
    const ulTeeth = [21, 22, 23, 24, 25, 26, 27];
    const lrTeeth = [47, 46, 45, 44, 43, 42, 41];
    const llTeeth = [31, 32, 33, 34, 35, 36, 37];

    const has8 = selectedTeeth.some(t => [18, 28, 38, 48].includes(t));
    const isChildTeeth = selectedTeeth.some(t => t >= 51 && t <= 85);

    const ur = isChildTeeth ? [55, 54, 53, 52, 51] : (has8 ? [18, 17, 16, 15, 14, 13, 12, 11] : urTeeth);
    const ul = isChildTeeth ? [61, 62, 63, 64, 65] : (has8 ? [21, 22, 23, 24, 25, 26, 27, 28] : ulTeeth);
    const lr = isChildTeeth ? [85, 84, 83, 82, 81] : (has8 ? [48, 47, 46, 45, 44, 43, 42, 41] : lrTeeth);
    const ll = isChildTeeth ? [71, 72, 73, 74, 75] : (has8 ? [31, 32, 33, 34, 35, 36, 37, 38] : llTeeth);

    const formatLabel = (t) => {
      if (t >= 11 && t <= 18) return t - 10;
      if (t >= 21 && t <= 28) return t - 20;
      if (t >= 31 && t <= 38) return t - 30;
      if (t >= 41 && t <= 48) return t - 40;
      if (t >= 51 && t <= 55) return String.fromCharCode(65 + (t - 51));
      if (t >= 61 && t <= 65) return String.fromCharCode(65 + (t - 61));
      if (t >= 71 && t <= 75) return String.fromCharCode(65 + (t - 71));
      if (t >= 81 && t <= 85) return String.fromCharCode(65 + (t - 81));
      return t;
    };

    const halfLayout = (
      <div className="print-half">
        <div className="print-header">MÜASİR STOMATOLOGİYA</div>
        <div className="print-content">
          <div className="print-fields">
            <div className="print-field">
              <span className="print-field-label">Hakim adı:</span>
              <span className="print-field-value">{selectedDoctor?.label || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">Xəstənin adı:</span>
              <span className="print-field-value">{selectedPatient?.label || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">Texnikin adı:</span>
              <span className="print-field-value">{selectedTechnician?.label || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">İşin giriş vaxtı:</span>
              <span className="print-field-value">{formValues.orderDate || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">Mərkəzi oklyuziyanın təyini:</span>
              <span className="print-field-value">
                {formValues.inspectionDateK || formValues.inspectionDateM || "___________________________"}
              </span>
            </div>
            <div className="print-field">
              <span className="print-field-label">İşin yoxlanması:</span>
              <span className="print-field-value">{formValues.inspectionDateM || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">İşin təhvil vaxtı:</span>
              <span className="print-field-value">{formValues.deliveryDate || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">İşin növü:</span>
              <span className="print-field-value">
                {selectionMode === "bridge"
                  ? `Körpü (${bridgeStart}-${bridgeEnd})`
                  : (selectedWorkType?.label || "___________________________")}
              </span>
            </div>
            <div className="print-field">
              <span className="print-field-label">Qarnitur:</span>
              <span className="print-field-value">{formValues.garniture || "___________________________"}</span>
            </div>
            <div className="print-field">
              <span className="print-field-label">Rəng / Material:</span>
              <span className="print-field-value">
                {selectedColor?.label || "-"}{" / "}
                {selectedMetal?.label || "-"}{" - "}
                {selectedCeramic?.label || "-"}
              </span>
            </div>
          </div>
          <div className="print-sidebar">
            <div className="teeth-print-grid">
              {/* Upper Row */}
              <div className="teeth-row border-b border-black flex">
                <div className="w-1/2 border-r border-black pr-2 flex justify-end gap-1.5 py-1">
                  {ur.map(t => (
                    <span key={t} className={`tooth-print-num ${isSelected(t) ? 'selected-tooth' : ''}`}>
                      {formatLabel(t)}
                    </span>
                  ))}
                </div>
                <div className="w-1/2 pl-2 flex justify-start gap-1.5 py-1">
                  {ul.map(t => (
                    <span key={t} className={`tooth-print-num ${isSelected(t) ? 'selected-tooth' : ''}`}>
                      {formatLabel(t)}
                    </span>
                  ))}
                </div>
              </div>
              {/* Lower Row */}
              <div className="teeth-row flex">
                <div className="w-1/2 border-r border-black pr-2 flex justify-end gap-1.5 py-1">
                  {lr.map(t => (
                    <span key={t} className={`tooth-print-num ${isSelected(t) ? 'selected-tooth' : ''}`}>
                      {formatLabel(t)}
                    </span>
                  ))}
                </div>
                <div className="w-1/2 pl-2 flex justify-start gap-1.5 py-1">
                  {ll.map(t => (
                    <span key={t} className={`tooth-print-num ${isSelected(t) ? 'selected-tooth' : ''}`}>
                      {formatLabel(t)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="print-notes">
              <strong>Hesabat / Qeyd:</strong>
              <div className="mt-1">{formValues.report || "-"}</div>
            </div>

            <div className="print-signature">
              İmza: __________________
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="print-container">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
          .print-container {
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          @media print {
            .print-container {
              display: block !important;
            }
          }
          .print-page {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
          }
          .print-half {
            height: 46vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 15px;
            border: 2px dashed #333;
            margin-bottom: 25px;
            box-sizing: border-box;
          }
          .print-header {
            text-align: center;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-bottom: 8px;
            border-bottom: 2px solid #000;
            padding-bottom: 4px;
          }
          .print-content {
            display: flex;
            flex: 1;
            gap: 15px;
          }
          .print-fields {
            width: 58%;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .print-field {
            display: flex;
            border-bottom: 1px dotted #444;
            padding-bottom: 1px;
            font-size: 10px;
            line-height: 1.3;
          }
          .print-field-label {
            font-weight: 700;
            width: 150px;
            color: #111;
          }
          .print-field-value {
            flex: 1;
            color: #000;
          }
          .print-sidebar {
            width: 42%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-left: 1px solid #888;
            padding-left: 15px;
          }
          .teeth-print-grid {
            border: 1.5px solid #000;
            padding: 6px;
            border-radius: 4px;
            background: #fff;
          }
          .teeth-row {
            display: flex;
          }
          .tooth-print-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 50%;
            border: 1px solid transparent;
            color: #333;
          }
          .tooth-print-num.selected-tooth {
            border-color: #000;
            background-color: #000;
            color: #fff;
          }
          .print-notes {
            font-size: 9px;
            border: 1px solid #777;
            padding: 5px;
            border-radius: 4px;
            background: #fff;
            min-height: 45px;
            max-height: 75px;
            overflow: hidden;
            line-height: 1.3;
          }
          .print-signature {
            text-align: right;
            font-size: 10px;
            font-weight: 700;
            margin-top: 3px;
          }
        `}} />
        <div className="print-page">
          {halfLayout}
          {halfLayout}
        </div>
      </div>
    );
  };

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

          <div className="flex flex-wrap gap-2">
            {/* Adult/Child Toggle */}
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
                  setBridgeStart(null);
                  setBridgeEnd(null);
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
                  setBridgeStart(null);
                  setBridgeEnd(null);
                }}
              >
                Uşaq
              </button>
            </div>

            {/* Selection Mode Toggle */}
            <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200">
              <button
                type="button"
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectionMode === "single" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  if (mode === "view") return;
                  setSelectionMode("single");
                  setBridgeStart(null);
                  setBridgeEnd(null);
                }}
              >
                Təkli Seçim
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectionMode === "bridge" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  if (mode === "view") return;
                  setSelectionMode("bridge");
                  setBridgeStart(null);
                  setBridgeEnd(null);
                  setSelectedTeeth([]);
                  setToothDetails([]);
                }}
              >
                Körpü (Bridge)
              </button>
            </div>
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

        {selectionMode === "bridge" && bridgeStart ? (
          <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-semibold text-[10px] uppercase">Körpü</span>
              <span className="font-bold text-sm">
                Körpü Sifarişi: {bridgeStart} {bridgeEnd ? ` → ${bridgeEnd}` : " (Son dişi seçin)"}
              </span>
            </div>
            {bridgeEnd && (
              <div>
                <span className="font-semibold text-gray-700">Körpüdəki dişlər ({selectedTeeth.length}):</span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-100">{selectedTeeth.sort((a,b) => a-b).join(", ")}</span>
              </div>
            )}
          </div>
        ) : selectedTeeth.length > 0 && (
          <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
            <span className="font-semibold">Seçilmiş dişlər ({selectedTeeth.length}):</span>{" "}
            {selectedTeeth.sort((a,b) => a-b).join(", ")}
          </div>
        )}
      </div>

      {/* Diş Rəngi Seçimi — Hər diş üçün zona-bazlı shade */}
      {selectedTeeth.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Diş Rəngi (Shade) Seçimi
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {selectionMode === "bridge" 
                ? "Körpü üçün shade seçin (bütün körpü dişlərinə tətbiq olunacaq) — Tac (üst), Orta, Diş əti (aşağı)"
                : "Hər dişin üzərindəki hissəyə klik edərək fərqli shade seçin — Tac (üst), Orta, Diş əti (aşağı)"}
            </p>
          </div>

          {selectionMode === "bridge" ? (
            <div className="bg-gray-50 rounded-xl border border-purple-200 p-4">
              <ToothShadeSelector
                colors={colors}
                shadeZones={selectedTeeth.length > 0 ? (shadeZones[selectedTeeth[0]] || {}) : {}}
                onChange={handleBridgeShadeChange}
                disabled={mode === "view"}
                isBridge={true}
                bridgeTeeth={selectedTeeth.sort((a, b) => a - b)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {selectedTeeth.sort((a, b) => a - b).map((toothNum) => (
                <div
                  key={toothNum}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-3 hover:border-purple-200 transition-colors"
                >
                  <ToothShadeSelector
                    colors={colors}
                    shadeZones={shadeZones[toothNum] || {}}
                    onChange={(zones) => handleShadeZoneChange(toothNum, zones)}
                    disabled={mode === "view"}
                    toothNumber={toothNum}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              placeholder={mode === "view" ? "Məlumat yoxdur" : "Rəng seçin (məs: A2)"}
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
              placeholder={mode === "view" ? "Məlumat yoxdur" : "Metal növünü seçin"}
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
              placeholder={mode === "view" ? "Məlumat yoxdur" : "Keramika növünü seçin"}
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
              placeholder={mode === "view" ? "Məlumat yoxdur" : "Metal işi təfərrüatları..."}
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
              placeholder={mode === "view" ? "Məlumat yoxdur" : "Keramika işi təfərrüatları..."}
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
            placeholder={mode === "view" ? "Məlumat yoxdur" : "Hesabat və əlavə qeydlər..."}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
          />
        </div>

        {/* Multi-file Attachments */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Əlavə olunmuş Fayllar / Şəkillər
          </label>
          {mode === "view" && (!initialData?.urls || initialData.urls.length === 0) && (!initialData?.files || initialData.files.length === 0) ? (
            <div className="text-sm text-gray-500 italic p-3 bg-gray-50 border border-gray-200 rounded-lg">Məlumat yoxdur</div>
          ) : (
            <MultiFileForm
              onFilesChange={handleFilesChange}
              mode={mode === "view" ? "info" : "edit"}
              initialFiles={initialData?.urls || initialData?.files || []}
            />
          )}
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

        {mode === "view" && (
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            Çap et
          </button>
        )}

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
      <PrintArea />
    </form>
  );
};

export default OrderForm;
