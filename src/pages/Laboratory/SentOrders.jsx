import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Style
import "../../assets/style/LaboratoryPage/sentorders.css";

// Icons
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";

// Store
import useDentalOrderStore from "../../../stores/dentalOrderStore";

function SentOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { technicOrders, loading, error, fetchTechnicOrders } =
    useDentalOrderStore();

  useEffect(() => {
    fetchTechnicOrders();
  }, [fetchTechnicOrders]);

  const tableHead = ["Həkim", "Pasiyent", "Sifariş tipi", "Status"];

  const icons = [
    {
      icon: CiCircleInfo,
      action: (row) => navigate(`/lab/orders/${row.id}`),
      className: "info-icon",
    },
  ];

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
  const filteredData = technicOrders.filter((row) => {
    const matchesSearch =
      row.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dentalWorkType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dentalWorkStatus?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter
      ? row.dentalWorkStatus === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Status statistikası üçün sayma
  const statusCounts = technicOrders.reduce((acc, order) => {
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
      <div className="sentOrdersHeader">
        <div className="leftPartHeader">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Bütün statuslar ({technicOrders.length})</option>
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
          <p
            className="addNowOrder"
            onClick={() => navigate("/lab/order/add")}
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
        <table className="labTable w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th className=" !text-center w-20">
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
                  <div className="th-content !ml-27">
                    <HiArrowsUpDown className="arrowsIcon" />
                    <span>{title}</span>
                  </div>
                </th>
              ))}
              {icons.length > 0 && (
                <th className="w-32">
                  <div className="th-content !ml-3">
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
                  style={{ textAlign: "center" }}
                >
                  Heç bir sifariş tapılmadı.
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                const statusInfo = getStatusInfo(row.dentalWorkStatus);
                return (
                  <tr key={row.id}>
                    <td className="!text-center">{rowIndex + 1}</td>
                    <td className="px-4">{row.doctor || "-"}</td>
                    <td
                      onClick={() => navigate(`/lab/orders/${row.id}`)}
                      className="patinetTD !text-center px-4"
                      style={{ cursor: "pointer", color: "#155EEF" }}
                    >
                      {row.patient || "-"}
                    </td>
                    <td className="px-4">{row.dentalWorkType || "-"}</td>
                    <td className="!text-center px-4">
                      <span className={`status ${statusInfo.type}`}>
                        {statusInfo.text}
                      </span>
                    </td>

                    {icons.length > 0 && (
                      <td className="actions">
                        <div className="actionsWrapper !text-left">
                          {icons.map((iconObj, iconIdx) => (
                            <span
                              key={iconIdx}
                              onClick={() => iconObj.action(row)}
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
    </div>
  );
}


export default SentOrders;
