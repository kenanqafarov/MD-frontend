import React, { useState, useRef } from 'react';
import '../../assets/style/StockExport/editexportstock.css';
import AddPhotoIcon from "../../assets/icons/AddPhoto";
import CloseIcon from "../../assets/icons/Close";

const EditExportStock = () => {
    const [files, setFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        quantity: '',
        notes: '',
        products: [
            {
                category: 'Sementlər',
                productName: 'Sementlər A1',
                specifications: 'Boş, Türkiyə',
                orderQuantity: 4,
                sentQuantity: 0,
                remainingQuantity: 1,
                totalPrice: ''
            },
        ]
    },
);

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
        // Handle form submission
    };

    return (
        <div className="editExportStockContainer">
            <form onSubmit={handleSubmit}>
                <div className="editExportStockTopPart">
                    <div className="editExportStockFormGroup">
                        <label>Sifariş tarixi</label>
                        <input 
                            type="date" 
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                    <div className="editExportStockFormGroup">
                        <label>Saat</label>
                        <input 
                            type="time" 
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                        />
                    </div>
                    <div className="editExportStockFormGroup">
                        <label>Çeşid sayı</label>
                        <input 
                            type="number" 
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        />
                    </div>
                    <div className="editExportStockFormGroup">
                        <label>Qeyd</label>
                        <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="editExportStockTableSection">
                    <h3>Məhsullar</h3>
                    <table className="editExportStockTable">
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
                                            onChange={(e) => {
                                                const newProducts = [...formData.products];
                                                newProducts[index].totalPrice = e.target.value;
                                                setFormData({...formData, products: newProducts});
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="editExportStockUpload">
                    <label className="editExportStockDocumentLabel">Sənədlər*</label>
                    <div className="uploadContainer">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                            className="hidden"
                            style={{ display: "none" }}
                        />
                        <button
                            type="button"
                            className="editExportStockUploadButton"
                            onClick={handleUploadClick}
                        >
                            <AddPhotoIcon />
                            <span>Müvafiq sənədləri yükləyin</span>
                        </button>

                        {files.length > 0 && (
                            <div className="imagePreviewContainer">
                                {files.map((file, index) => (
                                    <div key={index} className="imagePreview">
                                        <img
                                            src={file}
                                            alt={`file-${index}`}
                                            onClick={() => handleImageClick(file)}
                                        />
                                        <button
                                            className="deleteButton"
                                            onClick={() => handleDeleteImage(index)}
                                            type="button"
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedImage && (
                    <div className="modalOverlay" onClick={() => setSelectedImage(null)}>
                        <div className="modalContent">
                            <img src={selectedImage} alt="full-size" />
                        </div>
                    </div>
                )}

                <div className="editExportStockButtonGroup">
                    <button type="button" className="editExportStockCancelButton">
                        İmtina et
                    </button>
                    <button type="submit" className="editExportStockSaveButton">
                        Yadda saxla
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditExportStock;