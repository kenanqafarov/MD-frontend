import { useState } from "react";

/**
 * Dental shade rəng xəritəsi — shade adına görə real rəngi qaytarır
 * Vita Classical shade sisteminə uyğun
 */
const SHADE_COLOR_MAP = {
  A1: "#F5EDDA", A2: "#EFE3C8", A3: "#E8D5A8", "A3.5": "#DFC89A", A4: "#D4B880",
  B1: "#F8F0DC", B2: "#F2E8C0", B3: "#EBDAA0", B4: "#E3CC85",
  C1: "#E8DFCC", C2: "#DDD3BC", C3: "#D2C5A8", C4: "#C8B890",
  D2: "#E8D8C0", D3: "#DDD0B0", D4: "#D4C4A0",
  BL1: "#FAF8F2", BL2: "#F5F2EA", BL3: "#F0EBE0", BL4: "#EAE2D4",
  DEFAULT: "#F0E6CC",
};

const getShadeColor = (shadeName) => {
  if (!shadeName) return null;
  const upper = shadeName.toUpperCase().trim();
  return SHADE_COLOR_MAP[upper] || SHADE_COLOR_MAP["DEFAULT"];
};

const ZONES = {
  CROWN: { label: "Tac (Üst)", icon: "⬆" },
  MIDDLE: { label: "Orta", icon: "◼" },
  GUM: { label: "Diş əti (Aşağı)", icon: "⬇" },
};

const ToothSVG = ({ shadeZones, colorMap, onZoneClick, activeZone, disabled }) => {
  const getZoneColor = (zone) => {
    const colorId = shadeZones?.[zone];
    if (!colorId) return zone === "GUM" ? "#fecaca" : "#faf5eb";
    const shade = colorMap[colorId];
    if (!shade) return zone === "GUM" ? "#fecaca" : "#faf5eb";
    return getShadeColor(shade.label) || "#faf5eb";
  };

  const crownColor = getZoneColor("CROWN");
  const middleColor = getZoneColor("MIDDLE");
  const gumColor = getZoneColor("GUM");
  const crownActive = activeZone === "CROWN";
  const middleActive = activeZone === "MIDDLE";
  const gumActive = activeZone === "GUM";

  return (
    <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full select-none">
      <defs>
        <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={crownColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={crownColor} />
          <stop offset="100%" stopColor={crownColor} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="middleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={middleColor} stopOpacity="0.85" />
          <stop offset="50%" stopColor={middleColor} />
          <stop offset="100%" stopColor={middleColor} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gumGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gumColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={gumColor} />
        </linearGradient>
      </defs>

      {/* GUM zone */}
      <path
        d="M22,88 C20,100 22,112 28,117 C35,122 45,122 52,117 C58,112 60,100 58,88 Z"
        fill="url(#gumGrad)"
        stroke={gumActive ? "#ef4444" : "#e5d5c0"}
        strokeWidth={gumActive ? "2.5" : "1"}
        onClick={() => !disabled && onZoneClick("GUM")}
        className={disabled ? "" : "cursor-pointer hover:opacity-75 transition-opacity"}
      />

      {/* MIDDLE zone */}
      <path
        d="M18,52 C17,60 18,72 22,80 C24,84 26,87 28,88 L52,88 C54,87 56,84 58,80 C62,72 63,60 62,52 Z"
        fill="url(#middleGrad)"
        stroke={middleActive ? "#f59e0b" : "#e5d5c0"}
        strokeWidth={middleActive ? "2.5" : "1"}
        onClick={() => !disabled && onZoneClick("MIDDLE")}
        className={disabled ? "" : "cursor-pointer hover:opacity-75 transition-opacity"}
      />

      {/* CROWN zone */}
      <path
        d="M20,12 C15,4 10,0 8,2 C5,4 6,14 8,22 C10,30 14,40 18,52 L62,52 C66,40 70,30 72,22 C74,14 75,4 72,2 C70,0 65,4 60,12 C56,20 50,28 45,30 C42,31 38,31 35,30 C30,28 24,20 20,12 Z"
        fill="url(#crownGrad)"
        stroke={crownActive ? "#3b82f6" : "#d4c4a0"}
        strokeWidth={crownActive ? "2.5" : "1"}
        onClick={() => !disabled && onZoneClick("CROWN")}
        className={disabled ? "" : "cursor-pointer hover:opacity-75 transition-opacity"}
      />

      {/* Highlight sheen */}
      <path
        d="M30,14 C28,12 26,10 27,8 C29,6 35,10 38,14 C40,17 40,20 38,22 C35,20 32,18 30,14 Z"
        fill="white" fillOpacity="0.25" pointerEvents="none"
      />

      {/* Zone indicators */}
      {shadeZones?.CROWN && <circle cx="40" cy="28" r="3.5" fill="#3b82f6" fillOpacity="0.7" pointerEvents="none" />}
      {shadeZones?.MIDDLE && <circle cx="40" cy="65" r="3.5" fill="#f59e0b" fillOpacity="0.7" pointerEvents="none" />}
      {shadeZones?.GUM && <circle cx="40" cy="102" r="3.5" fill="#ef4444" fillOpacity="0.7" pointerEvents="none" />}
    </svg>
  );
};

const ShadePalette = ({ colors, selectedColorId, onSelect, zone, onClose }) => {
  const zoneInfo = ZONES[zone] || {};
  const zoneBg = { CROWN: "bg-blue-50 border-blue-300", MIDDLE: "bg-amber-50 border-amber-300", GUM: "bg-red-50 border-red-300" };
  const zoneText = { CROWN: "text-blue-800", MIDDLE: "text-amber-800", GUM: "text-red-800" };

  return (
    <div className={`rounded-xl border-2 p-4 shadow-lg ${zoneBg[zone] || "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`font-semibold text-sm flex items-center gap-1.5 ${zoneText[zone]}`}>
          <span>{zoneInfo.icon}</span>
          <span>{zoneInfo.label} üçün shade seçin</span>
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-white/50">×</button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {/* Sıfırla */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-lg border-2 h-10 flex items-center justify-center text-xs font-bold transition-all bg-white
            ${!selectedColorId ? "border-gray-500 ring-2 ring-offset-1 ring-gray-400" : "border-gray-300 hover:border-gray-500"}`}
          title="Rəngi sil"
        >
          <span className="text-gray-400 text-lg">—</span>
        </button>

        {colors.map((color) => {
          const bg = getShadeColor(color.label) || "#f5f0e0";
          const isSelected = selectedColorId === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onSelect(color.value)}
              style={{ backgroundColor: bg }}
              className={`relative rounded-lg border-2 h-10 flex items-center justify-center text-xs font-bold transition-all shadow-sm
                ${isSelected ? "border-blue-600 ring-2 ring-offset-1 ring-blue-400 scale-110" : "border-gray-300 hover:border-gray-500 hover:scale-105"}`}
              title={color.label}
            >
              <span className="text-gray-800 text-[10px] font-semibold">{color.label}</span>
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow">
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none"/></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Ana komponent: ToothShadeSelector
 * Props:
 *  - colors: [{value: id, label: 'A1'}, ...]
 *  - shadeZones: { CROWN: colorId|null, MIDDLE: colorId|null, GUM: colorId|null }
 *  - onChange: (zones) => void
 *  - disabled: boolean
 *  - toothNumber: number
 *  - isBridge: boolean
 *  - bridgeTeeth: Array<number>
 */
const ToothShadeSelector = ({
  colors = [],
  shadeZones = {},
  onChange,
  disabled = false,
  toothNumber,
  isBridge = false,
  bridgeTeeth = []
}) => {
  const [activeZone, setActiveZone] = useState(null);

  const colorMap = {};
  colors.forEach((c) => { colorMap[c.value] = c; });

  const handleZoneClick = (zone) => {
    if (disabled) return;
    setActiveZone((prev) => (prev === zone ? null : zone));
  };

  const handleShadeSelect = (colorId) => {
    if (!activeZone) return;
    onChange?.({ ...shadeZones, [activeZone]: colorId });
    if (!colorId) setActiveZone(null);
  };

  const getZoneShadeLabel = (zone) => {
    const colorId = shadeZones?.[zone];
    if (!colorId) return null;
    return colorMap[colorId]?.label || null;
  };

  const zoneActiveBorder = { CROWN: "border-blue-400 bg-blue-50 ring-1 ring-blue-200", MIDDLE: "border-amber-400 bg-amber-50 ring-1 ring-amber-200", GUM: "border-red-400 bg-red-50 ring-1 ring-red-200" };
  const zoneHoverBorder = { CROWN: "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40", MIDDLE: "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40", GUM: "border-gray-200 hover:border-red-300 hover:bg-red-50/40" };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
        {/* Diş SVG */}
        {isBridge ? (
          <div className="flex flex-col items-center gap-2 border border-purple-100 bg-purple-50/20 rounded-xl p-3 relative min-w-[240px] max-w-full overflow-x-auto flex-shrink-0">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-sm">
              Körpü Dişləri ({bridgeTeeth.length} diş)
            </span>
            <div className="flex items-center justify-center gap-1.5 py-3 px-4 relative bg-white rounded-lg border border-gray-200 shadow-inner min-w-[220px] min-h-[110px]">
              {/* Bridge connector bar passing through the teeth */}
              <div className="absolute top-[48%] left-4 right-4 h-3.5 bg-indigo-500/20 border-y border-indigo-400/30 rounded-full pointer-events-none z-0" />
              {bridgeTeeth.map((num) => (
                <div key={num} className="w-11 h-20 sm:w-13 sm:h-24 relative flex flex-col items-center z-10 hover:scale-105 transition-transform">
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">#{num}</span>
                  <ToothSVG
                    shadeZones={shadeZones}
                    colorMap={colorMap}
                    onZoneClick={handleZoneClick}
                    activeZone={activeZone}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
            {!disabled && (
              <span className="text-[9px] text-gray-400 text-center leading-tight">
                Hər hansı dişin üzərinə klik edərək shade seçin
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {toothNumber && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                #{toothNumber}
              </span>
            )}
            <div className="w-14 h-24 sm:w-16 sm:h-28">
              <ToothSVG
                shadeZones={shadeZones}
                colorMap={colorMap}
                onZoneClick={handleZoneClick}
                activeZone={activeZone}
                disabled={disabled}
              />
            </div>
            {!disabled && (
              <span className="text-[9px] text-gray-400 text-center leading-tight max-w-[60px]">klik edərək seç</span>
            )}
          </div>
        )}

        {/* Zona siyahısı */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {Object.entries(ZONES).map(([zone, info]) => {
            const shadeLabel = getZoneShadeLabel(zone);
            const shadeColor = shadeLabel ? getShadeColor(shadeLabel) : null;
            const isActive = activeZone === zone;

            return (
              <button
                key={zone}
                type="button"
                disabled={disabled}
                onClick={() => handleZoneClick(zone)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-xs
                  ${isActive ? zoneActiveBorder[zone] : zoneHoverBorder[zone]}
                  ${disabled ? "cursor-default opacity-75" : "cursor-pointer"}`}
              >
                <span className="text-sm shrink-0">{info.icon}</span>
                <span className="font-medium text-gray-600 truncate">{info.label}</span>
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  {shadeLabel ? (
                    <>
                      <div className="w-4 h-4 rounded border border-gray-300 shadow-inner shrink-0" style={{ backgroundColor: shadeColor || "#f0e6cc" }} />
                      <span className="font-bold text-gray-800">{shadeLabel}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic text-[10px]">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shade paleti */}
      {activeZone && !disabled && (
        <ShadePalette
          colors={colors}
          selectedColorId={shadeZones?.[activeZone] || null}
          onSelect={handleShadeSelect}
          zone={activeZone}
          onClose={() => setActiveZone(null)}
        />
      )}
    </div>
  );
};

export default ToothShadeSelector;
