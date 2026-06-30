import React, { useState, useEffect, useCallback } from 'react';
import { CiSearch, CiCircleInfo } from 'react-icons/ci';
import { HiArrowsUpDown } from 'react-icons/hi2';
import { FiEdit3 } from 'react-icons/fi';
import { GoTrash } from 'react-icons/go';
import "../../assets/style/StockExport/stockexports.css";
import { useNavigate, useLocation } from 'react-router-dom';
import useWarehouseRemovalProductsStore from '../../../stores/warehouseRemovalProductsStore';

function StockExports() {
    const navigate = useNavigate();
    const location = useLocation();

    const urlId = pathParts[pathParts.length - 1]; 
    const filterById = !isNaN(urlId) && parseInt(urlId) > 0 ? parseInt(urlId) : null;

    console.log("URL-den alinan ID:", urlId, "Filtrleme ucun ID:", filterById);

    const {
        products,
        loading,
        error,
        fetchAllProducts,
        fetchProductsBySearch,
        searchTerm,
        setSearchTerm,
    } = useWarehouseRemovalProductsStore();

    // Düzəliş 2: useEffect-də məhsulları filtrləyirik
    useEffect(() => {
        // Əgər URL-də ID varsa, yalnız ona uyğun məhsulu yükləyirik
        // Əgər ID yoxdursa (əsas `/stock/export` səhifəsindədirsə), bütün məhsulları yükləyirik
        if (filterById) {
            // Fərziyyə: store-da fərdi məhsul üçün bir fetch funksiyası var
            // Yoxdursa, aşağıdakı kimi filterləyə bilərik:
            fetchAllProducts();
        } else {
            fetchAllProducts();
        }
    }, [fetchAllProducts, filterById]);

    const handleSearch = useCallback(() => {
        fetchProductsBySearch();
    }, [fetchProductsBySearch]);

    const handleDelete = useCallback((id) => {
        console.log("Delete product with ID:", id);
        if (window.confirm(`Are you sure you want to delete item with ID: ${id}?`)) {
            alert(`Deleting item ${id} (not implemented in API yet)`);
        }
    }, []);

    if (loading) {
        return <div className="loading-state">Məlumatlar yüklənir...</div>;
    }

    if (error) {
        return <div className="error-state">Xəta: {error}</div>;
    }

    // Düzəliş 3: tableData-nı filterləyirik
    const filteredProducts = filterById ? products.filter(item => item.warehouseRemovalId === filterById) : products;

    const tableData = filteredProducts.map(item => ({
        id: item.id,
        date: item.date,
        time: item.time ? item.time.substring(0, 5) : 'N/A',
        count: item.number,
        status: item.pendingStatus,
        groupId: item.id
    }));

    return (
        <div className="stockExportsContainer">
            <div className="stockExportsSearchBar">
                <div className="stockExportsSearchBarContainer">
                    <input
                        type="text"
                        placeholder="Axtarış"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="stockExportsSearchIcon" onClick={handleSearch}>
                        <CiSearch />
                    </button>
                </div>
                <button onClick={() => navigate('add')} className="stockExportsAddButton">
                    + Yenisini əlavə et
                </button>
            </div>
            
            <div className="stockExportsTableContainer">
                <table>
                    <thead>
                        <tr>
                            <th><span><HiArrowsUpDown className="stockExportsTableArrowIcon" /> ID</span></th>
                            <th><span><HiArrowsUpDown className="stockExportsTableArrowIcon" /> Tarix</span></th>
                            <th><span><HiArrowsUpDown className="stockExportsTableArrowIcon" /> Çeşid sayı</span></th>
                            <th><span>Status</span></th>
                            <th><span>Düzəliş</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length > 0 ? (
                            tableData.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.date}</td>
                                    <td>{row.count}</td>
                                    <td>
                                        <div className={`stockExportsStatus ${row.status === 'WAITING' ? 'stockExportsStatusPending' : 'stockExportsStatusActive'}`}>
                                            {row.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="stockExportsIcons">
                                            <CiCircleInfo
                                                onClick={() => navigate(`detail/${row.groupId}`)}
                                                className="stockExportsInfoIcon"
                                            />
                                            <FiEdit3
                                                className="stockExportsEditIcon"
                                                onClick={() => navigate(`edit/${row.groupId}`)}
                                            />
                                            <GoTrash
                                                className="stockExportsDeleteIcon"
                                                onClick={() => handleDelete(row.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    Məlumat tapılmadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockExports;