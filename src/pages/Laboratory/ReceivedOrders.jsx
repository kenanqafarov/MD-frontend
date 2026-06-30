import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/LaboratoryPage/sentorders.css";

// Icons
import { CiSearch } from "react-icons/ci";
import { FiDownload } from "react-icons/fi";
import { CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";
import "./sentorders.css";

// Store
import useDentalOrderStore from "../../../stores/dentalOrderStore";

function ReceivedOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    changeOrderStatus
  } = useDentalOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Success mesajını 3 saniyədən sonra yox et
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const tableHead = [
    "Göndərən",
    "Pasiyent",
    "Yoxlanılma tarixi",
    "Təhvil tarixi",
    "Status",
  ];

  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigate(`/lab/orders/${row.id}`),
      className: "info-icon",
    },
  ];

  // BÜTÜN STATUS SİYAHISI
  const ALL_STATUSES = {
    PENDING: "Gözləyir",
    SENT_TO_TECHNICIAN: "Texnikaya göndərilib", 
    RECEIVED_FROM_TECHNICIAN: "Texnikadan alındı",
    SENT_TO_DOCTOR: "Həkimə göndərilib",
    DOCTOR_RETURNED_TO_TECHNICIAN: "Həkim texnikaya qaytardı"
  };

  // Status dəyişmə funksiyası
  const handleStatusChange = async (orderId, currentStatus, patientName) => {
    try {
      // Növbəti statusu təyin et
      const nextStatus = getNextStatus(currentStatus);
      
      // Status məlumatını hazırla
      const statusData = {
        id: Number(orderId),
        dentalWorkStatus: nextStatus
      };

      console.log("Changing status from", currentStatus, "to", nextStatus);

      // Statusu yenilə
      const result = await changeOrderStatus(statusData);
      
      // Uğur mesajını göstər
      const statusText = getStatusInfo(nextStatus).text;
      setSuccessMessage(`${patientName} üçün status "${statusText}" olaraq yeniləndi`);
      
    } catch (error) {
      console.error("Status dəyişmə xətası:", error);
      const errorMsg = error.response?.data?.message || error.message || "Status dəyişilə bilmədi";
      alert(`Xəta: ${errorMsg}`);
    }
  };

  // Növbəti statusu təyin etmək üçün funksiya - DÜZGÜN AXIN
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      "PENDING": "SENT_TO_TECHNICIAN",
      "SENT_TO_TECHNICIAN": "RECEIVED_FROM_TECHNICIAN",
      "RECEIVED_FROM_TECHNICIAN": "SENT_TO_DOCTOR",
      "SENT_TO_DOCTOR": "DOCTOR_RETURNED_TO_TECHNICIAN",
      "DOCTOR_RETURNED_TO_TECHNICIAN": "PENDING", // Gözləyirə qayıdır
    };

    return statusFlow[currentStatus] || "PENDING";
  };

  // Status badge məlumatı - BÜTÜN STATUSLAR ÜÇÜN
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { text: "Gözləyir", type: "pending" };
      case "SENT_TO_TECHNICIAN":
        return { text: "Texnikaya göndərilib", type: "texnika" };
      case "RECEIVED_FROM_TECHNICIAN":
        return { text: "Texnikadan alındı", type: "qebul" };
      case "SENT_TO_DOCTOR":
        return { text: "Həkimə göndərilib", type: "hakim" };
      case "DOCTOR_RETURNED_TO_TECHNICIAN":
        return { text: "Həkim texnikaya qaytardı", type: "returned" };
      
      default:
        // Əgər status string formatındadırsa
        if (status?.includes("Həkim") || status?.includes("DOCTOR") || status === "SENT_TO_DOCTOR") {
          return { text: "Həkimə göndərilib", type: "hakim" };
        } else if (status?.includes("Texnik") || status?.includes("TECHNIC") || status === "SENT_TO_TECHNICIAN") {
          return { text: "Texnikaya göndərilib", type: "texnika" };
        } else if (status?.includes("qəbul") || status?.includes("ACCEPT") || status?.includes("RECEIVED") || status === "RECEIVED_FROM_TECHNICIAN") {
          return { text: "Texnikadan alındı", type: "qebul" };
        } else if (status?.includes("qaytar") || status?.includes("RETURN") || status === "DOCTOR_RETURNED_TO_TECHNICIAN") {
          return { text: "Həkim texnikaya qaytardı", type: "returned" };
        }
        return { text: "Gözləyir", type: "pending" };
    }
  };

  // Cari statusun növbəti statusunu göstərən funksiya (tooltip üçün)
  const getNextStatusText = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    return getStatusInfo(nextStatus).text;
  };

  // Tarix formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("az-AZ");
    } catch (e) {
      return dateString;
    }
  };

  // Axtarış və status filtri
  const filteredData = orders.filter((row) => {
    const matchesSearch = 
      row.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dentalWorkStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? 
      row.dentalWorkStatus === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Hər statusun sayını hesabla (statistika üçün)
  const statusCounts = orders.reduce((acc, order) => {
    const status = order.dentalWorkStatus || "PENDING";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
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
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Status Statistika */}
      {/* <div className="status-stats">
        {Object.entries(ALL_STATUSES).map(([statusKey, statusText]) => (
          <div key={statusKey} className="status-stat-item">
            <span className="status-stat-text">{statusText}:</span>
            <span className="status-stat-count">{statusCounts[statusKey] || 0}</span>
          </div>
        ))}
      </div> */}

      <div className="sentOrdersHeader">
        <div className="leftPartHeader">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Bütün statuslar ({orders.length})</option>
            {Object.entries(ALL_STATUSES).map(([statusKey, statusText]) => (
              <option key={statusKey} value={statusKey}>
                {statusText} ({statusCounts[statusKey] || 0})
              </option>
            ))}
          </select>

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
      </div>

      <div className="tableWrapper">
        <table className="labTable">
          <thead>
            <tr>
              <th>{filteredData.length === 0 ? "0" : `1-${filteredData.length}`}</th>
              {tableHead.map((title, idx) => (
                <th key={idx}>
                  <div className="th-content">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>{title}</span>
                  </div>
                </th>
              ))}
              {icons.length > 0 && (
                <th>
                  <div className="th-content">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>Ətraflı</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHead.length + 1}
                  style={{ textAlign: "center" }}>
                  Heç bir sifariş tapılmadı.
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                const statusInfo = getStatusInfo(row.dentalWorkStatus);
                const nextStatusText = getNextStatusText(row.dentalWorkStatus);

                return (
                  <tr key={row.id}>
                    <td>{rowIndex + 1}</td>

                    <td>{row.doctor || "-"}</td>

                    <td
                      onClick={() => navigate(`/lab/orders/${row.id}`)}
                      className="patinetTD"
                      style={{ cursor: "pointer", color: "#155EEF" }}>
                      {row.patient || "-"}
                    </td>

                    <td>{formatDate(row.checkDate)}</td>
                    <td>{formatDate(row.deliveryDate)}</td>

                    <td>
                      <span 
                        className={`status-badge ${statusInfo.type}`}
                        onClick={() => handleStatusChange(
                          row.id, 
                          row.dentalWorkStatus, 
                          row.patient || "Sifariş"
                        )}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        title={`Cari: ${statusInfo.text}\nNövbəti: ${nextStatusText}\n(Dəyişdirmək üçün klik edin)`}
                      >
                        {statusInfo.text}
                      </span>
                    </td>

                    <td className="actions">
                      <div className="actionsWrapper">
                        {icons.map((iconObj, i) => (
                          <span
                            key={i}
                            onClick={() => iconObj.action(row)}
                            style={{ cursor: "pointer" }}>
                            {React.createElement(iconObj.icon, {
                              className: `icon ${iconObj.className}`,
                            })}
                          </span>
                        ))}
                      </div>
                    </td>
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

export default ReceivedOrders;