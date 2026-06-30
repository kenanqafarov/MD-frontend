import React, { useState, useEffect, useCallback } from 'react';
import '../../assets/style/StockExport/addexportstock.css';
import useWarehouseRemovalProductsStore from '../../../stores/warehouseRemovalProductsStore';
import useWarehouseRemovalsStore from '../../../stores/warehouseRemovalsStore';
import { useNavigate, useLocation } from 'react-router-dom';

const AddExportStock = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // URL path-dən ID-ni əldə edirik
    const pathParts = location.pathname.split('/');
    const id = pathParts[pathParts.length - 2];

    console.log("AddExportStock: URL-dən alınan ID:", id);

    const { createProduct } = useWarehouseRemovalProductsStore();
    const { 
        fetchRemovalDetails, 
        selectedRemovalDetails, 
        loading: selectedRemovalLoading,
        error: selectedRemovalError
    } = useWarehouseRemovalsStore();

    const [quantity, setQuantity] = useState(0);

    const initialFormData = {
        date: '',
        time: '',
        warehouseRemovalId: id || '',
        requests: [],
        description: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setQuantity(formData.requests.length);
    }, [formData.requests]);

    useEffect(() => {
        if (id) {
            fetchRemovalDetails(id);
        }
    }, [id, fetchRemovalDetails]);

    useEffect(() => {
        if (selectedRemovalDetails) {
            const formattedTime = selectedRemovalDetails.time 
                ? (typeof selectedRemovalDetails.time === 'string' 
                    ? selectedRemovalDetails.time.substring(0, 5) 
                    : `${selectedRemovalDetails.time.hour.toString().padStart(2, '0')}:${selectedRemovalDetails.time.minute.toString().padStart(2, '0')}`)
                : '';

            if (selectedRemovalDetails.warehouseRemovalProducts && selectedRemovalDetails.warehouseRemovalProducts.length > 0) {
                const newProducts = selectedRemovalDetails.warehouseRemovalProducts.map(product => ({
                    orderFromWarehouseProductId: product.id, 
                    currentExpenses: 0,
                    category: product.categoryName || 'N/A',
                    productName: product.productName || 'N/A',
                    specifications: product.productTitle || 'N/A',
                    orderQuantity: product.quantity || 0,
                    sentQuantity: product.sendAmount || 0,
                    remainingQuantity: (product.quantity || 0) - (product.sendAmount || 0),
                }));
                
                setFormData(prev => ({
                    ...prev,
                    date: selectedRemovalDetails.date || '',
                    time: formattedTime,
                    description: selectedRemovalDetails.description || '',
                    requests: newProducts
                }));
            } else {
                setFormData(prev => ({ 
                    ...prev, 
                    date: selectedRemovalDetails.date || '',
                    time: formattedTime,
                    description: selectedRemovalDetails.description || '',
                    requests: [] 
                }));
            }
        }
    }, [selectedRemovalDetails]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProductChange = useCallback((index, value) => {
        setFormData((prev) => {
            const newRequests = [...prev.requests];
            const remaining = newRequests[index].remainingQuantity;
            let parsedValue = parseInt(value);
            
            if (parsedValue < 0) {
                parsedValue = 0;
            }
            if (parsedValue > remaining) {
                parsedValue = remaining;
            }

            newRequests[index] = {
                ...newRequests[index],
                currentExpenses: parsedValue,
            };
            return { ...prev, requests: newRequests };
        });
    }, []);

    const handleDeleteProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            requests: prev.requests.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.date || !formData.time || !formData.warehouseRemovalId) {
            alert("Tarix, saat və Anbar Məxaric ID boş ola bilməz.");
            return;
        }
        if (formData.requests.length === 0) {
            alert("Məhsul siyahısı boş ola bilməz.");
            return;
        }

        const isValidQuantities = formData.requests.every(product =>
            product.currentExpenses >= 0 && product.currentExpenses <= product.remainingQuantity
        );
        if (!isValidQuantities) {
            alert("Cari məxaric miqdarı 0-dan az və ya qalıq miqdarından çox ola bilməz.");
            return;
        }
        
        const dataToSend = {
            date: formData.date,
            time: `${formData.time}:00`,
            warehouseRemovalId: parseInt(formData.warehouseRemovalId),
            requests: formData.requests.map(product => ({
                orderFromWarehouseProductId: product.orderFromWarehouseProductId,
                currentExpenses: parseInt(product.currentExpenses),
            })),
            description: formData.description,
        };

        console.log("Göndərilən Data:", JSON.stringify(dataToSend, null, 2));

        try {
            await createProduct(dataToSend);
            navigate('/stock/export');
        } catch (err) {
            console.error("Məxaric əlavə edilərkən xəta baş verdi:", err);
            alert("Məxaric əlavə edilərkən xəta baş verdi: " + err.message);
        }
    };

    return (
        <div className="addExportStockContainer">
            <form onSubmit={handleSubmit}>
                <div className="addExportStockTopPart">
                    <div className="addExportStockFormGroup">
                        <label>Sifariş tarixi</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="addExportStockFormGroup">
                        <label>Saat</label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="addExportStockFormGroup">
                        <label>Anbar Məxaric ID</label>
                        <input
                            type="number"
                            name="warehouseRemovalId"
                            value={id || ''}
                            readOnly
                            className="read-only-input"
                            required
                        />
                    </div>
                    <div className="addExportStockFormGroup">
                        <label>Çeşid sayı</label>
                        <input
                            type="number"
                            name="quantity"
                            value={quantity}
                            readOnly
                            className="read-only-input"
                        />
                    </div>
                    <div className="addExportStockFormGroup">
                        <label>Qeyd</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="addExportStockTableSection">
                    <h3>Məhsullar</h3>
                    {selectedRemovalLoading ? (
                        <div className="loading-message">Məhsullar yüklənir...</div>
                    ) : selectedRemovalError ? (
                        <div className="error-message">Xəta: Məlumatlar yüklənərkən problem yarandı. {selectedRemovalError}</div>
                    ) : (
                        <table className="addExportStockTable">
                            <thead>
                                <tr>
                                    <th>Kateqoriyası</th>
                                    <th>Məhsulun adı</th>
                                    <th>Özəllikləri</th>
                                    <th>Sifariş miq.</th>
                                    <th>Göndərilən miq.</th>
                                    <th>Qalıq miqdar</th>
                                    <th>Cari məxaric</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.requests.length > 0 ? (
                                    formData.requests.map((product, index) => (
                                        <tr key={product.orderFromWarehouseProductId || index}>
                                            <td>{product.category}</td>
                                            <td>{product.productName}</td>
                                            <td>{product.specifications}</td>
                                            <td>{product.orderQuantity}</td>
                                            <td>{product.sentQuantity}</td>
                                            <td>{product.remainingQuantity}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={product.currentExpenses}
                                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                                    min="0"
                                                    max={product.remainingQuantity}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteProduct(index)}
                                                    className="delete-product-button"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">
                                            Məhsullar əlavə edilməyib.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-button">Məxaric Yarat</button>
                    <button type="button" className="cancel-button" onClick={() => navigate('/stock/export')}>Ləğv Et</button>
                </div>
            </form>
        </div>
    );
};

export default AddExportStock;