import React, { useEffect, useState } from 'react';
import CustomDropdown from '../../components/CustomDropdown';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import usePatientRecipeStore from '../../../stores/usePatientRecipeStore';
import useRecipeStore from '../../../stores/receptsStore'; // Ümumi resept mağazasını import edirik
import { toast } from 'react-toastify';

const EditPrescription = () => {
    const { id: patientRecipeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const patientId = new URLSearchParams(location.search).get('patientId');

    const {
        patientRecipes,
        loading,
        error,
        fetchPatientRecipes,
        editPatientRecipe,
        fetchRecipeName,
        recipeNamesCache
    } = usePatientRecipeStore();

    // Ümumi Resept Mağazasından (dropdown seçimləri üçün)
    const {
        fetchRecipeList,        // Sadələşdirilmiş resept siyahısını yükləmək üçün action
        recipeListOptions       // Sadələşdirilmiş resept siyahısını saxlayan state (id, name)
    } = useRecipeStore(); // Ümumi resept mağazasını istifadə edirik

    const [formData, setFormData] = useState({
        recipeId: '',
        date: '',
        duration: ''
    });

    const [selectedRecipeLabel, setSelectedRecipeLabel] = useState('Reseptin adı yüklənir...');

    useEffect(() => {
        if (!patientRecipeId) {
            console.warn("Redaktə üçün pasiyent resept ID-si tapılmadı.");
            return;
        }
        if (!patientId) {
            console.warn("Pasiyent ID-si URL-də yoxdur. Resept məlumatları yüklənmədi.");
            return;
        }

        fetchPatientRecipes(parseInt(patientId));
        fetchRecipeList(); // <--- Dropdown seçimlərini yükləyirik

    }, [patientRecipeId, patientId, fetchPatientRecipes, fetchRecipeList]);

    useEffect(() => {
        if (patientRecipes && patientRecipes.length > 0 && patientRecipeId) {
            const foundRecipe = patientRecipes.find(
                (rec) => rec.id === parseInt(patientRecipeId)
            );

            if (foundRecipe) {
                setFormData({
                    recipeId: foundRecipe.recipeId || '',
                    date: foundRecipe.date ? new Date(foundRecipe.date).toISOString().split('T')[0] : '',
                    duration: foundRecipe.duration || ''
                });

                if (foundRecipe.recipeId) {
                    if (recipeNamesCache[foundRecipe.recipeId]) {
                        setSelectedRecipeLabel(recipeNamesCache[foundRecipe.recipeId]);
                    } else {
                        fetchRecipeName(foundRecipe.recipeId).then(name => {
                            setSelectedRecipeLabel(name || `Resept #${foundRecipe.recipeId}`);
                        });
                    }
                } else {
                    setSelectedRecipeLabel('Resept adı mövcud deyil');
                }
            } else if (!loading && !error) {
                console.warn(`ID-si ${patientRecipeId} olan pasiyent resepti redaktə üçün tapılmadı.`);
            }
        }
    }, [patientRecipeId, patientRecipes, loading, error, fetchRecipeName, recipeNamesCache]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDropdownChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            recipeId: selectedOption ? selectedOption.value : ''
        }));
        setSelectedRecipeLabel(selectedOption ? selectedOption.label : '');
    };

    const handleSave = async () => {
        if (!patientRecipeId || !patientId) {
            toast.error("Resept yenilənməsi üçün lazımi ID-lər tapılmadı.");
            return;
        }

        try {
            await editPatientRecipe(parseInt(patientRecipeId), { ...formData, patientId: parseInt(patientId) });
            toast.success("Resept uğurla yeniləndi!");
            navigate(`/patients/patient/${patientId}/prescription/${patientRecipeId}?patientId=${patientId}`);
        } catch (err) {
            toast.error("Resept yadda saxlanılarkən xəta baş verdi.");
            console.error("Resept yadda saxlanılarkən xəta:", err);
        }
    };

    const handleCancel = () => {
        navigate(`/patients/patient/${patientId}/prescription/${patientRecipeId}?patientId=${patientId}`);
    };

    if (loading && (!formData.recipeId && !formData.date)) {
        return <div>Resept məlumatları yüklənir...</div>;
    }

    if (error) {
        return <div>Xəta: Resept məlumatları yüklənərkən xəta baş verdi: {error.message || error}</div>;
    }

    if (!formData.recipeId && !formData.date && !loading) {
        return <div>Yenilənəcək resept tapılmadı. Zəhmət olmasa düzgün ID daxil edin.</div>;
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1 '>Ad</label>
                    <CustomDropdown
                        placeholder={selectedRecipeLabel}
                        className='flex-5'
                        options={recipeListOptions} // <--- useRecipeStore-dan gələn datanı istifadə edirik
                        value={formData.recipeId}
                        onChange={handleDropdownChange}
                    />
                </div>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1'>Tarix</label>
                    <input
                        type='date'
                        className='flex-5 border border-gray-300 rounded-md p-2 h-[44px]'
                        placeholder='Tarix'
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
               
            </div>

            <div className='flex self-end gap-4'>
                <button
                    onClick={handleCancel}
                    className='border border-[#155EEF] text-[#155EEF] w-[178px] h-[36px] rounded-lg p-2 hover:bg-[#155EEF] hover:text-white transition-all duration-300'
                >
                    İmtina et
                </button>
                <button
                    onClick={handleSave}
                    className='border border-[#155EEF] text-white bg-[#155EEF] w-[178px] h-[36px] rounded-lg p-2 hover:bg-[#155EEF] hover:text-white transition-all duration-300'
                >
                    Yadda saxla
                </button>
            </div>
        </div>
    );
};

export default EditPrescription;