import React, { useEffect, useState } from "react";
import { CiSearch, CiCircleInfo, CiExport } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming you have your custom CSS files
import "../../assets/style/AdminUsers/adminusers.css";
import Modal from "../../components/Modal"; // Adjust the path as needed

const AdminUser = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // State for the custom confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token not found.");
        }

        const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
        const response = await fetch(
          `${API_BASE_URL}/add-worker/read`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch workers.");
        }

        const data = await response.json();
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const statusOptions = [
    { value: "", label: "Status" },
    { value: "Aktiv", label: "Aktiv" },
    { value: "Passiv", label: "Passiv" },
  ];

  const filteredUsers = workers
    .filter(
      (user) =>
        Array.isArray(user.permissions) &&
        (user.permissions.includes("ADMIN") || user.permissions.includes("admin"))
    )
    .filter(
      (user) =>
        (status === "" || (user.enabled ? "Aktiv" : "Passiv") === status) &&
        (user.username?.toLowerCase().includes(search.toLowerCase()) ||
          user.name?.toLowerCase().includes(search.toLowerCase()) ||
          user.surname?.toLowerCase().includes(search.toLowerCase()))
    );

  const handleDelete = (id) => {
    setUserToDeleteId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDeleteId) return;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token not found.");
      }

      const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";
      const response = await fetch(
        `${API_BASE_URL}/add-worker/delete/${userToDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      // If deletion is successful, update the state and show success toast
      setWorkers(workers.filter((worker) => worker.id !== userToDeleteId));
      toast.success("İstifadəçi uğurla silindi!", { position: "top-right" });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("İstifadəçi silinərkən xəta baş verdi.", { position: "top-right" });
    } finally {
      setIsModalOpen(false);
      setUserToDeleteId(null);
    }
  };

  const handleEdit = (id) => navigate(`edit/${id}`);
  const handleInfo = (id) => navigate(`info/${id}`);

  return (
    <div className="adminUsersPageContainer">
      <ToastContainer />
      <div className="adminUsersPageTopPart">
        <div className="leftPartOfTop">
          <select
            className="adminUsersStatusSelect"
            value={status}
            onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="searchBarContainer">
            <input
              type="text"
              placeholder="Axtarış"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CiSearch className="searchIconBTN" />
          </div>
        </div>
        <div className="rightPartOfTop">
          <Link className="exportDataOfAdminUsers" title="Export">
            <CiExport size={22} className="exportAdminDataIcon" />
          </Link>
        
        </div>
      </div>

      <div className="adminUsersTableWrapper">
        <table className="adminUsersTable">
          <thead>
            <tr>
              <th>
                <span className="flex items-center justify-center">
                  {filteredUsers.length === 0 ? "0" : `1-${filteredUsers.length}`}
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> İstifadəçi adı
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> Adı
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> Soyadı
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> İcazələr
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> Mobil nömrə
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  <HiArrowsUpDown className="tableArrowIcon" /> Status
                </span>
              </th>
              <th>
                <span className="flex items-center justify-center">
                  Düzəliş
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Yüklənir...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8">İstifadəçi tapılmadı.</td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user.id}>
                  <td>{idx + 1}</td>
                  <td className="usernameOfAdminUser">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name || "Admin" || "admin"}&background=random`}
                      className="imageOfAdminUser"
                      alt={user.username}
                    />
                    {user.username}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.surname}</td>
                  <td>{user.permissions?.join(", ") || "—"}</td>
                  <td>{user.phone || "—"}</td>
                  <td>
                    <span
                      className={`status ${
                        user.enabled ? "active" : "passive"
                      }`}>
                      {user.enabled ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td>
                    <div className="icons flex gap-3 cursor-pointer">
                      <CiCircleInfo
                        className="info"
                        onClick={() => handleInfo(user.id)}
                      />
                      <FiEdit3
                        className="edit"
                        onClick={() => handleEdit(user.id)}
                      />
                      <GoTrash
                        className="delete"
                        onClick={() => handleDelete(user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="İstifadəçini Sil"
        message="Bu istifadəçini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Sil"
        confirmButtonClass="confirm-button delete-button"
      />
    </div>
  );
};

export default AdminUser;