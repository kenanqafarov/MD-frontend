import React, { useState, useRef, useEffect } from "react";
import "../../assets/style/Technicians/edittechnician.css";
import AddPhotoIcon from "../../assets/icons/AddPhoto";
import CloseIcon from "../../assets/icons/Close";
import useTechnicianStore from "../../../stores/technicianStore";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ... digər importlar eynidir

function EditTechnician({ technicianId }) {
  const { selectedTechnician, fetchTechnicianById, updateTech } =
    useTechnicianStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "", // lazım deyilsə silə bilərsən
    name: "",
    surname: "",
    patronymic: "",
    finCode: "",
    password: "",
    dateOfBirth: "",
    phone: "",
    phone2: "",
    homePhone: "",
    email: "",
    address: "",
    genderStatus: "",
  });

  useEffect(() => {
    if (id) {
      fetchTechnicianById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedTechnician) {
      setFormData({
        name: selectedTechnician.name || "",
        surname: selectedTechnician.surname || "",
        patronymic: selectedTechnician.patronymic || "",
        finCode: selectedTechnician.finCode || "",
        password: "", // boş saxla, yeniləmək istəyirsə
        dateOfBirth: selectedTechnician.dateOfBirth || "",
        phone: selectedTechnician.phone || "",
        phone2: selectedTechnician.phone2 || "",
        homePhone: selectedTechnician.homePhone || "",
        email: selectedTechnician.email || "",
        address: selectedTechnician.address || "",
        genderStatus: selectedTechnician.genderStatus || "",
      });
    }
  }, [selectedTechnician]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "gender") {
      setFormData((prev) => ({
        ...prev,
        genderStatus: value === "male" ? "MAN" : "WOMAN",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        name: formData.name,
        surname: formData.surname,
        patronymic: formData.patronymic,
        finCode: formData.finCode,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        phone2: formData.phone2,
        homePhone: formData.homePhone,
        email: formData.email,
        address: formData.address,
        genderStatus: formData.genderStatus,
      };

      await updateTech(technicianId || id, dataToSend);
      toast.success("Uğurla yeniləndi!");
      navigate("/technicians");
    } catch (error) {
      toast.error(
        "Xəta baş verdi: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="editTechnicianFormContainer">
      <ToastContainer />
      <div className="editTechFormPart">
        {/* Sol tərəfdəki inputlar */}
        <div className="editTechnicianLeft">
          {[
            { label: "Adı", name: "name", type: "text" },
            { label: "Soyadı", name: "surname", type: "text" },
            { label: "Ata adı", name: "patronymic", type: "text" },
            { label: "Fin kodu", name: "finCode", type: "text" },
            { label: "Şifrə", name: "password", type: "password" },
            { label: "Doğum tarixi", name: "dateOfBirth", type: "date" },
            { label: "Mobil nömrə 1", name: "phone", type: "text" },
          ].map(({ label, name, type }) => (
            <div className="editPartInputData" key={name}>
              <p className="editPartInputTitle">{label}</p>
              <input
                type={type}
                className="editTechnicianInput"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
              />
            </div>
          ))}

          <div className="editPartInputGender">
            <p className="editPartInputTitle">Cinsiyyət</p>
            <div className="editGenderOptions">
              <label className="editGenderLabel">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.genderStatus === "MAN"}
                  onChange={handleInputChange}
                />
                Kişi
              </label>
              <label className="editGenderLabel">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.genderStatus === "WOMAN"}
                  onChange={handleInputChange}
                />
                Qadın
              </label>
            </div>
          </div>
        </div>

        {/* Sağ tərəfdəki inputlar */}
        <div className="editTechnicianRight">
          {[
            { label: "Mobil nömrə 2", name: "phone2" },
            { label: "Ev telefonu", name: "homePhone" },
            { label: "E-poçt ünvanı", name: "email", type: "email" },
            { label: "Ünvan", name: "address" },
          ].map(({ label, name, type }) => (
            <div className="editPartInputData" key={name}>
              <p className="editPartInputTitle">{label}</p>
              <input
                type={type || "text"}
                className="editTechnicianInput"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit və Cancel düymələri */}
      <div className="editTechnicianSubmit">
        <div className="editTechnicianActions">
          <button
            type="button"
            className="editTechnicianCancelBtn"
            onClick={() => navigate("/technicians")}>
            İmtina et
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="editTechnicianSaveBtn">
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTechnician;
