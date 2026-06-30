import React, { useState, useEffect } from 'react';
import CustomDropdown from '../../components/CustomDropdown';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS (if not already in your root)

// Import both stores as needed for their specific functionalities
import useRecipeStore from '../../../stores/receptsStore'; // For the general list of recipes (dropdown options)
import usePatientRecipeStore from '../../../stores/usePatientRecipeStore'; // For adding patient-specific prescriptions

const AddPrescription = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();

    // Access data and actions from the general recipe store for the dropdown
    const fetchAllRecipes = useRecipeStore((state) => state.fetchRecipes);
    const allRecipes = useRecipeStore((state) => state.recipes);
    const loadingAllRecipes = useRecipeStore((state) => state.loading);

    // Access action from the patient recipe store for saving
    const addPatientRecipe = usePatientRecipeStore((state) => state.addPatientRecipe);

    // Local state for form inputs
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [date, setDate] = useState('');

    // Fetch all general recipes when the component mounts
    useEffect(() => {
        fetchAllRecipes();
    }, [fetchAllRecipes]); // Dependency array ensures it runs once on mount

    // Safely prepare options for the CustomDropdown.
    // This explicitly checks if 'allRecipes' is an array before mapping.
    const recipeOptions = Array.isArray(allRecipes)
        ? allRecipes.map((recipe) => ({
              label: recipe.name,
              value: recipe.id,
          }))
        : []; // Default to an empty array if allRecipes is not an array (e.g., during initial render)

    const handleSave = async () => {
        // Basic validation
        if (!selectedRecipe || !date  || !patientId) {
            toast.error("Lütfen tüm alanları doldurun ve hasta ID'sinin mevcut olduğundan emin olun."); // Toast for missing fields
            return;
        }

        const newRecipeData = {
            patientId: patientId,
            recipeId: selectedRecipe.value,
            name: selectedRecipe.label,
            date: date,
        };

        try {
            await addPatientRecipe(newRecipeData);
            toast.success("Resept uğurla əlavə edildi!"); // Success toast
            // Navigate after successful save
            navigate(`/patients/patient/${patientId}/prescription`);
        } catch (error) {
            console.error("Resept əlavə edilərkən xəta baş verdi:", error);
            // Error toast with a more user-friendly message
            toast.error("Resept əlavə edilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
        }
    };

    const handleCancel = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1 '>Ad</label>
                    <CustomDropdown
                        placeholder='Reseptin adı'
                        className='flex-5'
                        options={recipeOptions}
                        value={selectedRecipe}
                        onChange={(selectedOption) => setSelectedRecipe(selectedOption)}
                        isLoading={loadingAllRecipes} // Show loading state for the dropdown
                    />
                </div>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1'>Tarix</label>
                    <input
                        type='date'
                        className='flex-5 border border-gray-300 rounded-md p-2 h-[44px]'
                        placeholder='Tarix'
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                
            </div>
            <div className='flex self-end gap-4'>
                <button
                    onClick={handleCancel}
                    className='border border-[#155EEF] text-[#155EEF] w-[178px] h-[36px] rounded-lg p-2 hover:bg-[#155EEF] hover:text-white transition-all duration-300'
                >
                    İptal et
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

export default AddPrescription;