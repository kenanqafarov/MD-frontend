// React 19 uyumluluğu için antd patch'i - en üstte import edilmeli
import "@ant-design/v5-patch-for-react-19";
import { lazy, StrictMode, useEffect, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnimatePresence, motion } from "framer-motion";

// stores
import useAuthStore from "../stores/authStore";

// Components
import ErrorBoundary from "./components/ErrorBoundary";

// Utils
import { initWebVitals } from "./utils/webVitals";

// Initialize Web Vitals tracking
initWebVitals();

// Style
import "./assets/style/index.css";
import Examination from "./pages/patient/Examination.jsx";
import Images from "./pages/patient/Images.jsx";
import Videos from "./pages/patient/Videos.jsx";

// 🧱 Layouts
const Layout = lazy(() => import("./components/layout/Layout"));
const PatientLayout = lazy(() => import("./components/layout/PatientLayout"));

// 🔐 Auth Pages
const LogIn = lazy(() => import("./pages/LogIn"));
const ChangePassword = lazy(() =>
  import("./pages/ChangePassword/ChangePassword")
);

// 🧍‍♂️ Patient Pages
const PatientsList = lazy(() => import("./pages/Patients/PatientsList"));
const PatientAdd = lazy(() => import("./pages/Patients/PatientAdd"));
const PatientEdit = lazy(() => import("./pages/patient/PatientEdit"));
const General = lazy(() => import("./pages/patient/General"));
const Plans = lazy(() => import("./pages/patient/Plans/index"));
const Treatment = lazy(() => import("./pages/patient/Treatment/index.jsx"));
const History = lazy(() => import("./pages/patient/History"));
const EditHistory = lazy(() => import("./pages/patient/EditHistory"));
const Prescription = lazy(() => import("./pages/patient/Prescription"));
const ViewPrescription = lazy(() => import("./pages/patient/ViewPrescription"));
const AddPrescription = lazy(() => import("./pages/patient/AddPrescription"));
const CreateInsurance = lazy(() => import("./pages/patient/CreateInsurance"));
const ViewInsurance = lazy(() => import("./pages/patient/ViewInsurance"));
const Insurance = lazy(() => import("./pages/patient/Insurance"));
const XRay = lazy(() => import("./pages/patient/XRay"));
const InfoXray = lazy(() => import("./pages/patient/InfoXray"));
const EditXray = lazy(() => import("./pages/patient/EditXray"));
const AddXRay = lazy(() => import("./pages/patient/AddXray"));
const InfoInsurancePatient = lazy(() =>
  import("./pages/patient/InfoInsurancePatient.jsx")
);
const PlanCompare = lazy(() => import("./pages/patient/PlanCompare"));
const EditPlan = lazy(() => import("./pages/patient/EditPlan"));
const CreatePlan = lazy(() => import("./pages/patient/CreatePlan"));
const PatientReport = lazy(() => import("./pages/patient/PatientReport"));

// 👥 Employee Pages
const EmployeesList = lazy(() => import("./pages/Employees/EmployeesList"));
const EmployeeAdd = lazy(() => import("./pages/Employees/EmployeeAdd"));
const EmployeeDetails = lazy(() => import("./pages/Employees/EmployeeDetails"));
const EmployeeEdit = lazy(() => import("./pages/Employees/EmployeeEdit"));
const EmployeeSchedule = lazy(() =>
  import("./pages/Employees/EmployeeSchedule")
);
const EmployeeWorkScheduleList = lazy(() =>
  import("./pages/Employees/EmployeeWorkScheduleList")
);
const EmployeeWorkScheduleAdd = lazy(() =>
  import("./pages/Employees/EmployeeWorkScheduleAdd")
);
const EmployeeWorkScheduleEdit = lazy(() =>
  import("./pages/Employees/EmployeeWorkScheduleEdit")
);

// 📅 Appointment Pages
const Appointments = lazy(() => import("./pages/Appointments"));
const AddNewAppointment = lazy(() => import("./pages/AddNewAppointment"));
const RandevuCard = lazy(() => import("./pages/RandevuCard"));

// 📦 Stock Management
const ClinicStock = lazy(() => import("./pages/ClinicStock"));
const CabinetStock = lazy(() => import("./pages/CabinetStock"));

// 📥 Stock Import
const StockImportList = lazy(() =>
  import("./pages/stockImport/StockImportList")
);
const AddStockImport = lazy(() => import("./pages/stockImport/AddStockImport"));
const StockImportEdit = lazy(() =>
  import("./pages/stockImport/StockImportEdit")
);
const ImportDetail = lazy(() => import("./pages/stockImport/ImportDetail"));

// 📦 Stock Order
const StockOrderList = lazy(() => import("./pages/stockOrder/StockOrderList"));
const AddStockOrder = lazy(() => import("./pages/stockOrder/AddStockOrder"));
const StockOrderEdit = lazy(() => import("./pages/stockOrder/StockOrderEdit"));
const StockOrderDetail = lazy(() =>
  import("./pages/stockOrder/StockOrderDetail")
);

// 🗑️ Stock Delete
const StockDeleteList = lazy(() =>
  import("./pages/stockDelete/StockDeleteList")
);
const AddStockDelete = lazy(() => import("./pages/stockDelete/AddStockDelete"));
const StockDeleteDetail = lazy(() =>
  import("./pages/stockDelete/StockDeleteDetail")
);

// 📥 Stock Entry
const StockEntryList = lazy(() => import("./pages/stockEntry/StockEntryList"));
const StockEntryDetail = lazy(() =>
  import("./pages/stockEntry/StockEntryDetail")
);

// 📤 Stock Export
const StockExportList = lazy(() =>
  import("./pages/stockExport/StockExportList")
);
const StockExports = lazy(() => import("./pages/stockExport/StockExports"));
const AddExportStock = lazy(() => import("./pages/stockExport/AddExportStock"));
const InfoExportStock = lazy(() =>
  import("./pages/stockExport/InfoExportStock")
);
const EditExportStock = lazy(() =>
  import("./pages/stockExport/EditExportStock")
);

// ⚙️ Product Usage
const ProductUsageList = lazy(() =>
  import("./pages/productUsage/ProductUsageList")
);
const ProductUsageDetail = lazy(() =>
  import("./pages/productUsage/ProductUsageDetail")
);

// 🏷️ Product Category
const ProductCategory = lazy(() =>
  import("./pages/ProductCategory/ProductCategory")
);
const AddProductCategory = lazy(() =>
  import("./pages/ProductCategory/AddProductCategory")
);
const EditProductCategory = lazy(() =>
  import("./pages/ProductCategory/EditProductCategory")
);
const Products = lazy(() => import("./pages/ProductCategory/Products"));
const AddProduct = lazy(() => import("./pages/ProductCategory/AddProduct"));
const EditProduct = lazy(() => import("./pages/ProductCategory/EditProduct"));

// 🧪 Laboratory
const AddOrder = lazy(() => import("./pages/AddOrder"));
const ReceivedOrders = lazy(() => import("./pages/Laboratory/ReceivedOrders"));
const SentOrders = lazy(() => import("./pages/Laboratory/SentOrders"));
const TechnicalsReport = lazy(() =>
  import("./pages/Laboratory/TechnicalsReport")
);
const OrderDetail = lazy(() => import("./pages/Laboratory/OrderDetail"));

// ⚙️ Settings
const ColorList = lazy(() => import("./pages/settings/colors/ColorList"));
const ColorDetail = lazy(() => import("./pages/settings/colors/ColorDetail"));
const InsuranceDetail = lazy(() =>
  import("./pages/settings/insurance/InsuranceDetail")
);

// �  Other Settings
const Specialities = lazy(() =>
  import("./pages/SpecialitiesPage/Specialities")
);
const AddSpeciality = lazy(() =>
  import("./pages/SpecialitiesPage/AddSpeciality")
);
const EditSpeciality = lazy(() =>
  import("./pages/SpecialitiesPage/EditSpeciality")
);
const AcademicDegrees = lazy(() =>
  import("./pages/AcademicDegrees/AcademicDegrees")
);
const AddAcademicDegrees = lazy(() =>
  import("./pages/AcademicDegrees/AddAcademicDegrees")
);
const EditAcademicDegrees = lazy(() =>
  import("./pages/AcademicDegrees/EditAcademicDegrees")
);
const Metals = lazy(() => import("./pages/Metals/Metals"));
const AddMetal = lazy(() => import("./pages/Metals/AddMetal"));
const EditMetal = lazy(() => import("./pages/Metals/EditMetal"));
const Ceramics = lazy(() => import("./pages/Ceramics/Ceramics"));
const AddCeramic = lazy(() => import("./pages/Ceramics/AddCeramic"));
const EditCeramic = lazy(() => import("./pages/Ceramics/EditCeramic"));
const OrderStatus = lazy(() => import("./pages/OrderStatus/OrderStatus"));
const AddOrderStatus = lazy(() => import("./pages/OrderStatus/AddOrderStatus"));
const EditOrderStatus = lazy(() =>
  import("./pages/OrderStatus/EditOrderStatus")
);
const Permissions = lazy(() => import("./pages/PermissionsPage/Permissions"));
const AddPermission = lazy(() =>
  import("./pages/PermissionsPage/AddPermisssion")
);
const EditPermission = lazy(() =>
  import("./pages/PermissionsPage/EditPermission")
);
const InfoPermission = lazy(() =>
  import("./pages/PermissionsPage/InfoPermission")
);

// 🧾 Blacklist
const Blacklist = lazy(() => import("./pages/Blacklist/Blacklist"));
const BlacklistReasons = lazy(() =>
  import("./pages/BlackListReasons/BlacklistReasons")
);
const AddReason = lazy(() => import("./pages/BlackListReasons/AddReason"));
const EditReason = lazy(() => import("./pages/BlackListReasons/EditReason"));

// 👨‍🔧 Technicians
const Technicians = lazy(() => import("./pages/Technicians/Technicians"));
const TechniciansPrices = lazy(() =>
  import("./pages/Technicians/TechniciansPrices")
);
const AddTechnician = lazy(() => import("./pages/Technicians/AddTechnician"));
const EditTechnician = lazy(() => import("./pages/Technicians/EditTechnician"));
const InfoTechnician = lazy(() => import("./pages/Technicians/InfoTechnician"));

// 👤 Admin Users
const AdminUser = lazy(() => import("./pages/AdminUsers/AdminUser"));
const EditAdmin = lazy(() => import("./pages/AdminUsers/EditAdmin"));
const AddAdmin = lazy(() => import("./pages/AdminUsers/AddAdmin"));
const InfoAdmin = lazy(() => import("./pages/AdminUsers/InfoAdmin"));

// ⏳ Queue
const QueueList = lazy(() => import("./pages/Queue/QueueList"));
const AddQueue = lazy(() => import("./pages/Queue/AddQueue"));
const EditQueue = lazy(() => import("./pages/Queue/EditQueue"));

// 📊 Reports
const ReportsPage = lazy(() => import("./pages/Reports/ReportsPage"));

// 📅 Appointment Types
const AppointmentTypes = lazy(() =>
  import("./pages/AppointmentTypes/AppointmentTypes")
);
const AddAppointmentType = lazy(() =>
  import("./pages/AppointmentTypes/AddAppointmentTypes")
);
const EditAppointmentType = lazy(() =>
  import("./pages/AppointmentTypes/EditAppointmentTypes")
);

// ✅ Checklist
const ChecklistPage = lazy(() => import("./pages/ChecklistPage/ChecklistPage"));
const AddCheckList = lazy(() => import("./pages/ChecklistPage/AddChecklist"));
const EditCheckList = lazy(() => import("./pages/ChecklistPage/EditChecklist"));

// 🎨 Colors
const ColorsPage = lazy(() => import("./pages/ColorsPage/ColorsPage"));
const AddColor = lazy(() => import("./pages/ColorsPage/AddColor"));
const EditColor = lazy(() => import("./pages/ColorsPage/EditColor"));

// 💰 Price Category
const PriceCategory = lazy(() => import("./pages/PriceCategory/PriceCategory"));
const AddPriceCategory = lazy(() =>
  import("./pages/PriceCategory/AddPriceCategory")
);
const EditPriceCategory = lazy(() =>
  import("./pages/PriceCategory/EditPriceCategory")
);

// 🏢 Cabinets
const CabinetsPage = lazy(() => import("./pages/CabinetsPage/CabinetsPage"));
const AddCabinet = lazy(() => import("./pages/CabinetsPage/AddCabinet"));
const EditCabinet = lazy(() => import("./pages/CabinetsPage/EditCabinet"));

// 🧱 Other Objects
const OtherObjects = lazy(() => import("./pages/OtherObjects/OtherObjects"));
const AddObject = lazy(() => import("./pages/OtherObjects/AddObject"));
const EditObject = lazy(() => import("./pages/OtherObjects/EditObject"));

// 💡 Recommendations
const RecommendationsPage = lazy(() =>
  import("./pages/RecommendationsPage/RecommendationsPage")
);
const AddRecommendation = lazy(() =>
  import("./pages/RecommendationsPage/AddRecommendation")
);
const EditRecommendation = lazy(() =>
  import("./pages/RecommendationsPage/EditRecommendation")
);

// ⚙️ General Settings
const GeneralSettings = lazy(() =>
  import("./pages/GeneralSettings/GeneralSettings")
);
const EditSettings = lazy(() => import("./pages/GeneralSettings/EditSettings"));

// 🧩 Anamnesis
const AnamnesisCategoryList = lazy(() =>
  import("./pages/Anamnesis/AnamnesisCategoryList")
);
const AddAnamnesisCategory = lazy(() =>
  import("./pages/Anamnesis/AddAnamnesisCategory")
);
const EditAnamnesisCategory = lazy(() =>
  import("./pages/Anamnesis/EditAnamnesisCategory")
);
const AnamnesisList = lazy(() => import("./pages/Anamnesis/AnamnesisList"));
const AddAnamnesis = lazy(() => import("./pages/Anamnesis/AddAnamnesis"));
const EditAnamnesis = lazy(() =>
  import("./pages/Anamnesis/EditAnamnesisCategory")
);

// 💊 Recepts & Medicines
const ReceptsList = lazy(() => import("./pages/ReceptsPage/ReceptsList"));
const AddRecept = lazy(() => import("./pages/ReceptsPage/AddRecept"));
const EditRecept = lazy(() => import("./pages/ReceptsPage/EditRecept"));
const MedicinesList = lazy(() => import("./pages/ReceptsPage/MedicinesList"));
const AddMedicine = lazy(() => import("./pages/ReceptsPage/AddMedicine"));
const EditMedicine = lazy(() => import("./pages/ReceptsPage/EditMedicine"));

// 💳 Insurance
const InsuranceList = lazy(() => import("./pages/Insurance/InsuranceList"));
const AddInsurance = lazy(() => import("./pages/Insurance/AddInsurance"));
const EditInsurance = lazy(() => import("./pages/Insurance/EditInsurance"));

// 🦷 Dental Sets & Implants
const DentalSetList = lazy(() => import("./pages/DentalSet/DentalSetList"));
const AddDentalSet = lazy(() => import("./pages/DentalSet/AddDentalSet"));
const EditDentalSet = lazy(() => import("./pages/DentalSet/EditDentalSet"));
const ImplantsList = lazy(() => import("./pages/Implants/ImplantsList"));
const EditImplant = lazy(() => import("./pages/Implants/EditImplant"));
const AddImplant = lazy(() => import("./pages/Implants/AddImplant"));
const SizesList = lazy(() => import("./pages/Implants/SizesList"));
const EditSize = lazy(() => import("./pages/Implants/EditSize"));
const AddSize = lazy(() => import("./pages/Implants/AddSize"));

// 🧬 Operations
const OperationCategoryList = lazy(() =>
  import("./pages/Operations/OperationCategoryList")
);
const AddOperationCategory = lazy(() =>
  import("./pages/Operations/AddOperationCategory")
);
const EditOperationCategory = lazy(() =>
  import("./pages/Operations/EditOperationCategory")
);
const OperationList = lazy(() => import("./pages/Operations/OperationList"));
const EditOperation = lazy(() => import("./pages/Operations/EditOperation"));
const AddOperation = lazy(() => import("./pages/Operations/AddOperation"));

// 🦷 Teeth
const TeethList = lazy(() => import("./pages/Teeth/TeethList"));
const OperationPictures = lazy(() => import("./pages/Teeth/OperationPictures"));
const ExaminationPictures = lazy(() =>
  import("./pages/Teeth/ExaminationPictures")
);
const AddTeeth = lazy(() => import("./pages/Teeth/AddTeeth"));
const EditTeeth = lazy(() => import("./pages/Teeth/EditTeeth"));
const AddOperationPicture = lazy(() =>
  import("./pages/Teeth/AddOperationPicture")
);
const AddExaminationPicture = lazy(() =>
  import("./pages/Teeth/AddExaminationPicture")
);
const InfoExaminationPicture = lazy(() =>
  import("./pages/Teeth/InfoExaminationPicture")
);
const EditExaminationPicture = lazy(() =>
  import("./pages/Teeth/EditExaminationPicture")
);
const InfoOperationPicture = lazy(() =>
  import("./pages/Teeth/InfoOperationPicture")
);
const EditOperationPicture = lazy(() =>
  import("./pages/Teeth/EditOperationPicture")
);

// �  Home
const Home = lazy(() => import("./pages/Home/HomePhoto.jsx"));

// 🔀 Other
const Redirecter = lazy(() => import("./components/Redirecter.jsx"));

// 🔹 Patient Insurance Extensions
const AddInsurancePatient = lazy(() =>
  import("./pages/patient/AddInsurancePatient.jsx")
);
const EditInsurancePatient = lazy(() =>
  import("./pages/patient/EditInsurancePatient.jsx")
);
const PatientInsuranceBalance = lazy(() =>
  import("./pages/patient/PatientInsuranceBalance.jsx")
);
const PatientInsuranceBalanceAdd = lazy(() =>
  import("./pages/patient/PatientInsuranceBalanceAdd.jsx")
);
const PatientInsuranceBalanceEdit = lazy(() =>
  import("./pages/patient/PatientInsuranceBalanceEdit.jsx")
);
const PatientInsuranceBalanceInfo = lazy(() =>
  import("./pages/patient/PatientInsuranceBalanceInfo.jsx")
);
const EditPrescription = lazy(() =>
  import("./pages/patient/EditPrescription.jsx")
);

// 🔹 Laboratory Tech Reports
const AddTechReport = lazy(() =>
  import("./pages/Laboratory/AddTechReport.jsx")
);
const TechReportDetail = lazy(() =>
  import("./pages/Laboratory/TechReportDetail.jsx")
);

// Constants
const roomOptions = [
  { value: "1", label: "Otaq 1" },
  { value: "2", label: "Otaq 2" },
  { value: "3", label: "Otaq 3" },
  { value: "4", label: "Otaq 4" },
  { value: "5", label: "Otaq 5" },
];

const employees = [
  {
    id: 1,
    name: "Rüstəm Məmmədov",
    position: "Diş həkimi",
    schedule: [
      { date: "2025-03-25", startTime: "09:00", endTime: "14:00", room: "1" },
      { date: "2025-03-26", startTime: "10:00", endTime: "17:00", room: "2" },
      { date: "2025-03-27", startTime: "09:00", endTime: "13:00", room: "3" },
      { date: "2025-03-28", startTime: "14:00", endTime: "18:00", room: "1" },
      { date: "2025-03-29", startTime: "09:00", endTime: "15:00", room: "2" },
    ],
  },
  {
    id: 2,
    name: "Aysel Hüseynova",
    position: "Ortodont",
    schedule: [
      { date: "2025-03-25", startTime: "11:00", endTime: "18:00", room: "2" },
      { date: "2025-03-26", startTime: "09:00", endTime: "14:00", room: "3" },
      { date: "2025-03-27", startTime: "13:00", endTime: "18:00", room: "1" },
      { date: "2025-03-28", startTime: "09:00", endTime: "13:00", room: "2" },
      { date: "2025-03-29", startTime: "14:00", endTime: "18:00", room: "3" },
    ],
  },
  {
    id: 3,
    name: "Fərid Qafarov",
    position: "Cərrah",
    schedule: [
      { date: "2025-03-25", startTime: "09:00", endTime: "13:00", room: "3" },
      { date: "2025-03-26", startTime: "14:00", endTime: "18:00", room: "1" },
      { date: "2025-03-27", startTime: "09:00", endTime: "15:00", room: "2" },
      { date: "2025-03-28", startTime: "10:00", endTime: "16:00", room: "3" },
      { date: "2025-03-29", startTime: "09:00", endTime: "12:00", room: "1" },
    ],
  },
];

const WORK_HOURS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const WEEKDAYS_SHORT = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

// Loading Spinner Komponenti
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
      background: "#EEF2F6",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ color: "#666", fontFamily: "Open Sans, sans-serif" }}>
        Yüklənir...
      </p>
    </div>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// QueryClient konfiqurasiyası - Optimizasiya ilə
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dəqiqə
      gcTime: 10 * 60 * 1000, // 10 dəqiqə (cacheTime əvəzinə)
      refetchOnWindowFocus: false, // Window focus'ta refetch yapma
      refetchOnReconnect: true, // Bağlantı yenilendiğinde refetch yap
      retry: 1, // Sadece 1 kez retry yap
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnMount: false, // Mount'ta refetch yapma (cache'den kullan)
    },
    mutations: {
      retry: 1, // Mutation'larda da 1 kez retry
    },
  },
});

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ width: "100%", height: "100%" }}>
      {children}
    </motion.div>
  );
};

// Test
const AnimatedRoutes = () => {
  const loadTokenFromStorage = useAuthStore(
    (state) => state.loadTokenFromStorage
  );
  const location = useLocation();

  useEffect(() => {
    loadTokenFromStorage();
  }, [loadTokenFromStorage]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <div className="app-wrapper" key={location.pathname}>
        <Suspense fallback={<LoadingSpinner />}>
          <Redirecter />
          <Routes location={location}>
          {/* Auth Routes */}
          {/* <Route path="/" element={<LogIn />} /> */}
          <Route path="/login" element={<LogIn />} />

          <Route element={<Layout />}>
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/product-categories" element={<ProductCategory />} />
            <Route
              path="/product-categories/add"
              element={<AddProductCategory />}
            />
            <Route path="/patients" element={<PatientsList />} />
            <Route
              path="/product-categories/edit-category/:id"
              element={<EditProductCategory />}
            />
            <Route path="product-categories/:name" element={<Products />} />
            <Route
              path="product-categories/:name/add-new"
              element={<AddProduct />}
            />
            <Route
              path="product-categories/:name/edit-product/:id"
              element={<EditProduct />}
            />
            <Route path="/patients/add-patient" element={<PatientAdd />} />

            <Route path="patients/patient/:id" element={<PatientLayout />}>
              <Route path="general" element={<General />} />
              <Route path="examination" element={<Examination />} />
              <Route path="images" element={<Images />} />
              <Route path="video" element={<Videos />} />

              <Route path="edit" element={<PatientEdit />} />
              <Route path="report" element={<PatientReport />} />
              <Route path="plans" element={<Plans />} />
              <Route path="plan/edit" element={<EditPlan />} />
              <Route path="plan/create" element={<CreatePlan />} />
              <Route path="compare-plans" element={<PlanCompare />} />
              <Route path="history" element={<History />} />
              <Route path="history/edit" element={<EditHistory />} />
              <Route path="insurance" element={<Insurance />} />
              <Route path="insurance/add" element={<AddInsurancePatient />} />
              <Route
                path="insurance/info/:id"
                element={<InfoInsurancePatient />}
              />
              <Route
                path="insurance/edit/:insuranceId"
                element={<EditInsurancePatient />}
              />
              <Route
                path="insurance/insurance-balance/:id"
                element={<PatientInsuranceBalance />}
              />
              <Route
                path="insurance/insurance-balance/:id/add"
                element={<PatientInsuranceBalanceAdd />}
              />
              <Route
                path="insurance/insurance-balance/:id/edit/:id"
                element={<PatientInsuranceBalanceEdit />}
              />
              <Route
                path="insurance/insurance-balance/:id/info/:id"
                element={<PatientInsuranceBalanceInfo />}
              />
              {/* <Route
                path="insurance/:id"
                element={<ViewInsurance mode="view" />}
              /> */}
              {/* <Route
                path="insurance/:id/edit"
                element={<ViewInsurance mode="edit" />}
              /> */}
              <Route path="insurance/create" element={<CreateInsurance />} />
              <Route path="treatment" element={<Treatment />} />
              <Route path="xray" element={<XRay />} />
              <Route path="xray/info/:id" element={<InfoXray />} />
              <Route path="xray/edit/:id" element={<EditXray />} />
              <Route path="xray/add" element={<AddXRay />} />
              <Route path="prescription" element={<Prescription />} />
              <Route
                path="prescription/:prescriptionId"
                element={<ViewPrescription mode="view" />}
              />
              <Route
                path="prescription/add"
                element={<AddPrescription mode="view" />}
              />
              <Route
                path="prescription/:id/edit"
                element={<EditPrescription mode="edit" />}
              />
            </Route>

            <Route path="/" element={<Home />} />

            {/* Employee Routes */}
            <Route path="/employees" element={<EmployeesList />} />
            <Route path="/employees/employee-add" element={<EmployeeAdd />} />
            <Route
              path="/employees/employee/:id"
              element={<EmployeeDetails />}
            />
            <Route
              path="/employees/edit-employee/:id"
              element={<EmployeeEdit />}
            />
            <Route
              path="/employees/employee-schedule"
              element={<EmployeeSchedule />}
            />
            <Route
              path="employees/work-schedule/:id"
              element={<EmployeeWorkScheduleList />}
            />
            <Route
              path="employees/work-schedule/:id/add"
              element={<EmployeeWorkScheduleAdd />}
            />
            <Route
              path="employees/work-schedule/:id/edit"
              element={<EmployeeWorkScheduleEdit />}
            />

            {/* Appointment Routes */}
            <Route
              path="/appointments"
              element={
                <Appointments
                  roomOptions={roomOptions}
                  employees={employees}
                  WORK_HOURS={WORK_HOURS}
                  WEEKDAYS_SHORT={WEEKDAYS_SHORT}
                />
              }
            />
            <Route
              path="/appointments/add"
              element={
                <AddNewAppointment
                  roomOptions={roomOptions}
                  employees={employees}
                  WORK_HOURS={WORK_HOURS}
                  WEEKDAYS_SHORT={WEEKDAYS_SHORT}
                />
              }
            />
            <Route
              path="/appointment/card"
              element={
                <RandevuCard
                  roomOptions={roomOptions}
                  employees={employees}
                  WORK_HOURS={WORK_HOURS}
                  WEEKDAYS_SHORT={WEEKDAYS_SHORT}
                />
              }
            />

            {/* Stock Management Routes */}
            <Route path="/stock/clinic" element={<ClinicStock />} />
            <Route path="/stock/cabinet" element={<CabinetStock />} />
            <Route path="/stock/export" element={<StockExportList />} />

            {/* Stock Import Routes */}
            <Route path="/stock/import" element={<StockImportList />} />
            <Route path="/stock/import/add" element={<AddStockImport />} />
            <Route
              path="/stock/import/edit/:id"
              element={<StockImportEdit />}
            />
            <Route
              path="/stock/import/:id"
              element={<ImportDetail mode="view" />}
            />

            {/* Stock Order Routes */}
            <Route path="/stock/order" element={<StockOrderList />} />
            <Route
              path="/stock/order/detail/:id"
              element={<StockOrderDetail mode="view" />}
            />
            <Route path="/stock/order/add" element={<AddStockOrder />} />
            <Route path="/stock/order/edit/:id" element={<StockOrderEdit />} />

            {/* Stock Delete Routes */}
            <Route path="/stock/delete" element={<StockDeleteList />} />
            <Route path="/stock/delete/add" element={<AddStockDelete />} />
            <Route path="/stock/delete/:id" element={<StockDeleteDetail mode="view" />} />
            <Route
              path="/stock/delete/:id/edit"
              element={<StockDeleteDetail mode="edit" />}
            />

            {/* Laboratory Detail Route */}
            <Route path="/lab/orders/:id" element={<OrderDetail />} />

            {/* Stock Entry Routes */}
            <Route path="/stock/entry" element={<StockEntryList />} />
            <Route path="/stock/entry/:id" element={<StockEntryDetail />} />

            {/* Stock Export Routes */}
            <Route path="/stock/export" element={<StockExportList />} />
            <Route path="/stock/export/:id/add" element={<AddExportStock />} />
            <Route path="/stock/export/info/:id" element={<InfoExportStock />} />
            <Route
              path="/stock/export/:id/detail/edit"
              element={<EditExportStock />}
            />
            <Route
              path="/stock/export/:id/detail"
              element={<InfoExportStock />}
            />
            <Route
              path="/stock/export/:id/edit"
              element={<EditExportStock />}
            />
            <Route path="/stock/export/:id" element={<StockExports />} />

            {/* Product Usage Routes */}
            <Route path="/stock/usage" element={<ProductUsageList />} />
            <Route path="/stock/usage/:id" element={<ProductUsageDetail />} />

            {/* Product Category Routes */}
            <Route path="/product-categories" element={<ProductCategory />} />
            <Route
              path="/product-categories/add-new"
              element={<AddProductCategory />}
            />
            <Route
              path="/product-categories/edit-category/:id"
              element={<EditProductCategory />}
            />
            <Route path="product-categories/:name" element={<Products />} />
            <Route
              path="product-categories/:name/add-new"
              element={<AddProduct />}
            />
            <Route
              path="product-categories/:name/edit-product/:id"
              element={<EditProduct />}
            />

            {/* Laboratory Routes */}
            <Route path="/lab/order/add" element={<AddOrder />} />
            <Route path="/sent-orders" element={<SentOrders />} />
            <Route path="/received-orders" element={<ReceivedOrders />} />
            <Route path="/technicals-report" element={<TechnicalsReport />} />
            <Route path="/technicals-report/add" element={<AddTechReport />} />
            <Route
              path="/technicals-report/:techReportID"
              element={<TechReportDetail />}
            />

            {/* Settings Routes */}

            <Route path="/settings/color" element={<ColorList />} />
            <Route path="/settings/color/add" element={<AddColor />} />
            <Route path="/settings/color/:id" element={<ColorDetail />} />

            {/*<Route path="/settings/insurance" element={<InsuranceList />} />*/}
            {/*<Route path="/settings/insurance/add" element={<AddInsurance />} />*/}
            {/*<Route*/}
            {/*  path="/settings/insurance/:id"*/}
            {/*  element={<InsuranceDetail />}*/}
            {/*/>*/}

            {/* Other Settings Routes */}
            <Route path="/admin-users" element={<AdminUser />} />
            <Route path="/admin-users/edit/:id" element={<EditAdmin />} />
            <Route path="/admin-users/info/:id" element={<InfoAdmin />} />

            <Route path="/specialities" element={<Specialities />} />
            <Route path="/edit-speciality/:id" element={<EditSpeciality />} />
            <Route path="/specialities/add" element={<AddSpeciality />} />

            <Route path="/academic-degrees" element={<AcademicDegrees />} />
            <Route path="/edit-degree/:id" element={<EditAcademicDegrees />} />
            <Route path="/add-degree" element={<AddAcademicDegrees />} />

            <Route path="/metals" element={<Metals />} />
            <Route path="/metals/edit/:id" element={<EditMetal />} />
            <Route path="/metals/add" element={<AddMetal />} />

            <Route path="/ceramics" element={<Ceramics />} />
            <Route path="/ceramics/edit/:id" element={<EditCeramic />} />
            <Route path="/ceramics/add" element={<AddCeramic />} />

            <Route path="/order-status" element={<OrderStatus />} />
            <Route path="/add-order-status" element={<AddOrderStatus />} />
            <Route path="/edit-order-status" element={<EditOrderStatus />} />

            <Route path="/permissions" element={<Permissions />} />
            <Route path="/permissions/add" element={<AddPermission />} />
            <Route path="/permissions/edit/:id" element={<EditPermission />} />
            <Route path="/permissions/info/:id" element={<InfoPermission />} />

            <Route path="/blacklist" element={<Blacklist />} />
            <Route path="/blacklist-reasons" element={<BlacklistReasons />} />
            <Route path="/add-reason" element={<AddReason />} />
            <Route path="/edit-reason/:id" element={<EditReason />} />

            <Route path="/technicians" element={<Technicians />} />
            <Route path="technicians/:id" element={<InfoTechnician />} />
            <Route
              path="/technicians/prices/:id"
              element={<TechniciansPrices />}
            />
            <Route path="/technicians/add" element={<AddTechnician />} />
            <Route path="technicians/edit/:id" element={<EditTechnician />} />

            {/* Queue Management Routes */}
            <Route path="/queue" element={<QueueList />} />
            <Route path="/queue/add-new" element={<AddQueue />} />
            <Route path="/queue/edit-queue/:id" element={<EditQueue />} />

            {/*Appointment Types Routes  */}
            <Route path="/appointment-types" element={<AppointmentTypes />} />
            <Route
              path="/appointment-types/add"
              element={<AddAppointmentType />}
            />
            <Route
              path="/appointment-types/:id/edit"
              element={<EditAppointmentType />}
            />

            {/* AnamnesisList Page Routes */}
            <Route path="/anamnesis" element={<AnamnesisCategoryList />} />
            <Route
              path="/anamnesis/add-category"
              element={<AddAnamnesisCategory />}
            />
            <Route
              path="/anamnesis/edit-category/:id"
              element={<EditAnamnesisCategory />}
            />
            <Route
              path="/anamnesis/anamnesis-details/:categoryId"
              element={<AnamnesisList />}
            />
            <Route
              path="/anamnesis/anamnesis-details/:categoryId/add"
              element={<AddAnamnesis />}
            />
            <Route
              path="/anamnesis/anamnesis-details/:categoryId/edit/:id"
              element={<EditAnamnesis />}
            />
            {/* Checklist Page Routes */}
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="checklist/add" element={<AddCheckList />} />
            <Route path="checklist/:id/edit" element={<EditCheckList />} />

            {/* Colors Page Routes */}
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/colors/add" element={<AddColor />} />
            <Route path="/colors/:id/edit" element={<EditColor />} />

            {/* Price Category Page Routes */}
            <Route path="/price-category" element={<PriceCategory />} />
            <Route path="price-category/add" element={<AddPriceCategory />} />
            <Route
              path="price-category/:id/edit"
              element={<EditPriceCategory />}
            />

            {/* Cabinets Page Routes */}
            <Route path="/cabinets" element={<CabinetsPage />} />
            <Route path="/cabinets/add" element={<AddCabinet />} />
            <Route path="/cabinets/:id/edit" element={<EditCabinet />} />

            {/* Recepts Page Routes */}
            <Route path="/recepts" element={<ReceptsList />} />
            <Route path="/recepts/add" element={<AddRecept />} />
            <Route path="/recepts/edit/:id" element={<EditRecept />} />
            <Route path="/recepts/:id" element={<MedicinesList />} />
            <Route path="/recepts/:id/add" element={<AddMedicine />} />
            <Route path="/recepts/:id/edit/:id" element={<EditMedicine />} />
            {/* Insurance Page Routes */}
            <Route path="/insurance" element={<InsuranceList />} />
            <Route path="/insurance/add" element={<AddInsurance />} />
            <Route path="/insurance/edit/:id" element={<EditInsurance />} />

            {/* Dental Set Routes */}
            <Route path="/dental-set" element={<DentalSetList />} />
            <Route path="dental-set/add" element={<AddDentalSet />} />
            <Route path="dental-set/edit/:id" element={<EditDentalSet />} />

            {/* Reccomendations Page Routes */}
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route
              path="/recommendations/add"
              element={<AddRecommendation />}
            />
            <Route
              path="/recommendations/:id/edit"
              element={<EditRecommendation />}
            />

            {/* Implants Page Routes */}
            <Route path="/implants" element={<ImplantsList />} />
            <Route path="/implants/edit/:id" element={<EditImplant />} />
            <Route path="/implants/add" element={<AddImplant />} />
            <Route path="/implants/sizes/:id" element={<SizesList />} />
            <Route
              path="/implants/sizes/:name/edit/:id"
              element={<EditSize />}
            />
            <Route path="/implants/sizes/:id/add" element={<AddSize />} />

            {/* Operations Page Routes */}
            <Route path="/operations" element={<OperationCategoryList />} />
            <Route path="/operations/add" element={<AddOperationCategory />} />
            <Route
              path="/operations/edit/:id"
              element={<EditOperationCategory />}
            />
            <Route path="/operations/:id" element={<OperationList />} />
            <Route
              path="/operations/:name/edit/:id"
              element={<EditOperation />}
            />
            <Route path="/operations/:id/add" element={<AddOperation />} />

            {/* Teeth Pages Routes */}
            <Route path="/teeth" element={<TeethList />} />
            <Route path="/teeth/add" element={<AddTeeth />} />
            <Route path="/teeth/edit/:id" element={<EditTeeth />} />
            <Route
              path="/teeth/:id/operation-pictures"
              element={<OperationPictures />}
            />
            <Route
              path="/teeth/:id/operation-pictures/add"
              element={<AddOperationPicture />}
            />
            <Route
              path="/teeth/:id/operation-pictures/info/:operationId"
              element={<InfoOperationPicture />}
            />
            <Route
              path="/teeth/:id/operation-pictures/edit/:operationId"
              element={<EditOperationPicture />}
            />
            <Route
              path="/teeth/:id/examination-pictures"
              element={<ExaminationPictures />}
            />
            <Route
              path="/teeth/:id/examination-pictures/add"
              element={<AddExaminationPicture />}
            />
            <Route
              path="/teeth/:id/examination-pictures/info/:examinationId"
              element={<InfoExaminationPicture />}
            />
            <Route
              path="/teeth/:id/examination-pictures/edit/:examinationId"
              element={<EditExaminationPicture />}
            />

            {/* General Settings Routes */}
            <Route path="/general-settings" element={<GeneralSettings />} />
            <Route path="/general-settings/edit" element={<EditSettings />} />

            {/* Other Objects Routes */}
            <Route path="other-objects" element={<OtherObjects />} />
            <Route path="other-objects/add" element={<AddObject />} />
            <Route path="other-objects/:id/edit" element={<EditObject />} />

            {/* Other Routes */}

            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
        </Suspense>
      </div>
    </AnimatePresence>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AnimatedRoutes />
        </HashRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
