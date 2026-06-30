import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAddPhotoAlternate, MdCancel } from "react-icons/md";
import { RxCross2 } from 'react-icons/rx';
import { FaCheck } from 'react-icons/fa';
import usePatientInsuranceBalanceStore from "../../../stores/PatientInsuranceBalanceStore";
import BlurLoader from "../../components/layout/BlurLoader";
import { toast } from "react-toastify";

const PatientInsuranceBalanceEdit = () => {
    const navigate = useNavigate();
    const { id: insuranceId, balanceId } = useParams();
    const fileInputRef = useRef(null);

    const { 
        editBalance, 
        fetchBalanceById, 
        selectedBalance,
        loading 
    } = usePatientInsuranceBalanceStore();

    const [formData, setFormData] = useState({
        date: '',
        amount: '',
        patientInsuranceId: Number(insuranceId) || 0,
    });

    const [files, setFiles] = useState([]);
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (balanceId) {
            fetchBalanceById(Number(balanceId));
        }
    }, [balanceId, fetchBalanceById]);

    useEffect(() => {
        if (selectedBalance && selectedBalance.id === Number(balanceId)) {
            setFormData({
                date: selectedBalance.date || '',
                amount: selectedBalance.amount || '',
                patientInsuranceId: selectedBalance.patientInsuranceId || Number(insuranceId) || 0,
            });
            setExistingDocuments(selectedBalance.documents || []);
        }
    }, [selectedBalance, balanceId, insuranceId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: '',
            }));
        }
    };

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
        event.target.value = ''; 
    };

    const handleUploadClick = () => {
        fileInputRef.current.click(); 
    };

    const handleDeleteNewFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingFile = (index) => {
        setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.date) newErrors.date = 'Tarix boş ola bilməz.';
        if (!formData.amount) {
            newErrors.amount = 'Məbləğ boş ola bilməz.';
        } else if (isNaN(formData.amount)) {
            newErrors.amount = 'Məbləğ rəqəm olmalıdır.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const dataToSend = new FormData();
        dataToSend.append(
            "obj",
            JSON.stringify({
                date: formData.date,
                amount: Number(formData.amount),
                patientInsuranceId: Number(formData.patientInsuranceId),
                // Send existing docs if backend supports it, or just new ones
                existingDocuments: existingDocuments 
            })
        );

        files.forEach((file) => dataToSend.append("documents", file));

        try {
            await editBalance(Number(balanceId), dataToSend);
            toast.success('Məlumatlar uğurla yeniləndi!');
            navigate(-1);
        } catch (err) {
            toast.error("Xəta baş verdi: " + err.message);
        }
    };

    const handleCancel = () => {
        navigate(-1); 
    };

    return (
        <BlurLoader isLoading={loading}>
            <div className="flex flex-col h-full bg-white rounded-lg p-6 shadow-md">
                <div className="flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <label htmlFor="date" className="w-24 text-sm font-medium text-gray-700">
                                Tarix <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow">
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={`block w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-[#155EEF] focus:border-[#155EEF] text-sm`}
                                    required
                                />
                                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <label htmlFor="amount" className="w-24 text-sm font-medium text-gray-700">
                                Məbləğ <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow">
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className={`block w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-[#155EEF] focus:border-[#155EEF] text-sm`}
                                    placeholder="Məbləği daxil edin"
                                    required
                                />
                                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <label htmlFor="document" className="w-24 text-sm font-medium text-gray-700 mt-2">
                                Sənəd
                            </label>
                            <div className="flex-grow flex flex-col gap-3">
                                <input
                                    type="file"
                                    id="document"
                                    name="document"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden" 
                                    accept="image/*" 
                                    multiple 
                                />
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    className="inline-flex items-center justify-center w-[200px] px-4 py-2 text-[#fff] bg-[#155EEF] border border-gray-300 rounded-[8px] shadow-sm text-sm font-medium cursor-pointer hover:bg-[#153EEF]"
                                >
                                    <MdAddPhotoAlternate className="mr-2 h-5 w-5" />
                                    Sənəd faylını yükləyin
                                </button>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {/* Existing Documents */}
                                    {existingDocuments.map((doc, index) => (
                                        <div key={`existing-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                            <img
                                                src={doc.url || doc}
                                                alt={`Sənəd ${index + 1}`}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => setSelectedImage(doc.url || doc)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 flex items-center justify-center w-5 h-5 shadow-md hover:bg-red-600"
                                            >
                                                <MdCancel className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New Files */}
                                    {files.map((file, index) => (
                                        <div key={`new-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border border-blue-200 shadow-sm opacity-80">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Yeni Sənəd ${index + 1}`}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => setSelectedImage(URL.createObjectURL(file))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteNewFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 flex items-center justify-center w-5 h-5 shadow-md hover:bg-red-600"
                                            >
                                                <MdCancel className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                        <div className="relative max-w-3xl max-h-full overflow-auto rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                            <img src={selectedImage} alt="full-size" className="max-w-full max-h-full object-contain" />
                            <button
                                className="absolute top-2 right-2 bg-white text-gray-800 rounded-full p-1.5 flex items-center justify-center shadow-md hover:bg-gray-200"
                                onClick={() => setSelectedImage(null)}
                            >
                                <RxCross2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300"
                    >
                        <RxCross2 className="mr-2 h-4 w-4" /> İmtina et
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="flex items-center justify-center bg-[#155EEF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#124DCC] transition-all duration-300"
                    >
                        <FaCheck className="mr-2 h-4 w-4" /> Yadda saxla
                    </button>
                </div>
            </div>
        </BlurLoader>
    );
};

export default PatientInsuranceBalanceEdit;