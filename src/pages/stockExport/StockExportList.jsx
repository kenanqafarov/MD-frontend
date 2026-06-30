import React, { useEffect, useState, useCallback } from "react";
import "../../assets/style/StockExport/stockexportlist.css";
import { CiSearch, CiExport, CiCircleInfo } from "react-icons/ci";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiShoppingBag } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import useWarehouseRemovalsStore from "../../../stores/warehouseRemovalsStore";

function StockExportList() {
  const navigate = useNavigate();
  const {
    removals,
    loading,
    error,
    fetchAllRemovals,
    fetchRemovals,
    searchTerm,
    setSearchTerm,
    fetchWorkerName,
  } = useWarehouseRemovalsStore();

  useEffect(() => {
    fetchAllRemovals();
  }, [fetchAllRemovals]);

  useEffect(() => {
    const processWorkerNames = async () => {
      if (!removals || removals.length === 0) return;

      const uniqueWorkerIds = [...new Set(removals.map(r => r.personWhoPlacedOrder))].filter(Boolean);
      const newNamesToFetch = [];

      for (const workerId of uniqueWorkerIds) {
        const cachedName = useWarehouseRemovalsStore.getState().workersCache[workerId];
        if (!cachedName) {
          newNamesToFetch.push(workerId);
        }
      }

      await Promise.all(newNamesToFetch.map(id => fetchWorkerName(id)));
    };

    processWorkerNames();
  }, [removals, fetchWorkerName]);

  const handleSearch = useCallback(() => {
    fetchRemovals();
  }, [fetchRemovals]);

  const handleExport = useCallback(() => {
    console.log("Export button clicked!");
  }, []);

  const handleInfoClick = useCallback((row) => {
    navigate(`/stock/export/info/${row.id}`);
    console.log("Info for row:", row);
  }, [navigate]);

  if (loading) {
    return <div className="loading-state">Məlumatlar yüklənir...</div>;
  }

  if (error) {
    return <div className="error-state">Xəta: {error}</div>;
  }

  const tableData = removals.filter(removal => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const personName = useWarehouseRemovalsStore.getState().workersCache[removal.personWhoPlacedOrder] || removal.personWhoPlacedOrder;
    
    return (
      removal.cabinetName?.toLowerCase().includes(lowerCaseSearchTerm) ||
      personName.toLowerCase().includes(lowerCaseSearchTerm) ||
      removal.date?.includes(lowerCaseSearchTerm) ||
      removal.time?.includes(lowerCaseSearchTerm.substring(0, 5))
    );
  }).map((item, index) => ({
    id: item.id || index+1,
    date: item.date,
    time: item.time ? item.time.substring(0, 5) : '',
    room: item.cabinetName,
    personWhoPlacedOrder: useWarehouseRemovalsStore.getState().workersCache[item.personWhoPlacedOrder] || item.personWhoPlacedOrder,
    cesidSayi: item.warehouseRemovalProducts ? item.warehouseRemovalProducts.length : 0,
    sifarisCount: item.orderAmount,
    gonderilenCount: item.sendAmount,
    qalanCount: item.remainingAmount,
    linkId: item.number,
  }));

  return (
    <div className="stock-export-container">
      <div className="search-bar">
        <div className="searchBarContainer">
          <input
            type="text"
            placeholder="Axtarış..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="searchIconBTN" onClick={handleSearch}>
            <CiSearch />
          </button>
        </div>
        <button className="download-btn" onClick={handleExport}>
          <CiExport />
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <span>
                  {tableData.length === 0 ? "0" : `1-${tableData.length}`}
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Tarix
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Saat
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Otaq
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Sifariş verən
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Çeşid sayı
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Sifariş miq.
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Göndərilən miq.
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Qalıq miq.
                </span>
              </th>
              <th>
                <span>
                  <HiArrowsUpDown className="tableArrowIcon" /> Məxariclər
                </span>
              </th>
              <th>
                <span>Düzəliş</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.date}</td>
                  <td>{row.time}</td>
                  <td>{row.room}</td>
                  <td>{row.personWhoPlacedOrder}</td>
                  <td>{row.cesidSayi}</td>
                  <td>{row.sifarisCount}</td>
                  <td>{row.gonderilenCount}</td>
                  <td>{row.qalanCount}</td>
                  <td>
                    <Link
                      className="stockExportCheckIconContainer"
                      to={`/stock/export/${row.id}`}
                    >
                      <FiShoppingBag className="stockExportCheckIcon" />
                    </Link>
                  </td>
                  <td>
                    <div className="icons flex gap-3 cursor-pointer">
                      <CiCircleInfo
                        className="info"
                        onClick={() => handleInfoClick(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4">
                  Heç bir məlumat tapılmadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockExportList;
