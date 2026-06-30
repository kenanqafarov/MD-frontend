import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/temp-axios-auth';
import './history.css';
import useAnamnesisStore from '../../../stores/anamnesisStore'; // Zustand store'u import edirik
import { FaFolder, FaTrash } from "react-icons/fa";

// Inline SVG Icons (dəyişməyib)
const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 16.414l-4.207-4.207a1 1 0 011.414-1.414L12 13.586l3.793-3.793a1 1 0 111.414 1.414L12 16.414z" />
  </svg>
);

const ArrowForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M16.414 12l-3.793-3.793a1 1 0 00-1.414 1.414L13.586 12l-3.793 3.793a1 1 0 101.414 1.414L16.414 12z" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z" />
  </svg>
);

const TriangleDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);

const History = () => {
  const { id } = useParams();

  const {
    anamnesisList,
    isLoading,
    loadAnamnesisByPatientId,
    addAnamnesis,
    deleteAnamnesis
  } = useAnamnesisStore();

  const [apiData, setApiData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [anamnesisItems, setAnamnesisItems] = useState([]);
  const [selectedAnamnesis, setSelectedAnamnesis] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        '/anamnesis-categories/read'
      );

      const fetchedData = response.data.data;
      setApiData(fetchedData);
      
      if (fetchedData.length > 0) {
        setActiveCategory(fetchedData[0].name);
        setAnamnesisItems(fetchedData[0].anemnesisListReadResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    if (id) {
      loadAnamnesisByPatientId(id);
    }
  }, [id, loadAnamnesisByPatientId]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.name);
    setAnamnesisItems(category.anemnesisListReadResponse);
    setSelectedAnamnesis(null);
  };

  const handleAnamnesisClick = (item) => {
    setSelectedAnamnesis(item);
  };

  const handleStoreClick = async () => {
    if (!selectedAnamnesis || !activeCategory || !id) {
      console.error('Missing data for API call: selectedAnamnesis, activeCategory, or patientId.');
      return;
    }

    const isConfirmed = window.confirm(
      `"${selectedAnamnesis.name}" anamnezini əlavə etmək istədiyinizə əminsinizmi?`
    );

    if (isConfirmed) {
      const payload = {
        anamnesisName: selectedAnamnesis.name,
        anamnesisCategoryName: activeCategory,
        patientId: parseInt(id),
      };

      console.log('Sending payload:', payload);

      try {
        await addAnamnesis(payload);
        await loadAnamnesisByPatientId(id);
      } catch (error) {
        console.error('Failed to add anamnesis:', error);
      }
    }
  };

  const handleDeleteClick = async (anamnesisId) => {
    const isConfirmed = window.confirm(
      'Bu anamnezi silmək istədiyinizə əminsinizmi?'
    );

    if (isConfirmed) {
      try {
        await deleteAnamnesis(anamnesisId);
        await loadAnamnesisByPatientId(id);
      } catch (error) {
        console.error('Failed to delete anamnesis:', error);
      }
    }
  };

  return (
    <div className="main-container">
      {/* Categories and Anamnesis Cards */}
      <div className="card-container">
        <div className="card categories-card">
          <div className="card-header">
            <h3>Kateqoriyalar</h3>
          </div>
          <div className="card-body">
            {apiData.map((category, index) => (
              <div
                key={index}
                className={`category-item ${activeCategory === category.name ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-icon-text">
                  {activeCategory === category.name ? <ArrowDownIcon /> : <ArrowForwardIcon />}
                  <span className="folder-icon">
                    <FaFolder />
                  </span>
                  {category.name}
                </div>
                <span>({category.anemnesisListReadResponse.length})</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card anamnesis-card">
          <div className="card-header">
            <span>1-{anamnesisItems.length}</span>
            <span className="header-text-with-icon">
              <TriangleDownIcon />
              Anamnez
            </span>
          </div>
          <div className="card-body">
            <div className="anamnesis-container">
              {anamnesisItems.length > 0 ? (
                anamnesisItems.map((item, index) => (
                  <div
                    key={index}
                    className={`anamnesis-item ${selectedAnamnesis && selectedAnamnesis.name === item.name ? 'selected' : ''}`}
                    onClick={() => handleAnamnesisClick(item)}
                  >
                    <span className={`anamnesisCount ${selectedAnamnesis ? 'selectedAnamnesisCount' : ''}`}>{index + 1}</span>
                    <span className="anamnesis-text">{item.name}</span>
                  </div>
                ))
              ) : (
                <p>Bu kateqoriya üzrə anamnez tapılmadı.</p>
              )}
            </div>
          </div>
          <div className="card-footer">
            <button onClick={handleStoreClick} disabled={!selectedAnamnesis || !activeCategory}>
              Yadda saxla
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="history-table-container">
        <div className="history-table-header">
          <div className="header-item">
            <span>No</span>
          </div>
          <div className="header-item">
            <TriangleDownIcon />
            Kateqoriyası
          </div>
          <div className="header-item">
            <TriangleDownIcon />
            Anamnez
          </div>
          <div className="header-item">
            <TriangleDownIcon />
            Əlavə edən
          </div>
          <div className="header-item">
            <TriangleDownIcon />
            Tarix
          </div>
          <div className="header-item">
            <TriangleDownIcon />
            Düzəliş
          </div>
        </div>
        <div className="history-table-body">
          {isLoading ? (
            <p className="loading-message">Loading...</p>
          ) : anamnesisList.length > 0 ? (
            anamnesisList.map((row, index) => (
              <div key={row.id} className="table-row">
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell">{row.anamnesisCategoryName}</div>
                <div className="table-cell">{row.anamnesisName}</div>
                <div className="table-cell">{row.addedByName}</div>
                <div className="table-cell">{row.addedDateTime}</div>
                <div className="table-cell">
                  <FaTrash 
                    className='deleteIconAnamnesis' 
                    onClick={() => handleDeleteClick(row.id)} // Dəyişiklik burada edildi
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">Bu pasientə aid anamnez yoxdur.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;