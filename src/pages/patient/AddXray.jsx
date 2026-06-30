import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitleUpdater from "../../components/TitleUpdater";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdClose, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import usePatientXrayStore from "../../../stores/patient-xrayStore";

const AddXRay = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Store'dan state ve fonksiyonları al
    const { loading, error, createMultipleXrays, clearError } =
        usePatientXrayStore();

    const [newXray, setNewXray] = useState({
        date: "",
        description: "",
        patientId: id || "",
    });

    const [newImages, setNewImages] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewXray((prevXray) => ({
            ...prevXray,
            [name]: value,
        }));
    };

    const handleNewImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prevImages => [
            ...prevImages,
            ...files.map(file => ({
                file,
                preview: URL.createObjectURL(file), // Şəkil preview üçün URL
                isNew: true // Yeni yüklənən şəkil olduğunu göstərir
            }))
        ]);
        e.target.value = null; // Seçilmiş faylları təmizlə ki, eyni fayl təkrar seçilə bilsin
    };

    const handleRemoveImage = (indexToRemove) => {
        setNewImages(prevImages => {
            const updatedImages = prevImages.filter((_, index) => index !== indexToRemove);
            // Preview URL-ləri təmizlə
            prevImages.forEach((img, idx) => {
                if (idx === indexToRemove && img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
            return updatedImages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasiya
        if (newImages.length === 0) {
            usePatientXrayStore.setState({
                error: "Zəhmət olmasa, şəkil seçin.",
            });
            return;
        }
        if (!newXray.date) {
            usePatientXrayStore.setState({
                error: "Rentgenin tarixi boş ola bilməz.",
            });
            return;
        }
        if (!newXray.patientId) {
            usePatientXrayStore.setState({
                error:
                    "Xəstə ID-si təyin olunmayıb. Zəhmət olmasa, səhifəni yenidən yükləyin və ya ID-nin düzgün göndərildiyindən əmin olun.",
            });
            return;
        }

        try {
            const xrayData = {
                date: newXray.date,
                description: newXray.description,
                patientId: parseInt(newXray.patientId),
            };

            // Store'dan createMultipleXrays fonksiyonunu kullan
            const files = newImages.map((img) => img.file);
            await createMultipleXrays(xrayData, files);

            // Uğurlu cavab
            alert("Yeni rentgen məlumatları uğurla əlavə edildi!");

            // Preview URL-ləri təmizlə
            newImages.forEach((img) => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });

            navigate(`/patients/patient/${id}/xray`);
        } catch (err) {
            console.error("Rentgen əlavə edilərkən səhv baş verdi:", err);
            // Hata zaten store'da set edildi
        }
    };

    const handleCancel = () => {
        // Yüklənmiş şəkillərin preview URL-lərini təmizlə
        newImages.forEach((img) => {
            if (img.preview) {
                URL.revokeObjectURL(img.preview);
            }
        });
        // Store'daki hatayı temizle
        if (clearError) {
            clearError();
        }
        navigate(`/patients/${patientId}/xrays`);
    };

    // Component unmount olduğunda preview URL'lerini temizle
    useEffect(() => {
        return () => {
            newImages.forEach((img) => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, []);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <TitleUpdater title="Yeni Rentgen Əlavə Et" />

            <div className="w-full max-w-[1200px] bg-white p-8 rounded-lg shadow-md mt-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Rentgenin tarixi */}
                    <div className="flex items-center">
                        <label htmlFor="date" className="w-1/4 text-md font-medium text-gray-800 mr-4">
                            Rentgenin tarixi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex-1">
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={newXray.date}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                                required
                            />
                        </div>
                    </div>

                    {/* Əlavə məlumat */}
                    <div className="flex items-start">
                        <label htmlFor="description" className="w-1/4 text-md font-medium text-gray-800 mr-4 mt-2">
                            Əlavə məlumat
                        </label>
                        <div className="flex-1">
                            <textarea
                                id="description"
                                name="description"
                                rows="6"
                                value={newXray.description}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                                placeholder=""
                            ></textarea>
                        </div>
                    </div>

                    {/* Şəkil Yüklə */}
                    <div className="flex items-start">
                        <label htmlFor="image-upload" className="w-1/4 text-md font-medium text-gray-800 mr-4 pt-2">
                            Şəkil <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                            <input
                                type="file"
                                id="image-upload"
                                name="image-upload"
                                multiple
                                accept="image/*"
                                onChange={handleNewImageUpload}
                                disabled={loading}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Yüklənmiş şəkillərin önizləməsi */}
                            <div className="flex flex-wrap gap-4 mt-4 p-2 border border-gray-300 rounded-lg bg-gray-50">
                                {newImages.length > 0 ? (
                                    newImages.map((image, index) => (
                                        <div key={index} className="relative w-32 h-32 md:w-40 md:h-40 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200"
                                                aria-label="Şəkli sil"
                                            >
                                                <MdDeleteForever className="text-xl" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-24 flex items-center justify-center text-gray-500">
                                        Şəkil seçilməyib.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Mesajı */}
                    {error && (
                        <div className="flex justify-center text-red-600 text-sm mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Düymələr */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center px-6 py-3 border border-blue-600 rounded-lg shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading} // Yüklənərkən düyməni deaktiv et
                        >
                            <IoMdClose className="mr-2 text-lg" /> İmtina et
                        </button>
                        <button
                            type="submit"
                            className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Yüklənir...
                                </>
                            ) : (
                                <>
                                    <IoMdCheckmarkCircleOutline className="mr-2 text-lg" /> Yadda saxla
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddXRay;