import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/LaboratoryPage/sentorders.css";

// Icons
import { CiSearch } from "react-icons/ci";
import { FiDownload } from "react-icons/fi";
import { CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";

// Zustand store-u import edirik
import { useLaboratoryPaymentStore } from "../../../stores/dentalOrderReportStore";

function TechnicalsReport() {
  const navigate = useNavigate();

  // Zustand store-dan state və action-ları çəkirik
  const { payments, isLoading, error, fetchPayments } =
    useLaboratoryPaymentStore();

  const [searchQuery, setSearchQuery] = useState("");

  // Komponent yükləndikdə ödəniş məlumatlarını çəkirik
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Log the payments data to the console
  useEffect(() => {
    if (payments.length > 0) {
      console.log("Fetched Payments Data:", payments);
    }
  }, [payments]);

  // Cədvəl başlıqları API cavabına uyğunlaşdırıldı
  const tableHead = [
    "Adı",
    "Soyadı",
    "Cəmi borc",
    "Cəmi ödənən",
    "Cəmi qalıq",
  ];

  // Ətraflı hissəsi üçün ikonlar
  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigate(`${row.technicianId}`),
      className: "info-icon",
    },
  ];

  // Axtarış filtri: "Tam adı" sahəsi üzrə axtarış edir.
  const filteredData = payments.filter((row) => {
    const fullNameMatch = row.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return fullNameMatch;
  });

  if (isLoading) {
    return (
      <div className="sentOrdersContainer">
        <div className="loading">Yüklənir...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sentOrdersContainer">
        <div className="error">Xəta: {error}</div>
      </div>
    );
  }

  return (
    <div className="sentOrdersContainer">
      <div className="sentOrdersHeader">
        <div className="leftPartHeader">
          <div className="searchOrderNow">
            <input
              type="text"
              placeholder="Axtarış"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CiSearch className="search-btn" />
          </div>
        </div>
        <div className="rightPartHeader">
          <p
            className="addNowOrder"
            onClick={() => navigate("add")}
          >
            <FaPlus className="plusBTN" /> Yenisini əlavə et
          </p>
          <FiDownload
            className="exportDataNow"
            onClick={() => navigate("/data/export")}
          />
        </div>
      </div>

      <div className="tableWrapper">
        <table className="labTable" style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>
                <div className="th-content justify-center">
                  <HiArrowsUpDown className="arrowsIcon" />
                  <span>
                    {filteredData.length === 0 ? "0" : `1-${filteredData.length}`}
                  </span>
                </div>
              </th>
              {tableHead.map((title, idx) => (
                <th key={idx} style={{ textAlign: "center" }}>
                  <div className="th-content">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>{title}</span>
                  </div>
                </th>
              ))}
              {icons.length > 0 && (
                <th style={{ textAlign: "center" }}>
                  <div className="th-content">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>Ətraflı</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Məlumat yoxdursa */}
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHead.length + (icons.length > 0 ? 1 : 0) + 1}
                  style={{ textAlign: "center" }}
                >
                  Heç bir texnik tapılmadı.
                </td>
              </tr>
            ) : (
              // Məlumat varsa, onları göstər
              filteredData.map((row, rowIndex) => {
                const nameParts = row.fullName?.split(" ") || [];
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";
                return (
                  <tr key={row.technicianId || rowIndex}>
                    <td style={{ textAlign: "center" }}>{rowIndex + 1}</td>
                    <td style={{ textAlign: "left" }}>{firstName}</td>
                    <td style={{ textAlign: "left" }}>{lastName}</td>
                    <td style={{ textAlign: "right" }}>
                      {row.totalDebt ? `${row.totalDebt} AZN` : "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {row.totalPaid ? `${row.totalPaid} AZN` : "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {row.totalRemaining ? `${row.totalRemaining} AZN` : "-"}
                    </td>
                    {icons.length > 0 && (
                      <td className="actions" style={{ textAlign: "center" }}>
                        <div className="actionsWrapper">
                          {icons.map((iconObj, iconIdx) => (
                            <span
                              key={iconIdx}
                              onClick={() => iconObj.action(row)}
                              style={{ cursor: "pointer" }}
                            >
                              {React.createElement(iconObj.icon, {
                                className: `icon ${iconObj.className || ""}`,
                              })}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TechnicalsReport;