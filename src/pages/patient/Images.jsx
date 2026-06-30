import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

// Swiper CSS importları
import "swiper/css";
import "swiper/css/navigation";

// components/TitleUpdater.jsx və components/XRayCard.jsx yollarının düzgün olduğuna əmin olun
import TitleUpdater from "../../components/TitleUpdater";
import XRayCard from "../../components/XRayCard";
const Images = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlideshowImages, setCurrentSlideshowImages] = useState([]);

  // X-ray datası - Swagger formatına uyğun olaraq tək 'url' sahəsi ilə
  const xrayData = [
    {
      id: 1,
      date: "08.01.2023",
      description: "A description for X-Ray 1.",
      patientId: 101,
      url: "https://i.ibb.co/L8GfFp5/image-41356b.jpg",
    },
    {
      id: 2,
      date: "15.02.2023",
      description: "A description for X-Ray 2.",
      patientId: 101,
      url: "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg",
    },
    {
      id: 3,
      date: "20.03.2023",
      description: "A description for X-Ray 3.",
      patientId: 102,
      url: "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg",
    },
    {
      id: 4,
      date: "10.04.2024",
      description: "A description for X-Ray 4.",
      patientId: 102,
      url: "https://i.ibb.co/L8GfFp5/image-41356b.jpg",
    },
    {
      id: 5,
      date: "05.05.2024",
      description: "A description for X-Ray 5.",
      patientId: 103,
      url: "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg",
    },
    {
      id: 6,
      date: "12.06.2024",
      description: "A description for X-Ray 6.",
      patientId: 103,
      url: "https://i.ibb.co/L8GfFp5/image-41356b.jpg",
    },
    {
      id: 7,
      date: "18.07.2024",
      description: "A description for X-Ray 7.",
      patientId: 104,
      url: "https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516_1280.jpg",
    },
    {
      id: 8,
      date: "25.08.2024",
      description: "A description for X-Ray 8.",
      patientId: 104,
      url: "https://i.ibb.co/L8GfFp5/image-41356b.jpg",
    },
  ];

  const handleOpenSlideshow = (xrayId) => {
    const selectedXray = xrayData.find((xray) => xray.id === xrayId);
    if (selectedXray && selectedXray.url) {
      setCurrentSlideshowImages([selectedXray.url]);
      setShowSlideshow(true);
    } else {
      console.warn(`No image URL found for X-Ray ID: ${xrayId}`);
    }
  };

  const handleCloseSlideshow = () => {
    setShowSlideshow(false);
    setCurrentSlideshowImages([]);
  };

  const handleAddNewXRay = () => {
    navigate("add");
  };

  if (showSlideshow) {
    return (
      <div
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        className="fixed top-0 left-0 w-full h-full z-50 flex flex-col items-center justify-center">
        <div
          className="relative flex flex-col items-center justify-center
                                     w-[90%] h-[90vh]
                                     max-w-7xl
                                     bg-white rounded-lg shadow-lg">
          <button
            onClick={handleCloseSlideshow}
            className="absolute top-4 right-4 text-gray-800 text-4xl z-10 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Close slideshow">
            <IoMdClose />
          </button>

          <Swiper
            navigation={currentSlideshowImages.length > 1}
            modules={[Navigation]}
            className="w-full h-full flex items-center justify-center"
            grabCursor={true}
            spaceBetween={10}
            slidesPerView={1}>
            {currentSlideshowImages.map((imageUrl, index) => (
              <SwiperSlide key={index}>
                <div className="flex items-center justify-center w-full h-full p-4">
                  <img
                    src={imageUrl}
                    alt={`X-Ray ${index + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    style={{ minWidth: "0", minHeight: "0" }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

  return (
    // `pt-[7rem]` əlavə edildi ki, düymənin yerləşdiyi yuxarı hissədə kartlar üçün boşluq olsun
    <div className="flex flex-wrap gap-6 p-6 justify-center min-h-screen relative pt-[7rem]">
      <TitleUpdater title="X-Rays" />

      {/* "Yenisini əlavə et" düyməsi - absolute klassları qaytarıldı */}
      <div className="absolute top-6 right-6 z-10">
        {" "}
        {/* z-10 əlavə edildi ki, kartların üstündə qalsın */}
        <button
          onClick={handleAddNewXRay}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold">
          <FaPlus className="mr-2" /> Yenisini əlavə et
        </button>
      </div>

      {xrayData.map((xray) => (
        <XRayCard
          key={xray.id}
          xrayId={xray.id}
          image_url={xray.url || null}
          date={xray.date}
          handleClick={() => handleOpenSlideshow(xray.id)}
        />
      ))}
    </div>
  );
};

export default Images;
