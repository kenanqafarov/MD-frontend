// src/pages/Home/HomeStatistics.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Style
import "../../assets/style/home.css";
import "./HomeStatistics.css";

// Icons
import { 
  FaDollarSign, 
  FaUsers, 
  FaWarehouse, 
  FaUserTie,
  FaCalendarAlt,
  FaUserPlus,
  FaClipboardList,
  FaChartLine,
  FaChevronDown
} from "react-icons/fa";

// Zustand Store importu
import useSidebarStore from '../../../stores/sidebarStore.js';

// Interactive Area Chart Component (Shadcn style)
const InteractiveAreaChart = ({ data, color = "#3b82f6", title, formatValue }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  
  // Early return if data is empty or invalid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="interactive-chart-container">
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          <div className="chart-total">
            <span className="total-label">Cəmi:</span>
            <span className="total-value">0</span>
          </div>
        </div>
        <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <p style={{ color: '#6b7280' }}>Məlumat yüklənir...</p>
        </div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Generate smooth curve points
  const points = data.map((point, index) => {
    const divisor = data.length > 1 ? data.length - 1 : 1;
    const x = padding.left + (index / divisor) * chartWidth;
    const y = padding.top + chartHeight - ((point.value - minValue) / range) * chartHeight;
    return { x, y, ...point, index };
  });
  
  // Create smooth path using quadratic curves
  const createSmoothPath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      if (i === 0) {
        path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
      } else {
        const prev = points[i - 1];
        const prevMidX = (prev.x + current.x) / 2;
        path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
      }
    }
    
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    
    return path;
  };
  
  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';
  
  const handleMouseMove = (e, point) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setHoveredIndex(point.index);
  };
  
  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };
  
  // Format value for display
  const formatDisplayValue = (value) => {
    if (formatValue) return formatValue(value);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };
  
  return (
    <div className="interactive-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-total">
          <span className="total-label">Cəmi:</span>
          <span className="total-value">{formatDisplayValue(data.reduce((sum, d) => sum + (d?.value || 0), 0))}</span>
        </div>
      </div>
      <div className="chart-wrapper" ref={svgRef}>
        <svg width={width} height={height} className="interactive-area-chart">
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <filter id={`glow-${color.replace('#', '')}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight - (ratio * chartHeight);
            const value = minValue + (range * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatDisplayValue(value)}
                </text>
              </g>
            );
          })}
          
          {/* Area */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#gradient-${color.replace('#', '')})`}
              className="chart-area"
            />
          )}
          
          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              className="chart-line"
              filter={`url(#glow-${color.replace('#', '')})`}
            />
          )}
          
          {/* Data points and hover zones */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Hover zone */}
              <rect
                x={point.x - chartWidth / (points.length * 2)}
                y={padding.top}
                width={chartWidth / points.length}
                height={chartHeight}
                fill="transparent"
                onMouseMove={(e) => handleMouseMove(e, point)}
                onMouseLeave={handleMouseLeave}
                className="hover-zone"
              />
              
              {/* Point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 6 : 4}
                fill={color}
                stroke="#fff"
                strokeWidth={hoveredIndex === index ? 3 : 2}
                className="chart-point"
                style={{
                  transition: 'all 0.2s ease',
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.3
                }}
              />
              
              {/* X-axis labels */}
              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {point.label}
              </text>
            </g>
          ))}
          
          {/* Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g className="chart-tooltip-group">
              <line
                x1={points[hoveredIndex].x}
                y1={padding.top}
                x2={points[hoveredIndex].x}
                y2={padding.top + chartHeight}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            </g>
          )}
        </svg>
        
        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${points[hoveredIndex].x}px`,
              top: `${points[hoveredIndex].y - 50}px`,
            }}
          >
            <div className="tooltip-label">{points[hoveredIndex].label}</div>
            <div className="tooltip-value" style={{ color }}>
              {formatDisplayValue(points[hoveredIndex].value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function HomeStatistics() {
  const { toggleSidebar } = useSidebarStore();
  const [timeFilter, setTimeFilter] = useState('heftelik'); // günlük, heftelik, aylik, zamana-gore
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [realTimeData, setRealTimeData] = useState({
    gelir: [],
    musteriler: [],
    anbar: [],
    isciler: []
  });

  // Time filter options
  const timeFilterOptions = [
    { value: 'gunluk', label: 'Günlük' },
    { value: 'heftelik', label: 'Həftəlik' },
    { value: 'aylik', label: 'Aylıq' },
    { value: 'zamana-gore', label: 'Vaxta görə' },
  ];

  // Date range states for "Vaxta görə"
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29); // Default: last 30 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Generate data based on time filter
  const generateData = useCallback((type, filter, customStartDate = null, customEndDate = null) => {
    const now = new Date();
    let data = [];
    
    if (filter === 'gunluk') {
      // Last 24 hours (hourly)
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(date.getHours() - i);
        const baseValue = {
          gelir: 500 + Math.random() * 1000,
          musteriler: 2 + Math.random() * 5,
          anbar: 10 + Math.random() * 20,
          isciler: 12 + Math.random() * 2
        };
        data.push({
          label: date.getHours().toString().padStart(2, '0') + ':00',
          value: Math.round(baseValue[type] + Math.sin(i / 3) * 200)
        });
      }
    } else if (filter === 'heftelik') {
      // Last 7 days
      const days = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Bazar'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const baseValue = {
          gelir: 8000 + Math.random() * 5000,
          musteriler: 30 + Math.random() * 20,
          anbar: 200 + Math.random() * 100,
          isciler: 12 + Math.random() * 3
        };
        data.push({
          label: days[date.getDay()],
          value: Math.round(baseValue[type] + Math.sin(i) * 1000)
        });
      }
    } else if (filter === 'aylik') {
      // Last 12 months
      const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const baseValue = {
          gelir: 15000 + Math.random() * 10000,
          musteriler: 50 + Math.random() * 30,
          anbar: 300 + Math.random() * 100,
          isciler: 12 + Math.random() * 4
        };
        data.push({
          label: months[date.getMonth()],
          value: Math.round(baseValue[type] + Math.sin(i / 2) * 2000)
        });
      }
    } else if (filter === 'zamana-gore') {
      // Custom: Date range
      const start = new Date(customStartDate || startDate);
      const end = new Date(customEndDate || endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Limit to max 365 days for performance
      const maxDays = Math.min(diffDays, 365);
      const daysToShow = maxDays > 60 ? 60 : maxDays; // Show max 60 points
      const step = Math.max(1, Math.floor(maxDays / daysToShow));
      
      for (let i = 0; i <= maxDays; i += step) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        // Skip if date exceeds end date
        if (date > end) break;
        
        const baseValue = {
          gelir: 6000 + Math.random() * 4000,
          musteriler: 25 + Math.random() * 15,
          anbar: 250 + Math.random() * 80,
          isciler: 12 + Math.random() * 3
        };
        data.push({
          label: `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`,
          value: Math.round(baseValue[type] + Math.sin(i / 5) * 1500)
        });
      }
    }
    
    return data;
  }, [startDate, endDate]);

  // Initialize data on mount and update when filter changes
  useEffect(() => {
    setRealTimeData({
      gelir: generateData('gelir', timeFilter, startDate, endDate),
      musteriler: generateData('musteriler', timeFilter, startDate, endDate),
      anbar: generateData('anbar', timeFilter, startDate, endDate),
      isciler: generateData('isciler', timeFilter, startDate, endDate)
    });
  }, [timeFilter, startDate, endDate, generateData]);

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => {
        // Only update if data exists
        if (!prev.gelir || prev.gelir.length === 0) {
          return prev;
        }
        
        return {
          gelir: prev.gelir.map((item, index) => ({
            ...item,
            value: Math.max(0, item.value + Math.round((Math.random() - 0.5) * 100))
          })),
          musteriler: prev.musteriler.map((item, index) => ({
            ...item,
            value: Math.max(0, item.value + Math.round((Math.random() - 0.5) * 2))
          })),
          anbar: prev.anbar.map((item, index) => ({
            ...item,
            value: Math.max(0, item.value + Math.round((Math.random() - 0.5) * 5))
          })),
          isciler: prev.isciler.map((item, index) => ({
            ...item,
            value: Math.max(0, item.value + Math.round((Math.random() - 0.5) * 1))
          }))
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedFilter = timeFilterOptions.find(opt => opt.value === timeFilter);

  // Quick access links
  const quickAccessLinks = [
    { 
      icon: <FaCalendarAlt />, 
      label: 'Yeni Randevu', 
      path: '/appointments/add',
      color: '#3b82f6'
    },
    { 
      icon: <FaUserPlus />, 
      label: 'Yeni Pasient', 
      path: '/patients/add-patient',
      color: '#10b981'
    },
    { 
      icon: <FaClipboardList />, 
      label: 'Hesabatlar', 
      path: '/reports',
      color: '#f59e0b'
    }
  ];

  return (
    <>
      <motion.div
        className="HomeStatisticsWrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <main className="StatisticsContent">
          {/* Statistics Charts Section */}
          <section className="StatisticsChartsSection">
            <div className="section-header">
              <h2 className="section-title">Statistikalar</h2>
              
              {/* Time Filter Dropdown */}
              <div className="time-filter-wrapper">
                <div className="time-filter-dropdown" ref={dropdownRef}>
                  <button
                    className="time-filter-button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{selectedFilter?.label || 'Həftəlik'}</span>
                    <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="time-filter-menu">
                      {timeFilterOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`time-filter-option ${timeFilter === option.value ? 'active' : ''}`}
                          onClick={() => {
                            setTimeFilter(option.value);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range Picker - Only show when "Vaxta görə" is selected */}
                {timeFilter === 'zamana-gore' && (
                  <div className="date-range-picker">
                    <div className="date-input-group">
                      <label htmlFor="startDate" className="date-label">Başlanğıc:</label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          if (newStartDate <= endDate) {
                            setStartDate(newStartDate);
                          }
                        }}
                        max={endDate}
                        className="date-input"
                      />
                    </div>
                    <div className="date-separator">-</div>
                    <div className="date-input-group">
                      <label htmlFor="endDate" className="date-label">Son:</label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          if (newEndDate >= startDate) {
                            setEndDate(newEndDate);
                          }
                        }}
                        min={startDate}
                        max={new Date().toISOString().split('T')[0]}
                        className="date-input"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="charts-container">
              {/* Gelir Statistikası */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#10b98115' }}>
                    <FaDollarSign className="stat-icon" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <h3 className="stat-card-title">Gelir Statistikası</h3>
                    <p className="stat-card-subtitle">
                      {timeFilter === 'gunluk' ? 'Son 24 saat' : 
                       timeFilter === 'heftelik' ? 'Son 7 gün' : 
                       timeFilter === 'aylik' ? 'Son 12 ay' : 
                       `${startDate} - ${endDate}`}
                    </p>
                  </div>
                </div>
                <InteractiveAreaChart 
                  data={realTimeData.gelir} 
                  color="#10b981" 
                  title=""
                  formatValue={(val) => `${val.toLocaleString('az-AZ')} ₼`}
                />
              </div>

              {/* Müşterilerin Statistikası */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#3b82f615' }}>
                    <FaUsers className="stat-icon" style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 className="stat-card-title">Müşterilerin Statistikası</h3>
                    <p className="stat-card-subtitle">
                      {timeFilter === 'gunluk' ? 'Son 24 saat' : 
                       timeFilter === 'heftelik' ? 'Son 7 gün' : 
                       timeFilter === 'aylik' ? 'Son 12 ay' : 
                       `${startDate} - ${endDate}`}
                    </p>
                  </div>
                </div>
                <InteractiveAreaChart 
                  data={realTimeData.musteriler} 
                  color="#3b82f6" 
                  title=""
                  formatValue={(val) => `${val} nəfər`}
                />
              </div>

              {/* Anbar Statistikası */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#f59e0b15' }}>
                    <FaWarehouse className="stat-icon" style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <h3 className="stat-card-title">Anbar Statistikası</h3>
                    <p className="stat-card-subtitle">
                      {timeFilter === 'gunluk' ? 'Son 24 saat' : 
                       timeFilter === 'heftelik' ? 'Son 7 gün' : 
                       timeFilter === 'aylik' ? 'Son 12 ay' : 
                       `${startDate} - ${endDate}`}
                    </p>
                  </div>
                </div>
                <InteractiveAreaChart 
                  data={realTimeData.anbar} 
                  color="#f59e0b" 
                  title=""
                  formatValue={(val) => `${val} ədəd`}
                />
              </div>

              {/* İşcilərin Statistikası */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#8b5cf615' }}>
                    <FaUserTie className="stat-icon" style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h3 className="stat-card-title">İşcilərin Statistikası</h3>
                    <p className="stat-card-subtitle">
                      {timeFilter === 'gunluk' ? 'Son 24 saat' : 
                       timeFilter === 'heftelik' ? 'Son 7 gün' : 
                       timeFilter === 'aylik' ? 'Son 12 ay' : 
                       `${startDate} - ${endDate}`}
                    </p>
                  </div>
                </div>
                <InteractiveAreaChart 
                  data={realTimeData.isciler} 
                  color="#8b5cf6" 
                  title=""
                  formatValue={(val) => `${val} nəfər`}
                />
              </div>
            </div>
          </section>

          {/* Quick Access Section */}
          <section className="QuickAccessSection">
            <h2 className="section-title">Sürətli Keçid</h2>
            <div className="quick-access-grid">
              {quickAccessLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.path} 
                  className="quick-access-card"
                >
                  <div 
                    className="quick-access-icon" 
                    style={{ backgroundColor: `${link.color}15`, color: link.color }}
                  >
                    {link.icon}
                  </div>
                  <span className="quick-access-label">{link.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </motion.div>
    </>
  );
}

export default HomeStatistics;

