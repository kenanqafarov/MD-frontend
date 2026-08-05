import React, { useState, useEffect } from "react";
import "../assets/style/image_uploader.css";
import { uploadToCloudinary } from "../utils/cloudinary";
import { toast } from "react-toastify";

const ProfileImage = ({ initialImage, value, onImageChange, mode = "edit" }) => {
  const [image, setImage] = useState(value || initialImage || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setImage(value);
    } else if (initialImage) {
      setImage(initialImage);
    }
  }, [value, initialImage]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setImage(cloudinaryUrl);
      if (onImageChange) {
        onImageChange(cloudinaryUrl, file);
      }
      toast.success("Şəkil Cloudinary-yə uğurla yükləndi!");
    } catch (err) {
      console.error("Profile photo upload failed:", err);
      toast.error(err.message || "Şəkil yüklənərkən xəta baş verdi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = () => {
    setImage(null);
    if (onImageChange) {
      onImageChange(null, null);
    }
  };

  return (
    <div className="image-uploader">
      <div className="profile-picture">
        {isUploading ? (
          <div className="placeholder animate-pulse">Yüklənir...</div>
        ) : image ? (
          <img src={image} alt="Profile" className="rounded-image" loading="lazy" decoding="async" />
        ) : (
          <div className="placeholder">Şəkil yoxdur</div>
        )}
      </div>
      {(mode === "edit" || mode === "create") && (
        <div className="button-group">
          <label htmlFor="profile-upload-input" className="btn btn-add cursor-pointer">
            {isUploading ? "Yüklənir..." : image ? "Redaktə et" : "Şəkil əlavə et"}
          </label>
          <input
            id="profile-upload-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            style={{ display: "none" }}
          />
          {image && !isUploading ? (
            <button type="button" className="btn btn-delete" onClick={handleImageDelete}>
              Sil
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProfileImage;