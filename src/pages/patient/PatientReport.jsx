import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import "../../assets/style/PatientPage/patientreport.css";
import CustomDropdown from "../../components/CustomDropdown";
import { readPatientReports } from "../../api/patient-report";

const PAGE_SIZE = 20;
const pageSizeOptions = [10, 20, 50];

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

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getQuickDateRange = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);

  if (period === "week") start.setDate(today.getDate() - 6);
  if (period === "month") start.setDate(1);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(today),
  };
};

const quickDateOptions = [
  { value: "today", label: "Bu gün" },
  { value: "week", label: "Son 7 gün" },
  { value: "month", label: "Bu ay" },
];

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

const formatFilterDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("az-AZ") : "…";

const normalizeReportPage = (data) => {
  const page = data?.data || data || {};
  const content = Array.isArray(page) ? page : page.content || page.items || [];

  return {
    content,
    totalPages: Number(page.totalPages || page.pageCount || 0),
    totalElements: Number(page.totalElements || page.totalCount || content.length),
  };
};

const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages < 2) return [];

  const pageNumbers = new Set([0, totalPages - 1]);
  for (
    let pageNumber = Math.max(0, currentPage - 1);
    pageNumber <= Math.min(totalPages - 1, currentPage + 1);
    pageNumber += 1
  ) {
    pageNumbers.add(pageNumber);
  }

  return [...pageNumbers]
    .sort((left, right) => left - right)
    .reduce((items, pageNumber, index, pages) => {
      if (index && pageNumber - pages[index - 1] > 1) {
        items.push(`ellipsis-${pageNumber}`);
      }
      items.push(pageNumber);
      return items;
    }, []);
};

function PatientReport() {
  const { id } = useParams();
  const patientId = Number(id);
  const requestController = useRef(null);

  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [reportPage, setReportPage] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadReports = useCallback(async () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

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
        size: pageSize,
        signal: controller.signal,
      });
      const nextReportPage = normalizeReportPage(data);

      if (nextReportPage.totalPages && page >= nextReportPage.totalPages) {
        setPage(nextReportPage.totalPages - 1);
        return;
      }

      setReportPage(nextReportPage);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") {
        return;
      }
      console.error("Patient report loading error:", requestError);
      setError("Hesabat məlumatlarını yükləmək mümkün olmadı.");
      setReportPage({ content: [], totalPages: 0, totalElements: 0 });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [patientId, appliedFilters, page, pageSize]);

  useEffect(() => {
    loadReports();
    return () => requestController.current?.abort();
  }, [loadReports]);

  const rows = useMemo(() => reportPage.content || [], [reportPage.content]);
  const totalPages = reportPage.totalPages || 0;
  const firstRowNumber = rows.length ? page * pageSize + 1 : 0;
  const lastRowNumber = page * pageSize + rows.length;

  const paginationItems = useMemo(
    () => getPaginationItems(page, totalPages),
    [page, totalPages]
  );

  const currentPageTotals = useMemo(
    () =>
      rows.reduce(
        (totals, item) => ({
          price: totals.price + Number(item.price || 0),
          discount: totals.discount + Number(item.discount || 0),
          finalPrice: totals.finalPrice + Number(item.finalPrice || 0),
        }),
        { price: 0, discount: 0, finalPrice: 0 }
      ),
    [rows]
  );

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (appliedFilters.operationName) {
      chips.push({
        key: "operationName",
        label: `Əməliyyat: ${appliedFilters.operationName}`,
      });
    }
    if (appliedFilters.teethNo) {
      chips.push({ key: "teethNo", label: `Diş: ${appliedFilters.teethNo}` });
    }
    if (appliedFilters.startDate || appliedFilters.endDate) {
      chips.push({
        key: "dateRange",
        label: `Tarix: ${formatFilterDate(
          appliedFilters.startDate
        )} — ${formatFilterDate(appliedFilters.endDate)}`,
      });
    }

    return chips;
  }, [appliedFilters]);

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString("az-AZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const updateFilter = (name, value) => {
    setFilters((current) => {
      const next = { ...current, [name]: value };

      if (name === "startDate" && next.endDate && value > next.endDate) {
        next.endDate = "";
      }

      return next;
    });
  };

  const applyFilters = (event) => {
    event.preventDefault();

    if (
      filters.startDate &&
      filters.endDate &&
      new Date(filters.startDate) > new Date(filters.endDate)
    ) {
      setError("Başlama tarixi bitmə tarixindən sonra ola bilməz.");
      return;
    }

    setError("");
    setPage(0);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
  };

  const applyQuickDate = (period) => {
    const nextFilters = { ...filters, ...getQuickDateRange(period) };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(0);
    setError("");
  };

  const removeFilter = (key) => {
    const fields = key === "dateRange" ? ["startDate", "endDate"] : [key];
    const nextFilters = { ...filters };
    const nextAppliedFilters = { ...appliedFilters };

    fields.forEach((field) => {
      nextFilters[field] = "";
      nextAppliedFilters[field] = "";
    });

    setFilters(nextFilters);
    setAppliedFilters(nextAppliedFilters);
    setPage(0);
  };

  const changePageSize = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const exportCurrentPage = () => {
    if (!rows.length) return;

    const headings = [
      "Plan tarixi",
      "Pasiyent",
      "Diş No",
      "Əməliyyat",
      "Planlayan həkim",
      "Qiymət",
      "Endirim",
      "Yekun",
      "İcra tarixi",
      "İcraçı həkim",
    ];
    const escapeCsvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csvRows = rows.map((item) => [
      formatDate(item.planDate),
      item.patientName || "-",
      item.teethNo || "-",
      item.operationName || "-",
      item.planningDoctorName || "-",
      item.price || 0,
      item.discount || 0,
      item.finalPrice || 0,
      formatDate(item.executionDate),
      item.executionDoctorName || "-",
    ]);
    const csv = [headings, ...csvRows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const file = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `pasiyent-${patientId}-hesabat-${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshReports = () => loadReports();

  return (
    <div className="patientReportWrapper">
      <section className="patientReportHeader">
        <div>
          <div className="patientReportEyebrow">
            <FiFileText aria-hidden="true" /> Pasiyent kartı
          </div>
          <h1>Görülən işlər hesabatı</h1>
          <p>Müalicə planları və icra edilən əməliyyatların xülasəsi</p>
        </div>
        <div className="patientReportHeaderActions">
          <button
            type="button"
            className="patientReportIconButton"
            onClick={refreshReports}
            disabled={loading}
            title="Məlumatları yenilə"
            aria-label="Məlumatları yenilə"
          >
            <FiRefreshCw className={loading ? "isSpinning" : ""} />
          </button>
          <button
            type="button"
            className="patientReportExportButton"
            onClick={exportCurrentPage}
            disabled={!rows.length || loading}
          >
            <FiDownload aria-hidden="true" /> Cari səhifəni CSV ixrac et
          </button>
        </div>
      </section>

      <form className="patientReportFilters" onSubmit={applyFilters}>
        <label className="patientReportFilterField patientReportOperationField">
          <span>Əməliyyat</span>
          <div className="patientReportInputWithIcon">
            <FiSearch aria-hidden="true" />
            <input
              type="text"
              value={filters.operationName}
              onChange={(event) =>
                updateFilter("operationName", event.target.value)
              }
              placeholder="Əməliyyat adı ilə axtar"
            />
          </div>
        </label>
        <label className="patientReportFilterField">
          <span>Diş nömrəsi</span>
          <CustomDropdown
            value={filters.teethNo}
            onChange={(option) => updateFilter("teethNo", option.value)}
            placeholder="Bütün dişlər"
            options={toothOptions}
          />
        </label>
        <label className="patientReportFilterField">
          <span>Başlama tarixi</span>
          <div className="patientReportInputWithIcon">
            <FiCalendar aria-hidden="true" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter("startDate", event.target.value)}
              aria-label="Başlama tarixi"
            />
          </div>
        </label>
        <label className="patientReportFilterField">
          <span>Bitmə tarixi</span>
          <div className="patientReportInputWithIcon">
            <FiCalendar aria-hidden="true" />
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(event) => updateFilter("endDate", event.target.value)}
              aria-label="Bitmə tarixi"
            />
          </div>
        </label>
        <div className="patientReportFilterActions">
          <button type="submit" className="patientReportSearchButton">
            <FiSearch aria-hidden="true" /> Axtar
          </button>
          <button
            type="button"
            className="patientReportClearButton"
            onClick={clearFilters}
          >
            <FiRotateCcw aria-hidden="true" /> Sıfırla
          </button>
        </div>
      </form>

      <div className="patientReportFilterToolbar">
        <div className="patientReportQuickDates" aria-label="Sürətli tarix seçimi">
          <span>Sürətli seçim:</span>
          {quickDateOptions.map((option) => {
            const range = getQuickDateRange(option.value);
            const isActive =
              appliedFilters.startDate === range.startDate &&
              appliedFilters.endDate === range.endDate;

            return (
              <button
                key={option.value}
                type="button"
                className={isActive ? "active" : ""}
                onClick={() => applyQuickDate(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {activeFilterChips.length > 0 && (
          <div className="patientReportActiveFilters" aria-label="Aktiv filterlər">
            <span>Aktiv filterlər:</span>
            {activeFilterChips.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => removeFilter(filter.key)}
                title={`${filter.label} filtrini sil`}
              >
                {filter.label} <FiX aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              className="patientReportClearAllFilters"
              onClick={clearFilters}
            >
              Hamısını sil
            </button>
          </div>
        )}
      </div>

      <section className="patientReportSummary" aria-label="Hesabat xülasəsi">
        <div className="patientReportSummaryCard">
          <span>Əməliyyat sayı</span>
          <strong>{reportPage.totalElements || 0}</strong>
          <small>Tapılan ümumi qeyd</small>
        </div>
        <div className="patientReportSummaryCard">
          <span>Qiymət</span>
          <strong>{formatMoney(currentPageTotals.price)}</strong>
          <small>Bu səhifə üzrə</small>
        </div>
        <div className="patientReportSummaryCard patientReportSummaryDiscount">
          <span>Endirim</span>
          <strong>{formatMoney(currentPageTotals.discount)}</strong>
          <small>Bu səhifə üzrə</small>
        </div>
        <div className="patientReportSummaryCard patientReportSummaryTotal">
          <span>Yekun məbləğ</span>
          <strong>{formatMoney(currentPageTotals.finalPrice)}</strong>
          <small>Bu səhifə üzrə</small>
        </div>
      </section>

      {error && (
        <div className="patientReportMessage error" role="alert">
          <div>
            <strong>Hesabat yüklənmədi</strong>
            <span>{error}</span>
          </div>
          <button type="button" onClick={refreshReports}>
            Yenidən yoxla
          </button>
        </div>
      )}

      <p className="patientReportScreenReaderStatus" aria-live="polite">
        {loading
          ? "Hesabat məlumatları yüklənir"
          : error
            ? "Hesabat yüklənmədi"
            : `${reportPage.totalElements || 0} hesabat qeydi göstərilir`}
      </p>

      <div className="patientReportTableWrapper" aria-busy={loading}>
        <div className="patientReportTableHeader">
          <div>
            <h2>Əməliyyat siyahısı</h2>
            <p>
              {rows.length
                ? `${firstRowNumber}–${lastRowNumber} arası qeydlər göstərilir`
                : "Göstəriləcək qeyd yoxdur"}
            </p>
          </div>
          <div className="patientReportTableMeta">
            <span className="patientReportSortNote">İcra tarixinə görə yenidən köhnəyə</span>
            {formattedLastUpdated && (
              <span className="patientReportLastUpdated">
                Son yenilənmə: {formattedLastUpdated}
              </span>
            )}
          </div>
        </div>
        <div className="patientReportTableScrollContainer">
          <table className="patientReportTable">
            <thead>
              <tr>
                <th>#</th>
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
                    <span className="patientReportLoadingDot" /> Məlumatlar yüklənir...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((item, index) => (
                  <tr
                    key={item.id || `${item.executionDate}-${item.teethNo}-${index}`}
                  >
                    <td>{page * pageSize + index + 1}</td>
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
                    <FiFileText aria-hidden="true" />
                    <strong>Bu meyarlara uyğun hesabat tapılmadı.</strong>
                    <span>Filterləri dəyişib yenidən axtarın.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="patientReportFooter">
        <div className="patientReportFooterInfo">
          <span>
            Cəmi <strong>{reportPage.totalElements || 0}</strong> qeyd
          </span>
          <label className="patientReportPageSize">
            Səhifədə
            <select value={pageSize} onChange={changePageSize} disabled={loading}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        {totalPages > 1 && (
          <div className="patientReportPagination">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Əvvəlki səhifə"
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            {paginationItems.map((item) =>
              typeof item === "string" ? (
                <span key={item} className="patientReportPaginationEllipsis">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={page === item ? "active" : ""}
                  disabled={loading}
                  onClick={() => setPage(item)}
                  aria-label={`${item + 1}-ci səhifə`}
                  aria-current={page === item ? "page" : undefined}
                >
                  {item + 1}
                </button>
              )
            )}
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Növbəti səhifə"
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientReport;
