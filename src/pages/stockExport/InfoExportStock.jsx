import React, { useState, useRef, useEffect } from 'react';
import '../../assets/style/StockExport/infoexportstock.css';
import { FiEdit3 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { useNavigate, useParams } from 'react-router-dom';
import useWarehouseRemovalsStore from '../../../stores/warehouseRemovalsStore';

const InfoExportStock = ({ data: propData }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedRemovalDetails, fetchRemovalDetails, loading, error } = useWarehouseRemovalsStore();
    
    const [files, setFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        quantity: '',
        notes: '',
        status: 'PENDING',
        products: []
    });

    useEffect(() => {
        if (propData) {
            setFieldsFromData(propData);
        } else if (id) {
            fetchRemovalDetails(id);
        }
    }, [id, propData, fetchRemovalDetails]);

    useEffect(() => {
        if (selectedRemovalDetails && !propData) {
            setFieldsFromData(selectedRemovalDetails);
        }
    }, [selectedRemovalDetails, propData]);

    const setFieldsFromData = (data) => {
        setFormData({
            date: data.date || '',
            time: data.time || '',
            quantity: data.warehouseRemovalProducts?.length || 0,
            notes: data.description || '',
            status: data.status || 'PENDING',
            products: (data.warehouseRemovalProducts || []).map(p => ({
                category: p.categoryName || 'Sementlər',
                productName: p.productName || 'Məhsul',
                specifications: p.specifications || '-',
                orderQuantity: p.quantity || 0,
                sentQuantity: p.sentQuantity || 0,
                remainingQuantity: p.remainingQuantity || 0,
                totalPrice: p.price || ''
            }))
        });
    };

    const handleDeleteImage = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImageClick = (file) => {
        setSelectedImage(file);
    };

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
        setFiles((prev) => [...prev, ...imageUrls]);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const getStatusClass = (status) => {
        return `infoExport${status}`;
    };

    const handleEdit = () => {
        navigate(`/stock/export/${id}/edit`);
    }

    const handleDelete = () => {
        console.log('Delete');
    }

    if (loading) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="infoExportStockContainer">
            <div className="infoExportStockContainerTopButtons">
                <FiEdit3 onClick={handleEdit} className="infoExportStockContainerTopButtonDetail"/>
                <GoTrash onClick={handleDelete} className="infoExportStockContainerTopButtonDelete"/>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="infoExportStockTopPart">
                    <div className="infoExportStockFormGroup">
                        <label>Status</label>
                        <div className="infoExportStatusContainer">
                            <div className={`infoExportStockStatus ${getStatusClass(formData.status)}`}>
                                {formData.status}
                            </div>
                        </div>
                    </div>
                    <div className="infoExportStockFormGroup">
                        <label>Sifariş tarixi</label>
                        <input 
                            type="date" 
                            value={formData.date}
                            readOnly
                        />
                    </div>
                    <div className="infoExportStockFormGroup">
                        <label>Saat</label>
                        <input 
                            type="time" 
                            value={formData.time ? formData.time.slice(0,5) : ''}
                            readOnly
                        />
                    </div>
                    <div className="infoExportStockFormGroup">
                        <label>Çeşid sayı</label>
                        <input 
                            type="number" 
                            value={formData.quantity}
                            readOnly
                        />
                    </div>
                    
                    <div className="infoExportStockFormGroup">
                        <label>Qeyd</label>
                        <textarea 
                            value={formData.notes}
                            readOnly
                        />
                    </div>
                </div>
                <div className="infoExportStockTableSection">
                    <h3>Məhsullar</h3>
                    <table className="infoExportStockTable">
                        <thead>
                            <tr>
                                <th>Kateqoriyası</th>
                                <th>Məhsulun adı</th>
                                <th>Özəllikləri</th>
                                <th>Sifariş miq.</th>
                                <th>Göndərilən miq.</th>
                                <th>Qalıq miqdar</th>
                                <th>Cari məxaric</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.products.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.category}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.specifications}</td>
                                    <td>{product.orderQuantity}</td>
                                    <td>{product.sentQuantity}</td>
                                    <td>{product.remainingQuantity}</td>
                                    <td>
                                        <input 
                                            type="number"
                                            value={product.totalPrice}
                                            readOnly
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="infoExportStockButtonGroup">
                    <button type="button" className="infoExportStockCancelButton" onClick={() => navigate(-1)}>
                        Geri qayıt
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InfoExportStock;