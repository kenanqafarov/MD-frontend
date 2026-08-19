import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// Style
import "../../assets/style/LaboratoryPage/sentorders.css";

// Icons
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { FiDownload, FiLayers, FiClock, FiActivity, FiCheckCircle } from "react-icons/fi";
import { CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";

// Store
import useDentalOrderStore from "../../../stores/dentalOrderStore";
import { usePermission } from "../../hooks/usePermission";

function SentOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [excelLoading, setExcelLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  const { hasPermission } = usePermission();
  const canCreate = hasPermission("Göndərilən sifarişlər", "CREATE");

  // Real backend dental orders list from store
  const { orders, loading, error, fetchOrders } = useDentalOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const tableHead = [
    "Həkim",
    "Pasiyent",
    "Texnik",
    "Sifariş tipi",
    "Tarix",
    "Qiymət",
    "Status"
  ];

  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigate(`/lab/orders/${row.id}`),
      className: "info-icon",
    },
  ];

  // Export mesajını müvəqqəti göstər
  const showExportMessage = (type, text) => {
    setExportMessage({ type, text });
    setTimeout(() => setExportMessage(null), 4000);
  };

  // Tarix formatı: DD.MM.YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return String(dateStr);
    }
  };

  // Excel eksport funksiyası
  const exportToExcel = async () => {
    if (filteredData.length === 0) {
      showExportMessage("info", "Export etmək üçün sifariş yoxdur");
      return;
    }

    setExcelLoading(true);
    setExportMessage(null);

    try {
      const rows = filteredData.map((row, index) => {
        // Parse description to separate metal, ceramic and report fields
        const desc = row.note || row.description || "";
        let metalWork = "-";
        let ceramicWork = "-";
        let report = desc || "-";

        if (desc && desc.includes(" | ")) {
          const parts = desc.split(" | ");
          parts.forEach(part => {
            if (part.startsWith("Metal işi: ")) {
              metalWork = part.replace("Metal işi: ", "");
            } else if (part.startsWith("Keramikanın işi: ")) {
              ceramicWork = part.replace("Keramikanın işi: ", "");
            } else if (part.startsWith("Hesabat: ")) {
              report = part.replace("Hesabat: ", "");
            }
          });
        }

        return {
          "№": index + 1,
          "Həkim": row.doctor || "-",
          "Pasiyent": row.patient || "-",
          "Texnik": row.technician || "-",
          "Sifariş tipi": row.isBridge ? `Körpü (${row.startTooth}-${row.endTooth})` : (row.dentalWorkType || "-"),
          "Giriş Tarixi": formatDate(row.checkDate || row.createdAt || row.date || row.orderDate),
          "Təhvil Tarixi": formatDate(row.deliveryDate),
          "Qiymət": row.price ? `${Number(row.price).toFixed(2)} AZN` : "-",
          "Status": getStatusInfo(row.dentalWorkStatus).text,
          "Metal işi": metalWork,
          "Keramika işi": ceramicWork,
          "Hesabat / Qeyd": report,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths dynamically
      const max_widths = Object.keys(rows[0] || {}).map(key => {
        let maxLen = key.length;
        rows.forEach(row => {
          const val = row[key] ? String(row[key]) : "";
          if (val.length > maxLen) {
            maxLen = val.length;
          }
        });
        // Min width 10, max width 45 to keep it clean and prevent infinite wrapping/stretching
        return { wch: Math.min(45, Math.max(10, maxLen + 3)) };
      });
      worksheet["!cols"] = max_widths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laboratoriya Sifarişləri");

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      XLSX.writeFile(workbook, `laboratoriya-sifarisleri-${dateStr}.xlsx`);
    } catch (err) {
      console.error("Excel export xətası:", err);
      showExportMessage("error", "Excel hazırlanarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setExcelLoading(false);
    }
  };

  // Status badge məlumatı
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
        return { text: status || "Bilinmir", type: "pending" };
    }
  };

  // Axtarış və status filtri
  const filteredData = orders.filter((row) => {
    const matchesSearch =
      row.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.technician?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dentalWorkType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dentalWorkStatus?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter
      ? row.dentalWorkStatus === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Status statistikası üçün sayma
  const statusCounts = orders.reduce((acc, order) => {
    const status = order.dentalWorkStatus || "PENDING";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Dashboard Stats Hesablamaları
  const totalCount = orders.length;
  const pendingCount = statusCounts["PENDING"] || 0;
  const progressCount = (statusCounts["SENT_TO_TECHNICIAN"] || 0) + (statusCounts["DOCTOR_RETURNED_TO_TECHNICIAN"] || 0);
  const completedCount = (statusCounts["RECEIVED_FROM_TECHNICIAN"] || 0) + (statusCounts["SENT_TO_DOCTOR"] || 0);

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
      {/* Header */}
      <div className="sentOrdersHeader">
        <div className="leftPartHeader">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Bütün statuslar ({orders.length})</option>
            <option value="PENDING">Gözləyir ({statusCounts["PENDING"] || 0})</option>
            <option value="SENT_TO_TECHNICIAN">
              Texnikaya göndərilib ({statusCounts["SENT_TO_TECHNICIAN"] || 0})
            </option>
            <option value="RECEIVED_FROM_TECHNICIAN">
              Texnikadan alındı ({statusCounts["RECEIVED_FROM_TECHNICIAN"] || 0})
            </option>
            <option value="SENT_TO_DOCTOR">
              Həkimə göndərilib ({statusCounts["SENT_TO_DOCTOR"] || 0})
            </option>
            <option value="DOCTOR_RETURNED_TO_TECHNICIAN">
              Həkim qaytardı ({statusCounts["DOCTOR_RETURNED_TO_TECHNICIAN"] || 0})
            </option>
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
        <div className="rightPartHeader">
          {canCreate && (
            <p className="addNewSentOrder" onClick={() => navigate("/lab/order/add")}>
              <FaPlus className="plusBTN" /> Yenisini əlavə et
            </p>
          )}
          <button
            className="export-excel-btn"
            onClick={exportToExcel}
            disabled={excelLoading}
            title="Excel-ə export et"
          >
            <FiDownload style={{ fontSize: "15px" }} />
            {excelLoading ? "Excel hazırlanır..." : "Excel-ə export et"}
          </button>
        </div>
      </div>

      {/* Export mesajı */}
      {exportMessage && (
        <div className={`export-message export-message--${exportMessage.type}`}>
          {exportMessage.text}
        </div>
      )}

      {/* Statistika Kartları */}
      <div className="statsGrid">
        <div className="statCard">
          <div className="statInfo">
            <span className="statLabel">Ümumi Sifarişlər</span>
            <span className="statValue">{totalCount}</span>
          </div>
          <div className="statIconWrapper total">
            <FiLayers />
          </div>
        </div>
        <div className="statCard">
          <div className="statInfo">
            <span className="statLabel">Gözləyənlər</span>
            <span className="statValue">{pendingCount}</span>
          </div>
          <div className="statIconWrapper pending">
            <FiClock />
          </div>
        </div>
        <div className="statCard">
          <div className="statInfo">
            <span className="statLabel">İş Prosesində</span>
            <span className="statValue">{progressCount}</span>
          </div>
          <div className="statIconWrapper progress">
            <FiActivity />
          </div>
        </div>
        <div className="statCard">
          <div className="statInfo">
            <span className="statLabel">Hazır / Təhvil</span>
            <span className="statValue">{completedCount}</span>
          </div>
          <div className="statIconWrapper completed">
            <FiCheckCircle />
          </div>
        </div>
      </div>

      {/* Cədvəl və ya Empty State */}
      {orders.length === 0 ? (
        <div className="emptyStateWrapper">
          <FiLayers className="emptyStateIcon" />
          <h3 className="emptyStateTitle">Laboratoriya sifarişi tapılmadı</h3>
          <p className="emptyStateDesc">
            Sistemdə hər hansı bir laboratoriya sifarişi yoxdur. Sifarişlərinizi izləmək üçün yeni sifariş yarada bilərsiniz.
          </p>
          {canCreate && (
            <div className="emptyStateActions">
              <button className="emptyStateBtn" onClick={() => navigate("/lab/order/add")}>
                Yeni sifariş yarat
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="tableWrapper">
          <table className="labTable w-full">
            <thead>
              <tr>
                <th className="!text-center w-20">
                  <div className="th-content justify-center">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>
                      {filteredData.length === 0
                        ? "0"
                        : `1-${filteredData.length}`}
                    </span>
                  </div>
                </th>
                {tableHead.map((title, idx) => (
                  <th key={idx}>
                    <div className="th-content">
                      <HiArrowsUpDown className="arrowsIcon" />
                      <span>{title}</span>
                    </div>
                  </th>
                ))}
                {icons.length > 0 && (
                  <th className="w-32">
                    <div className="th-content justify-center">
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
                    colSpan={tableHead.length + 2}
                    className="text-center"
                    style={{ padding: "40px" }}
                  >
                    Axtarışa və ya filtrə uyğun sifariş tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => {
                  const statusInfo = getStatusInfo(row.dentalWorkStatus);
                  return (
                    <tr key={row.id} onClick={() => navigate(`/lab/orders/${row.id}`)} style={{ cursor: "pointer" }}>
                      <td className="text-center">{rowIndex + 1}</td>
                      <td className="doctorCol">{row.doctor || "-"}</td>
                      <td className="patientCol">{row.patient || "-"}</td>
                      <td>{row.technician || "-"}</td>
                      <td>{row.isBridge ? `Körpü (${row.startTooth}-${row.endTooth})` : (row.dentalWorkType || "-")}</td>
                      <td>{formatDate(row.checkDate || row.createdAt || row.date || row.orderDate)}</td>
                      <td className="priceCol">{row.price ? `${Number(row.price).toFixed(2)} ₼` : "-"}</td>
                      <td className="text-center">
                        <span className={`status ${statusInfo.type}`}>
                          {statusInfo.text}
                        </span>
                      </td>

                      {icons.length > 0 && (
                        <td className="actions">
                          <div className="actionsWrapper">
                            {icons.map((iconObj, iconIdx) => (
                              <span
                                key={iconIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  iconObj.action(row);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {React.createElement(iconObj.icon, {
                                  className: `icon ${
                                    iconObj.className || ""
                                  }`,
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
      )}
    </div>
  );
}

export default SentOrders;
