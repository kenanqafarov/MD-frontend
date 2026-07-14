import React, { useState, useEffect } from 'react';
import { HiArrowsUpDown } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

// Style
import "../../assets/style/ReportsPage/reports.css";

// Icons
import {
    FiDownload,
    FiClock,
    FiDollarSign,
    FiTrendingUp,
    FiUsers,
    FiPercent,
    FiActivity,
    FiRefreshCw,
    FiArrowLeft,
    FiCalendar,
    FiAlertCircle,
    FiAward
} from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { Link } from 'react-router-dom';

// Components
import CustomDropdown from '../../components/CustomDropdown';

// Store
import useGeneralCalendarStore from '../../../stores/appointments';
import usePriceCategoryStore from '../../../stores/priceCategoryStore';
import useOperationTypesStore from '../../../stores/operationsTypeStore';

// Mock database mapping periods to numbers and listings
const periodData = {
    "bu_ay": {
        cashCollected: 1927.50,
        patientCredit: 0.00,
        production: 2615.00,
        avgTicket: 321.25,
        paymentsCount: 6,
        treatmentsCount: 22,
        totalInvoiced: 1995.00,
        outstandingBalance: 477.50,
        overdueInvoicesCount: 1,
        collectionsTotal: 1450.00,
        newPatients: 11,
        noShowRate: 0.0,
        agingReceivables: 687.50,
        collectionsChart: [
            { date: "Jul 06", value: 250 },
            { date: "Jul 07", value: 400 },
            { date: "Jul 08", value: 380 },
            { date: "Jul 09", value: 620 },
            { date: "Jul 10", value: 810 },
            { date: "Jul 11", value: 1100 },
            { date: "Jul 12", value: 1450 }
        ],
        doctorsProduction: [
            { name: "Dr. Məryəm Səfərova", treatments: 21, amount: 2435.00, pct: 100 },
            { name: "Dr. Elvin Əliyev", treatments: 1, amount: 180.00, pct: 15 }
        ],
        paymentsMethod: [
            { name: "Direct debit", count: 1, amount: 780.00, color: "#6B7280" },
            { name: "Kart", count: 3, amount: 641.50, color: "#3B82F6" },
            { name: "Bank köçürməsi", count: 1, amount: 410.00, color: "#1D4ED8" },
            { name: "Nəğd", count: 1, amount: 96.00, color: "#10B981" }
        ],
        overdueInvoices: [
            { id: "FAC-2026-0007", client: "Muñoz Blanco, José Luis", dueDate: "İyun 29, 2026", daysOverdue: 15, amount: 410.00 }
        ],
        professionals: [
            { name: "Dr. Laura Sánchez Pérez", count: 5, amount: 1995.00 }
        ]
    },
    "bu_hefte": {
        cashCollected: 540.00,
        patientCredit: 120.00,
        production: 820.00,
        avgTicket: 135.00,
        paymentsCount: 4,
        treatmentsCount: 6,
        totalInvoiced: 640.00,
        outstandingBalance: 100.00,
        overdueInvoicesCount: 0,
        collectionsTotal: 450.00,
        newPatients: 3,
        noShowRate: 0.0,
        agingReceivables: 100.00,
        collectionsChart: [
            { date: "Mon", value: 80 },
            { date: "Tue", value: 150 },
            { date: "Wed", value: 240 },
            { date: "Thu", value: 310 },
            { date: "Fri", value: 450 }
        ],
        doctorsProduction: [
            { name: "Dr. Məryəm Səfərova", treatments: 5, amount: 640.00, pct: 100 },
            { name: "Dr. Elvin Əliyev", treatments: 1, amount: 180.00, pct: 28 }
        ],
        paymentsMethod: [
            { name: "Kart", count: 2, amount: 320.00, color: "#3B82F6" },
            { name: "Bank köçürməsi", count: 1, amount: 150.00, color: "#1D4ED8" },
            { name: "Nəğd", count: 1, amount: 70.00, color: "#10B981" }
        ],
        overdueInvoices: [],
        professionals: [
            { name: "Dr. Laura Sánchez Pérez", count: 2, amount: 640.00 }
        ]
    },
    "bu_il": {
        cashCollected: 24850.00,
        patientCredit: 1200.00,
        production: 32400.00,
        avgTicket: 345.00,
        paymentsCount: 85,
        treatmentsCount: 242,
        totalInvoiced: 26950.00,
        outstandingBalance: 2100.00,
        overdueInvoicesCount: 3,
        collectionsTotal: 21000.00,
        newPatients: 142,
        noShowRate: 4.8,
        agingReceivables: 3400.00,
        collectionsChart: [
            { date: "Jan-Mar", value: 5000 },
            { date: "Apr-Jun", value: 11000 },
            { date: "Jul-Sep", value: 16500 },
            { date: "Oct-Dec", value: 21000 }
        ],
        doctorsProduction: [
            { name: "Dr. Məryəm Səfərova", treatments: 180, amount: 21400.00, pct: 100 },
            { name: "Dr. Elvin Əliyev", treatments: 62, amount: 11000.00, pct: 51 }
        ],
        paymentsMethod: [
            { name: "Direct debit", count: 12, amount: 8400.00, color: "#6B7280" },
            { name: "Kart", count: 48, amount: 9250.00, color: "#3B82F6" },
            { name: "Bank köçürməsi", count: 15, amount: 5100.00, color: "#1D4ED8" },
            { name: "Nəğd", count: 22, amount: 2100.00, color: "#10B981" }
        ],
        overdueInvoices: [
            { id: "FAC-2026-0007", client: "Muñoz Blanco, José Luis", dueDate: "İyun 29, 2026", daysOverdue: 15, amount: 410.00 },
            { id: "FAC-2026-0012", client: "Elnur Quliyev", dueDate: "İyun 15, 2026", daysOverdue: 29, amount: 850.00 },
            { id: "FAC-2026-0015", client: "Aysel Məmmədova", dueDate: "May 10, 2026", daysOverdue: 65, amount: 840.00 }
        ],
        professionals: [
            { name: "Dr. Laura Sánchez Pérez", count: 52, amount: 19950.00 },
            { name: "Dr. Məryəm Səfərova", count: 33, amount: 7000.00 }
        ]
    }
};

function ReportsPage() {
    const { doctors, fetchDoctors } = useGeneralCalendarStore();
    const { categories, fetchCategories } = usePriceCategoryStore();
    const { operationTypes, fetchAll } = useOperationTypesStore();

    // Navigation tab: 'analitika', 'billing', 'detailed'
    const [activeTab, setActiveTab] = useState('analitika');
    const [selectedPeriod, setSelectedPeriod] = useState('bu_ay');
    const [isLoading, setIsLoading] = useState(false);
    const [fromDate, setFromDate] = useState('2026-06-30');
    const [toDate, setToDate] = useState('2026-07-14');

    // Detailed view states (Original filters)
    const [plannerDoctor, setPlannerDoctor] = useState(null);
    const [executorDoctor, setExecutorDoctor] = useState(null);
    const [category, setCategory] = useState(null);
    const [operation, setOperation] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Fetch doctors and options on mount
    useEffect(() => {
        fetchDoctors();
        fetchCategories();
        fetchAll();
    }, [fetchDoctors, fetchCategories, fetchAll]);

    // Format fetched data for dropdowns
    const formattedDoctors = doctors.map(doctor => ({
        value: doctor.doctorId,
        label: doctor.name + " " + doctor.surname
    }));

    const formattedCategories = categories.map(cat => ({
        value: cat.id,
        label: cat.name
    }));

    const formattedOperations = operationTypes.map(op => ({
        value: op.id,
        label: op.categoryName
    }));

    const handlePeriodChange = (val) => {
        setIsLoading(true);
        setSelectedPeriod(val);
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const triggerRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 400);
    };

    const handleDetailedSearch = () => {
        console.log("Detailed Search Filters:", {
            plannerDoctor,
            executorDoctor,
            category,
            operation,
            startDate,
            endDate
        });
    };

    const reportData = [
        {
            planDate: "01.05.2024",
            patient: "Elnur Quliyev",
            toothNo: "12",
            operation: "Implant",
            plannerDoctor: "Dr. Murad",
            price: "300 AZN",
            discount: "50 AZN",
            total: "250 AZN",
            executionDate: "05.05.2024",
            executorDoctor: "Dr. Aysel"
        },
        {
            planDate: "02.05.2024",
            patient: "Aysel Məmmədova",
            toothNo: "24",
            operation: "Diş Çəkimi",
            plannerDoctor: "Dr. Cavid",
            price: "80 AZN",
            discount: "0 AZN",
            total: "80 AZN",
            executionDate: "04.05.2024",
            executorDoctor: "Dr. Murad"
        }
    ];

    const activeData = periodData[selectedPeriod] || periodData["bu_ay"];

    // Helper to draw a custom SVG line chart path smoothly
    const renderLineChart = (chartData) => {
        if (!chartData || chartData.length === 0) return null;
        const width = 500;
        const height = 180;
        const padding = 30;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        const maxVal = Math.max(...chartData.map(d => d.value)) * 1.15 || 100;
        const points = chartData.map((d, index) => {
            const x = padding + (index / (chartData.length - 1)) * graphWidth;
            const y = height - padding - (d.value / maxVal) * graphHeight;
            return { x, y };
        });

        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            const cpY1 = points[i - 1].y;
            const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            const cpY2 = points[i].y;
            pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
        }

        const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return (
            <svg className="w-full h-44" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                    const y = padding + p * graphHeight;
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#F3F4F6"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}
                {/* Fill Area */}
                <path d={fillD} fill="url(#chartGradient)" />
                {/* Main Line */}
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                {/* Nodes */}
                {points.map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#FFFFFF"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            className="transition-all duration-200 hover:r-6"
                        />
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="10"
                            fill="#10b981"
                            fillOpacity="0"
                            className="hover:fill-opacity-10"
                        />
                    </g>
                ))}
                {/* X Axis Labels */}
                {chartData.map((d, i) => {
                    const x = padding + (i / (chartData.length - 1)) * graphWidth;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 8}
                            textAnchor="middle"
                            className="text-[10px] fill-gray-400 font-medium"
                        >
                            {d.date}
                        </text>
                    );
                })}
            </svg>
        );
    };

    return (
        <div className="reportsPageWrapper min-h-screen bg-[#F8FAFC] p-6 text-gray-800">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        📊 Hesabat Səhifəsi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Klinika fəaliyyəti, maliyyə axınları, faktura xülasələri və həkim məhsuldarlığı
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                        <FiArrowLeft className="text-gray-400" /> Geri
                    </Link>
                    <button
                        onClick={triggerRefresh}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                        <FiRefreshCw className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Yenilə
                    </button>
                </div>
            </div>

            {/* Modern custom Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-2xl w-fit mb-8 shadow-inner">
                <button
                    onClick={() => setActiveTab("analitika")}
                    className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all ${activeTab === "analitika"
                        ? "bg-white text-emerald-600 shadow-md border border-gray-100"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    📈 Analitika Dashboard
                </button>
                <button
                    onClick={() => setActiveTab("billing")}
                    className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all ${activeTab === "billing"
                        ? "bg-white text-blue-600 shadow-md border border-gray-100"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    🧾 Fakturalar & Ödənişlər
                </button>
                <button
                    onClick={() => setActiveTab("detailed")}
                    className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all ${activeTab === "detailed"
                        ? "bg-white text-purple-600 shadow-md border border-gray-100"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    📋 Ətraflı Log Hesabatı
                </button>
            </div>

            {/* Period Filter for Dashboard Views */}
            {activeTab !== 'detailed' && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-48">
                            <CustomDropdown
                                value={selectedPeriod}
                                onChange={(opt) => handlePeriodChange(opt.value)}
                                options={[
                                    { value: 'bu_ay', label: 'Bu ay' },
                                    { value: 'bu_hefte', label: 'Bu həftə' },
                                    { value: 'bu_il', label: 'Bu il' }
                                ]}
                                placeholder="Dövr seçin"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Tarixdən:</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 text-gray-700 bg-gray-50"
                            />
                            <span className="font-medium text-gray-700">Tarixə:</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 text-gray-700 bg-gray-50"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <FiActivity className="text-emerald-500" /> Real-time sinxronizasiya aktivdir
                    </div>
                </div>
            )}

            {/* Tab Contents with Framer Motion Animation */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium text-gray-500">Hesabat hazırlanır, zəhmət olmasa gözləyin...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab + "_" + selectedPeriod}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* TAB 1: ANALYTICS DASHBOARD */}
                        {activeTab === 'analitika' && (
                            <div className="space-y-6">
                                {/* 4 Top KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {/* Card 1: Cash Collected */}
                                    <div className="relative bg-white rounded-2xl border-l-4 border-emerald-500 shadow-sm p-5 border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">CASH COLLECTED</p>
                                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.cashCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">{activeData.paymentsCount} payments</p>

                                        {/* Tiny visual sparkline in background */}
                                        <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden opacity-40">
                                            <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
                                                <path d="M 0,20 Q 25,18 50,15 T 100,5 L 100,20 L 0,20 Z" fill="#D1FAE5" />
                                                <path d="M 0,20 Q 25,18 50,15 T 100,5" fill="none" stroke="#10B981" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Card 2: Patient Credit */}
                                    <div className="relative bg-white rounded-2xl border-l-4 border-blue-500 shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">PATIENT CREDIT</p>
                                            <span className="flex items-center text-[9px] font-bold text-gray-400 gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                <FiClock /> Today
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.patientCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">Unallocated advances</p>
                                    </div>

                                    {/* Card 3: Production */}
                                    <div className="relative bg-white rounded-2xl border-l-4 border-sky-400 shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">PRODUCTION</p>
                                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.production.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">{activeData.treatmentsCount} treatments</p>
                                    </div>

                                    {/* Card 4: Avg Ticket */}
                                    <div className="relative bg-white rounded-2xl border-l-4 border-gray-400 shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">AVG COLLECTED TICKET</p>
                                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.avgTicket.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">Over {activeData.paymentsCount} payments</p>
                                    </div>
                                </div>

                                {/* Middle Charts Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Collections Over Time Chart */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-7 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">COLLECTIONS OVER TIME</p>
                                            <h4 className="text-3xl font-extrabold text-gray-900 mt-1">₼{activeData.collectionsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                                        </div>
                                        <div className="mt-6">
                                            {renderLineChart(activeData.collectionsChart)}
                                        </div>
                                    </div>

                                    {/* Payment Method Breakdown */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-5 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-4">BY PAYMENT METHOD</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                                                {/* Custom Circular Donut SVG Chart */}
                                                <div className="sm:col-span-5 flex justify-center relative">
                                                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F4F6" strokeWidth="12" />
                                                        {/* Simple dynamic dash slices based on mock percentages */}
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray="140 251" strokeDashoffset="0" strokeLinecap="round" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1D4ED8" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-140" strokeLinecap="round" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-200" strokeLinecap="round" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6B7280" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" strokeLinecap="round" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Total</span>
                                                        <span className="text-sm font-extrabold text-gray-900">₼{activeData.cashCollected.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                </div>

                                                {/* List Legend */}
                                                <div className="sm:col-span-7 space-y-2.5">
                                                    {activeData.paymentsMethod.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between text-xs font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span className="text-gray-500">{item.name}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-gray-400 mr-2 text-[10px]">{item.count} pay</span>
                                                                <span className="text-gray-900 font-bold">₼{item.amount.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Production By Doctor Section */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-4">PRODUCTION BY DOCTOR</p>
                                    <div className="space-y-4">
                                        {activeData.doctorsProduction.map((doc, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
                                                <div className="flex items-center gap-3 w-56">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                                                        {doc.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{doc.treatments} treatments</p>
                                                    </div>
                                                </div>
                                                {/* Progress Bar Container */}
                                                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden relative">
                                                    <div
                                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${doc.pct}%` }}
                                                    />
                                                </div>
                                                <div className="text-right w-24">
                                                    <p className="text-sm font-extrabold text-gray-900">₼{doc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lower Grid for Patient counts & Aging Receivables */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left Column: Quick Stats Card */}
                                    <div className="md:col-span-4 flex flex-col gap-6">
                                        {/* New Patients Card */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">NEW PATIENTS</p>
                                            <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{activeData.newPatients}</h3>
                                            <p className="text-xs text-gray-400 mt-1 font-medium">68.8% of total appointments</p>
                                        </div>

                                        {/* No-Show Rate Card */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">NO-SHOW RATE</p>
                                            <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{activeData.noShowRate}%</h3>
                                            <p className="text-xs text-gray-400 mt-1 font-medium">100.0% completed</p>
                                        </div>
                                    </div>

                                    {/* Right Column: Aging Receivables */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">AGING RECEIVABLES</p>
                                                <span className="flex items-center text-[9px] font-bold text-gray-400 gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    <FiClock /> Today
                                                </span>
                                            </div>
                                            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.agingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            {/* 0-30 Days */}
                                            <div className="flex items-center justify-between gap-4 text-xs font-medium">
                                                <span className="w-20 text-gray-500">0 - 30 days</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: activeData.agingReceivables > 0 ? "100%" : "0%" }} />
                                                </div>
                                                <span className="text-gray-400 text-[10px] w-16 text-center">{activeData.agingReceivables > 0 ? "6 patients" : "0 patients"}</span>
                                                <span className="text-gray-900 font-bold w-16 text-right">₼{activeData.agingReceivables.toLocaleString()}</span>
                                            </div>
                                            {/* 31-60 Days */}
                                            <div className="flex items-center justify-between gap-4 text-xs font-medium">
                                                <span className="w-20 text-gray-500">31 - 60 days</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="bg-gray-200 h-full rounded-full" style={{ width: "0%" }} />
                                                </div>
                                                <span className="text-gray-400 text-[10px] w-16 text-center">0 patients</span>
                                                <span className="text-gray-900 font-bold w-16 text-right">₼0.00</span>
                                            </div>
                                            {/* 61-90 Days */}
                                            <div className="flex items-center justify-between gap-4 text-xs font-medium">
                                                <span className="w-20 text-gray-500">61 - 90 days</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="bg-gray-200 h-full rounded-full" style={{ width: "0%" }} />
                                                </div>
                                                <span className="text-gray-400 text-[10px] w-16 text-center">0 patients</span>
                                                <span className="text-gray-900 font-bold w-16 text-right">₼0.00</span>
                                            </div>
                                            {/* 90+ Days */}
                                            <div className="flex items-center justify-between gap-4 text-xs font-medium">
                                                <span className="w-20 text-gray-500">90+ days</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="bg-gray-200 h-full rounded-full" style={{ width: "0%" }} />
                                                </div>
                                                <span className="text-gray-400 text-[10px] w-16 text-center">0 patients</span>
                                                <span className="text-gray-900 font-bold w-16 text-right">₼0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: BILLING & INVOICES */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                {/* 4 Invoicing Metric Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {/* Total Invoiced */}
                                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total invoiced</p>
                                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">₼{activeData.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">{selectedPeriod === 'bu_il' ? '52 invoices' : '5 invoices'}</p>
                                    </div>

                                    {/* Total Collected */}
                                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total collected</p>
                                        <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">₼{activeData.cashCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-emerald-500 mt-1 font-medium">{selectedPeriod === 'bu_il' ? '82 payments' : '4 paid'}</p>
                                    </div>

                                    {/* Outstanding Balance */}
                                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Outstanding balance</p>
                                        <h3 className="text-3xl font-extrabold text-blue-600 mt-2">₼{activeData.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">Pending collection</p>
                                    </div>

                                    {/* Overdue */}
                                    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all relative">
                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Overdue</p>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <h3 className="text-3xl font-extrabold text-red-600">{activeData.overdueInvoicesCount}</h3>
                                            <span className="text-xs text-gray-500 font-medium">invoices</span>
                                        </div>
                                        {activeData.overdueInvoicesCount > 0 && (
                                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center animate-pulse">
                                                {activeData.overdueInvoicesCount}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Listings */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column listings */}
                                    <div className="space-y-6">
                                        {/* Payment Method Details */}
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">By payment method</h4>
                                            <div className="divide-y divide-gray-50">
                                                {activeData.paymentsMethod.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-3 text-xs">
                                                        <span className="text-gray-500 font-medium">{item.name}</span>
                                                        <div className="flex items-center gap-6">
                                                            <span className="text-gray-400 text-[10px]">{item.count} payments</span>
                                                            <span className="text-gray-900 font-bold">₼{item.amount.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* By professional */}
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">By professional</h4>
                                            <div className="divide-y divide-gray-50">
                                                {activeData.professionals.map((prof, i) => (
                                                    <div key={i} className="flex items-center justify-between py-3 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                                                                {prof.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="text-gray-700 font-semibold">{prof.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <span className="text-gray-400 text-[10px]">{prof.count} invoices</span>
                                                            <span className="text-gray-900 font-bold">₼{prof.amount.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column listings */}
                                    <div className="space-y-6">
                                        {/* VAT Summary */}
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">VAT summary</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs font-medium">
                                                    <thead>
                                                        <tr className="text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-100">
                                                            <th className="pb-2">VAT type</th>
                                                            <th className="pb-2 text-right">Base</th>
                                                            <th className="pb-2 text-right">Tax</th>
                                                            <th className="pb-2 text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        <tr className="border-b border-gray-50">
                                                            <td className="py-3 text-gray-500">Exento (0%)</td>
                                                            <td className="py-3 text-right font-semibold">₼{activeData.totalInvoiced.toLocaleString()}</td>
                                                            <td className="py-3 text-right text-gray-400">₼0.00</td>
                                                            <td className="py-3 text-right font-extrabold text-gray-900">₼{activeData.totalInvoiced.toLocaleString()}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Overdue invoices */}
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                                            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
                                                <h4 className="text-sm font-bold text-gray-900">Overdue invoices</h4>
                                                {activeData.overdueInvoices.length > 0 && (
                                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100 flex items-center gap-1">
                                                        <FiAlertCircle /> Action required
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3.5">
                                                {activeData.overdueInvoices.length === 0 ? (
                                                    <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                                        <FiAward className="text-emerald-500 text-2xl" />
                                                        <p className="text-xs font-semibold">Bütün fakturalar vaxtında ödənilib!</p>
                                                    </div>
                                                ) : (
                                                    activeData.overdueInvoices.map((inv, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3.5 bg-red-50/50 hover:bg-red-50 border border-red-100/50 rounded-xl transition-all">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900">{inv.id}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium">{inv.client}</p>
                                                                <p className="text-[9px] text-gray-400 mt-0.5 font-medium">Son tarix: {inv.dueDate}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-extrabold text-red-600">₼{inv.amount.toLocaleString()}</p>
                                                                <p className="text-[10px] text-red-500 font-bold mt-0.5">{inv.daysOverdue} days overdue</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: DETAILED SEARCH & DATA TABLE (Original Functional Layout) */}
                        {activeTab === 'detailed' && (
                            <div className="space-y-6">
                                {/* Search Panel wrapper */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-sm font-bold text-gray-900 mb-4">Planlaşdırılmış və İcra olunmuş Diş Əməliyyatlarının Log Jurnalı</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Planlayan həkim</label>
                                            <CustomDropdown
                                                value={plannerDoctor}
                                                onChange={(option) => setPlannerDoctor(option.value)}
                                                options={formattedDoctors}
                                                placeholder="Həkim seçin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">İcraçı həkim</label>
                                            <CustomDropdown
                                                value={executorDoctor}
                                                onChange={(option) => setExecutorDoctor(option.value)}
                                                options={formattedDoctors}
                                                placeholder="Həkim seçin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kateqoriya</label>
                                            <CustomDropdown
                                                value={category}
                                                onChange={(option) => setCategory(option.value)}
                                                options={formattedCategories}
                                                placeholder="Kateqoriya"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Əməliyyat</label>
                                            <CustomDropdown
                                                value={operation}
                                                onChange={(option) => setOperation(option.value)}
                                                options={formattedOperations}
                                                placeholder="Əməliyyat"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tarix baş.</label>
                                            <input
                                                value={startDate || ''}
                                                type="date"
                                                onChange={(e) => setStartDate(e.target.value)}
                                                placeholder="Tarix baş."
                                                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-purple-500 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tarix bit.</label>
                                            <input
                                                value={endDate || ''}
                                                type="date"
                                                onChange={(e) => setEndDate(e.target.value)}
                                                placeholder="Tarix bit."
                                                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-purple-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => {
                                                setPlannerDoctor(null);
                                                setExecutorDoctor(null);
                                                setCategory(null);
                                                setOperation(null);
                                                setStartDate(null);
                                                setEndDate(null);
                                            }}
                                            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all"
                                        >
                                            Sıfırla
                                        </button>
                                        <button
                                            onClick={handleDetailedSearch}
                                            className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                                        >
                                            <IoIosSearch className="text-sm" /> Axtar
                                        </button>
                                    </div>
                                </div>

                                {/* Table wrapper */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-[#EEF2F6]">
                                                <tr className="text-gray-700 font-bold border-b border-gray-100">
                                                    <th className="p-3.5 text-center w-12 border-r border-[#CDD5DF]">№</th>
                                                    <th className="p-3.5">
                                                        <span className="flex items-center gap-1 cursor-pointer select-none">
                                                            <HiArrowsUpDown className="text-gray-400" /> Plan tarixi
                                                        </span>
                                                    </th>
                                                    <th className="p-3.5">
                                                        <span className="flex items-center gap-1 cursor-pointer select-none">
                                                            <HiArrowsUpDown className="text-gray-400" /> Pasiyent
                                                        </span>
                                                    </th>
                                                    <th className="p-3.5 text-center">Diş №</th>
                                                    <th className="p-3.5">Əməliyyat</th>
                                                    <th className="p-3.5">Planlayan həkim</th>
                                                    <th className="p-3.5 text-right">Qiyməti</th>
                                                    <th className="p-3.5 text-right">Endirim</th>
                                                    <th className="p-3.5 text-right">Yekun</th>
                                                    <th className="p-3.5">İcra tarixi</th>
                                                    <th className="p-3.5">İcraçı həkim</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                                                {reportData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/70 transition-all">
                                                        <td className="p-3.5 text-center border-r border-[#CDD5DF] font-bold text-gray-900">{index + 1}</td>
                                                        <td className="p-3.5">{item.planDate}</td>
                                                        <td className="p-3.5 font-bold text-gray-900">{item.patient}</td>
                                                        <td className="p-3.5 text-center font-bold text-purple-600">{item.toothNo}</td>
                                                        <td className="p-3.5">{item.operation}</td>
                                                        <td className="p-3.5">{item.plannerDoctor}</td>
                                                        <td className="p-3.5 text-right font-semibold">{item.price}</td>
                                                        <td className="p-3.5 text-right text-red-500 font-semibold">{item.discount}</td>
                                                        <td className="p-3.5 text-right text-emerald-600 font-bold">{item.total}</td>
                                                        <td className="p-3.5">{item.executionDate}</td>
                                                        <td className="p-3.5">{item.executorDoctor}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary row */}
                                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-12 text-xs font-bold text-gray-700">
                                        <p className="text-gray-500">Yekun Cəmlər:</p>
                                        <p>Qiymət: <span className="text-gray-950 ml-1">380 AZN</span></p>
                                        <p>Endirim: <span className="text-red-500 ml-1">50 AZN</span></p>
                                        <p>Net Yekun: <span className="text-emerald-600 ml-1">330 AZN</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ReportsPage;