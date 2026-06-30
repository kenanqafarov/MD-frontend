import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RxCross2 } from 'react-icons/rx';
import EditIcon from "../../assets/icons/Edit";
import DeleteIcon from "../../assets/icons/Delete";
import usePatientInsuranceBalanceStore from "../../../stores/PatientInsuranceBalanceStore";
import BlurLoader from "../../components/layout/BlurLoader";
import { toast } from "react-toastify";

const PatientInsuranceBalanceInfo = () => {
    const navigate = useNavigate();
    const { id: insuranceId, balanceId } = useParams(); 

    const { 
        fetchBalanceById, 
        selectedBalance, 
        removeBalance,
        loading 
    } = usePatientInsuranceBalanceStore();

    const [data, setData] = useState({
        date: '',
        amount: '',
        documents: [],
    });

    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (balanceId) {
            fetchBalanceById(Number(balanceId));
        }
    }, [balanceId, fetchBalanceById]);

    useEffect(() => {
        if (selectedBalance && selectedBalance.id === Number(balanceId)) {
            setData({
                date: selectedBalance.date || '',
                amount: selectedBalance.amount || '',
                documents: selectedBalance.documents || [],
            });
        }
    }, [selectedBalance, balanceId]);

    const handleEditClick = () => {
        navigate(`../edit/${balanceId}`);
    };

    const handleDeleteClick = async () => {
        if (window.confirm('Bu məlumatı silmək istədiyinizə əminsiniz?')) {
            try {
                await removeBalance(Number(balanceId));
                toast.success("Məlumat uğurla silindi");
                navigate(-1);
            } catch (err) {
                toast.error("Silinərkən xəta baş verdi");
            }
        }
    };

    const handleImageClick = (fileUrl) => {
        setSelectedImage(fileUrl); 
    };

    return (
        <BlurLoader isLoading={loading}>
            <div className="flex flex-col h-full bg-white rounded-lg p-6 shadow-md">
                <div className="flex justify-end gap-3 mb-4">
                    <button
                        type="button"
                        onClick={handleEditClick}
                        className="flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                        title="Redaktə et"
                    >
                        <EditIcon /> 
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="flex items-center justify-center p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200"
                        title="Sil"
                    >
                        <DeleteIcon /> 
                    </button>
                </div>

                <div className="flex-grow">
                    <form className="space-y-6">
                        <div className="flex items-center gap-6">
                            <label htmlFor="date" className="w-24 text-sm font-medium text-gray-700">
                                Tarix
                            </label>
                            <div className="flex-grow">
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={data.date}
                                    readOnly 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-sm cursor-default"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <label htmlFor="amount" className="w-24 text-sm font-medium text-gray-700">
                                Məbləğ
                            </label>
                            <div className="flex-grow">
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={data.amount}
                                    readOnly 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-sm cursor-default"
                                    placeholder="Məbləğ"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <label htmlFor="document-preview" className="w-24 text-sm font-medium text-gray-700 mt-2">
                                Sənəd
                            </label>
                            <div className="flex-grow flex flex-col gap-3">
                                {data.documents.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {data.documents.map((doc, index) => (
                                            <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img
                                                    src={doc.url || doc}
                                                    alt={`Sənəd ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => handleImageClick(doc.url || doc)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Sənəd əlavə edilməyib.</p>
                                )}
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
            </div>
        </BlurLoader>
    );
};

export default PatientInsuranceBalanceInfo;