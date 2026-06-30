import React, { useEffect, useState } from "react";
import DownloadIcon from "../../assets/icons/Download";
import SimpleList from "../../components/list/SimpleList";
import { useNavigate, useParams } from "react-router-dom";
import usePatientRecipeStore from "../../../stores/usePatientRecipeStore";
import { toast } from "react-toastify";
import Modal from "../../components/Modal"; // Import your Modal component

const Prescription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentPatientId = parseInt(id);

  const {
    patientRecipes,
    loading,
    error,
    fetchPatientRecipes,
    removePatientRecipe,
    fetchRecipeName,
    recipeNamesCache,
  } = usePatientRecipeStore();

  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [recipeToDeleteId, setRecipeToDeleteId] = useState(null); // State to store ID of recipe to delete

  useEffect(() => {
    console.log("Cari Xəstə ID:", currentPatientId);

    if (currentPatientId) {
      fetchPatientRecipes(currentPatientId);
    } else {
      console.warn("Patient ID is missing in the URL. Cannot fetch recipes.");
    }
  }, [fetchPatientRecipes, currentPatientId]);

  useEffect(() => {
    const fetchMissingRecipeNames = async () => {
      const recipesToFetch = (patientRecipes || []).filter(
        (recipe) =>
          !recipe.recipeName &&
          recipe.recipeId &&
          !recipeNamesCache[recipe.recipeId]
      );

      await Promise.all(
        recipesToFetch.map(async (recipe) => {
          await fetchRecipeName(recipe.recipeId);
        })
      );
    };

    if (patientRecipes && patientRecipes.length > 0) {
      fetchMissingRecipeNames();
    }
  }, [patientRecipes, fetchRecipeName, recipeNamesCache]);

  const listData =
    patientRecipes && patientRecipes.length > 0
      ? patientRecipes.map((recipe) => ({
          id: recipe.id,
          name:
            recipe.recipeName ||
            recipeNamesCache[recipe.recipeId] ||
            `Resept ${recipe.recipeId}`,
          date: new Date(recipe.date).toLocaleDateString("az-AZ"),
        }))
      : [];

  const filteredData = selectedDate
    ? listData.filter(
        (item) =>
          item.date === new Date(selectedDate).toLocaleDateString("az-AZ")
      )
    : listData;

  const columns = [
    {
      label: "Ad",
      key: "name",
    },
    {
      label: "Tarix",
      key: "date",
    },
  ];

  // Function to open the modal
  const openDeleteModal = (id) => {
    setRecipeToDeleteId(id);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setRecipeToDeleteId(null);
  };

  // Function to handle the actual deletion after modal confirmation
  const handleConfirmDelete = async () => {
    if (recipeToDeleteId) {
      try {
        await removePatientRecipe(recipeToDeleteId, currentPatientId);
        // Toast message handled by the store now
      } catch (err) {
        console.error("Resept silinərkən xəta:", err);
        // If the store's toast isn't enough, you could add a local toast.error here
      } finally {
        closeDeleteModal(); // Close modal whether success or fail
      }
    }
  };

  if (loading && (!patientRecipes || patientRecipes.length === 0)) {
    return <div>Reseptlər yüklənir...</div>;
  }

  if (error) {
    return <div>Xəta: {error}</div>;
  }

  if (!currentPatientId && !loading && !error) {
    return <div>Xəstə ID-si tapılmadı. Reseptləri göstərmək mümkün deyil.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <input
            className="border border-gray-300 rounded-md p-2"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`add?patientId=${currentPatientId}`)}
            className="flex justify-center items-center bg-transparent text-[#155EEF] w-[178px] h-[36px] rounded-lg p-2 border border-[#155EEF] hover:bg-[#155EEF] hover:text-white transition-all duration-300"
          >
            + Yenisini əlavə et
          </button>
          <button>
            <DownloadIcon />
          </button>
        </div>
      </div>
      <div>
        {filteredData && filteredData.length > 0 ? (
          <SimpleList
            data={filteredData}
            columns={columns}
            startPage={1}
            endPage={1}
            pageSize={10}
            enableEdit={true}
            enableDelete={true}
            enableView={true}
            handleEdit={(id) => {
              navigate(`${id}/edit?patientId=${currentPatientId}`);
            }}
            handleDelete={openDeleteModal} // Pass openDeleteModal here
            handleView={(id) => {
              navigate(`${id}?patientId=${currentPatientId}`);
            }}
          />
        ) : (
          !loading &&
          !error && <div className="text-center py-4">Resept tapılmadı.</div>
        )}
      </div>

      {/* Your Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        title="Resepti Silmək"
        message="Bu resepti silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Sil"
        onConfirm={handleConfirmDelete} // Call handleConfirmDelete on confirm
        confirmButtonClass="confirm-button delete-button" // Add a class for specific styling if needed
      />
    </div>
  );
};

export default Prescription;