import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";

import "../../assets/style/PatientPage/patientreport.css";
import CustomDropdown from "../../components/CustomDropdown";
import { readPatientReports } from "../../api/patient-report";

const PAGE_SIZE = 20;

const toothOptions = [1, 2, 3, 4]
  .flatMap((quadrant) =>
    Array.from({ length: 8 }, (_, index) => {
      const value = String(quadrant * 10 + index + 1);
      return { value, label: `Diş ${value}` };
    })
  );

const emptyFilters = {
  operationName: "",
  teethNo: "",
  startDate: "",
  endDate: "",
};

const toStartOfDay = (value) =>
  value ? new Date(`${value}T00:00:00`).getTime() : undefined;

const toEndOfDay = (value) =>
  value ? new Date(`${value}T23:59:59.999`).getTime() : undefined;

const formatDate = (value) => {
  if (!value) return "-";
  const numericValue = Number(value);
  const milliseconds = numericValue < 10_000_000_000
    ? numericValue * 1000
    : numericValue;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("az-AZ");
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("az-AZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} AZN`;

function PatientReport() {
  const { id } = useParams();
  const patientId = Number(id);

  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [reportPage, setReportPage] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    if (!Number.isInteger(patientId) || patientId <= 0) {
      setError("Pasiyent ID-si düzgün deyil.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await readPatientReports({
        patientId,
        operationName: appliedFilters.operationName,
        teethNo: appliedFilters.teethNo,
        startDate: toStartOfDay(appliedFilters.startDate),
        endDate: toEndOfDay(appliedFilters.endDate),
        page,
        size: PAGE_SIZE,
      });
      setReportPage(data);
    } catch (requestError) {
      console.error("Patient report loading error:", requestError);
      setError("Hesabat məlumatlarını yükləmək mümkün olmadı.");
      setReportPage({ content: [], totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }, [patientId, appliedFilters, page]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const rows = reportPage.content || [];
  const totalPages = reportPage.totalPages || 0;
  const firstRowNumber = rows.length ? page * PAGE_SIZE + 1 : 0;
  const lastRowNumber = page * PAGE_SIZE + rows.length;

  const visiblePages = useMemo(() => {
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from(
      { length: Math.min(5, totalPages) },
      (_, index) => start + index
    );
  }, [page, totalPages]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(0);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
  };

  return (
    <div className="patientReportWrapper">
      <form className="patientReportFilters" onSubmit={applyFilters}>
        <input
          type="text"
          value={filters.operationName}
          onChange={(event) =>
            updateFilter("operationName", event.target.value)
          }
          placeholder="Əməliyyat növü"
        />
        <CustomDropdown
          value={filters.teethNo}
          onChange={(option) => updateFilter("teethNo", option.value)}
          placeholder="Diş No"
          options={toothOptions}
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(event) => updateFilter("startDate", event.target.value)}
          aria-label="Başlama tarixi"
          title="Başlama tarixi"
        />
        <input
          type="date"
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(event) => updateFilter("endDate", event.target.value)}
          aria-label="Bitmə tarixi"
          title="Bitmə tarixi"
        />
        <button type="submit" className="patientReportSearchButton">
          <IoIosSearch />
          Axtar
        </button>
        <button
          type="button"
          className="patientReportClearButton"
          onClick={clearFilters}
        >
          Təmizlə
        </button>
      </form>

      {error && <div className="patientReportMessage error">{error}</div>}

      <div className="patientReportTableWrapper">
        <div className="patientReportTableScrollContainer">
          <table className="patientReportTable">
            <thead>
              <tr>
                <th>
                  {firstRowNumber}-{lastRowNumber}
                </th>
                <th>Plan tarixi</th>
                <th>Pasiyent</th>
                <th>Diş No</th>
                <th>Əməliyyat</th>
                <th>Planlayan həkim</th>
                <th>Qiymət</th>
                <th>Endirim</th>
                <th>Yekun</th>
                <th>İcra tarixi</th>
                <th>İcraçı həkim</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="patientReportEmpty">
                    Məlumatlar yüklənir...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((item, index) => (
                  <tr
                    key={`${item.executionDate}-${item.teethNo}-${index}`}
                  >
                    <td>{page * PAGE_SIZE + index + 1}</td>
                    <td>{formatDate(item.planDate)}</td>
                    <td>{item.patientName || "-"}</td>
                    <td>{item.teethNo || "-"}</td>
                    <td>{item.operationName || "-"}</td>
                    <td>{item.planningDoctorName || "-"}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td>{formatMoney(item.discount)}</td>
                    <td>{formatMoney(item.finalPrice)}</td>
                    <td>{formatDate(item.executionDate)}</td>
                    <td>{item.executionDoctorName || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="patientReportEmpty">
                    Bu pasiyent üçün hesabat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="patientReportFooter">
        <span>Cəmi: {reportPage.totalElements || 0}</span>
        {totalPages > 1 && (
          <div className="patientReportPagination">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              ‹
            </button>
            {visiblePages.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={page === pageNumber ? "active" : ""}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => current + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientReport;
