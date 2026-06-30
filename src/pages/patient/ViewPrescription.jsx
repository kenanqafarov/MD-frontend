import React, { useEffect, useState } from 'react';
import EditIcon from '../../assets/icons/Edit';
import DownloadIcon from '../../assets/icons/Download';
import CustomDropdown from '../../components/CustomDropdown';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import usePatientRecipeStore from '../../../stores/usePatientRecipeStore'; // Adjust path if necessary

const ViewPrescription = () => {
    const { prescriptionId } = useParams(); // This 'id' is the patientRecipeId (e.g., 4)
    let id = prescriptionId
    const navigate = useNavigate();
    const location = useLocation();

    // We still need patientId to properly fetch/filter patient recipes from the store
    const patientId = new URLSearchParams(location.search).get('patientId');

    const {
        patientRecipes, // The list of all patient recipes for the current patient
        loading,
        error,
        fetchPatientRecipes,
        fetchRecipeName,      // To get the name of the recipe content (e.g., "Aspirin")
        recipeNamesCache      // To access cached recipe names
    } = usePatientRecipeStore();

    const [currentPatientRecipe, setCurrentPatientRecipe] = useState(null); // Stores the patient's specific prescription
    const [recipeContentName, setRecipeContentName] = useState('Yüklənir...'); // Stores the name of the actual recipe content

    useEffect(() => {
        if (!id) {
            console.warn("No prescription ID found in URL.");
            return;
        }
        if (!patientId) {
            console.warn("Patient ID is missing in URL. Cannot fetch patient recipes for viewing.");
            return;
        }

        // Always ensure patient recipes are fetched for the current patient
        fetchPatientRecipes(parseInt(patientId));

    }, [id, patientId, fetchPatientRecipes]);

    useEffect(() => {
        // This effect runs when `patientRecipes` in the store updates
        if (id && patientRecipes && patientRecipes.length > 0) {
            const foundPatientRecipe = patientRecipes.find(
                (rec) => rec.id === parseInt(id)
            );

            if (foundPatientRecipe) {
                setCurrentPatientRecipe(foundPatientRecipe);

                // Now, use the 'recipeId' from the foundPatientRecipe to fetch its name
                if (foundPatientRecipe.recipeId) {
                    if (recipeNamesCache[foundPatientRecipe.recipeId]) {
                        // Use cached name if available
                        setRecipeContentName(recipeNamesCache[foundPatientRecipe.recipeId]);
                    } else {
                        // Fetch the recipe content name if not in cache
                        fetchRecipeName(foundPatientRecipe.recipeId).then(name => {
                            if (name) {
                                setRecipeContentName(name);
                            } else {
                                setRecipeContentName(`Resept #${foundPatientRecipe.recipeId}`);
                            }
                        });
                    }
                } else {
                    setRecipeContentName('Resept adı mövcud deyil');
                }
            } else if (!loading && !error) {
                console.warn(`Patient recipe with ID ${id} not found in store.`);
                // You might want to navigate to a 404 page or show an explicit "Not Found" message
            }
        }
    }, [id, patientRecipes, fetchRecipeName, recipeNamesCache, loading, error]); // Depend on patientRecipes from store

    if (loading && !currentPatientRecipe) {
        return <div>Resept məlumatları yüklənir...</div>;
    }

    if (error) {
        return <div>Xəta: {error}</div>;
    }

    if (!currentPatientRecipe) {
        // This case handles when loading is finished, no error, but recipe still not found
        return <div>Gösterilecek resept tapılmadı.</div>;
    }

    // Format the date for display in the input field
    const formattedDate = currentPatientRecipe.date ? new Date(currentPatientRecipe.date).toISOString().split('T')[0] : '';

    return (
        <div className='flex flex-col gap-4'>
            {/* These buttons are for view mode and allow navigation to edit */}
            <div className='flex self-end gap-4'>
                <button onClick={() => navigate(`edit?patientId=${patientId}`)}>
                    <EditIcon />
                </button>
                <button>
                    <DownloadIcon />
                </button>
            </div>

            <div className='flex flex-col gap-4'>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1 '>Ad</label>
                    {/* CustomDropdown in view mode should display the fetched recipe content name */}
                    <CustomDropdown
                        placeholder={currentPatientRecipe.recipeName}
                        className='flex-5'
                        disabled={true}
                        // For a disabled dropdown, you might only need to pass the label and value
                        // or simplify to just displaying the text.
                        // Assuming CustomDropdown can display a label from its internal state/props.
                        options={[{ value: currentPatientRecipe.recipeId, label: recipeContentName }]}
                        value={currentPatientRecipe.recipeId} // This should be the recipeId (e.g., 101 for Penicillin)
                        // If CustomDropdown needs `selectedOption` for display:
                        // selectedOption={{ value: currentPatientRecipe.recipeId, label: recipeContentName }}
                    />
                </div>
                <div className='flex gap-4 justify-between items-center'>
                    <label className='flex-1'>Tarix</label>
                    <input
                        disabled={true}
                        type='date'
                        className='flex-5 border border-gray-300 rounded-md p-2 h-[44px]'
                        value={formattedDate} // Display formatted date from patient recipe
                    />
                </div>
                
            </div>
        </div>
    );
};

export default ViewPrescription;