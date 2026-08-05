import { useState, useRef, useEffect } from 'react';
import AddPhotoIcon from '../assets/icons/AddPhoto';
import CloseIcon from '../assets/icons/Close';
import DownloadIcon from '../assets/icons/Download';
import { uploadToCloudinary } from '../utils/cloudinary';
import { toast } from 'react-toastify';

const MultiFileForm = ({ initialFiles = [], mode = 'edit', onFilesChange }) => {
    const [files, setFiles] = useState(initialFiles || []);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialFiles && initialFiles.length > 0) {
            setFiles(initialFiles);
        }
    }, [initialFiles]);

    const handleDeleteImage = (index) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        if (onFilesChange) onFilesChange(updated);
    };

    const handleImageClick = (file) => {
        setSelectedImage(file);
    };

    const handleDownload = (file) => {
        const link = document.createElement('a');
        link.href = file;
        link.download = 'cloudinary_image.jpg';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (!selectedFiles.length) return;

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of selectedFiles) {
                const url = await uploadToCloudinary(file);
                if (url) uploadedUrls.push(url);
            }
            const newFiles = [...files, ...uploadedUrls];
            setFiles(newFiles);
            if (onFilesChange) onFilesChange(newFiles);
            toast.success(`${uploadedUrls.length} şəkil Cloudinary-yə yükləndi!`);
        } catch (error) {
            console.error("MultiFile upload error:", error);
            toast.error(error.message || "Şəkillər yüklənərkən xəta baş verdi.");
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className='flex flex-col w-full border border-[#E5E7EB] rounded-lg p-4 gap-2'>
            {mode === 'edit' && (
                <div className='flex justify-start items-center gap-3'>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={isUploading}
                    />
                    <button 
                        className='flex items-center gap-2 bg-[#155EEF] hover:bg-[#124bbf] text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50'
                        onClick={handleUploadClick}
                        type='button'
                        disabled={isUploading}
                    >
                        <AddPhotoIcon />
                        <span>{isUploading ? "Yüklənir..." : "Fayl yüklə"}</span>
                    </button>
                    {isUploading && (
                        <span className='text-xs text-blue-600 animate-pulse font-medium'>
                            Cloudinary-yə yüklənir...
                        </span>
                    )}
                </div>
            )}

            <div className='flex flex-wrap gap-4 mt-2'>
                {files.map((file, index) => (
                    <div key={index} className='relative group'>
                        <div 
                            className='w-[85px] h-[85px] rounded-lg overflow-hidden border border-[#121926] cursor-pointer bg-gray-100'
                            onClick={() => handleImageClick(file)}
                        >
                            <img 
                                src={file} 
                                alt={`file-${index}`}
                                className='w-full h-full object-cover'
                            />
                        </div>
                        {mode === 'edit' ? (
                            <button 
                                className='absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-all'
                                onClick={() => handleDeleteImage(index)}
                                type='button'
                            >
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        ) : (
                            <button 
                                className='absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow hover:bg-blue-700 transition-all'
                                onClick={() => handleDownload(file)}
                                type='button'
                            >
                                <DownloadIcon className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div 
                    className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'
                    onClick={() => setSelectedImage(null)}
                >
                    <div className='max-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden relative bg-white p-2'>
                        <img 
                            src={selectedImage} 
                            alt="full-size"
                            className='max-w-full max-h-[85vh] object-contain rounded'
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiFileForm;