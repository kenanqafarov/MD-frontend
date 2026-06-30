import { useState, useEffect } from "react";
import SimpleList from "../../components/list/SimpleList";
import SearchIcon from "../../assets/icons/Search";
import CustomDropdown from "../../components/CustomDropdown";
import DownloadIcon from "../../assets/icons/Download";
import { useNavigate } from "react-router-dom";
import useOrderFromWarehouseStore from "../../../stores/orderFromWarehouseStore";
import useWorkerStore from "../../../stores/workerStore";
import useCabinetStore from "../../../stores/cabinetStore";
import Modal from "../../components/Modal";

const StockOrder = () => {
  const navigate = useNavigate();
  const { orders, error, fetchOrders } = useOrderFromWarehouseStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const { cabinets, fetchCabinets } = useCabinetStore();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [orderToDelete, setOrderToDelete] = useState(null);

  const categories = [
    { value: "all", label: "Bütün kateqoriyalar" },
    { value: "pending", label: "Gözləyən" },
    { value: "completed", label: "Tamamlanmış" },
    { value: "cancelled", label: "Ləğv edilmiş" },
  ];

  const columns = [
    { key: "date", label: "Tarix" },
    { key: "time", label: "Saat" },
    { key: "cabinetName", label: "Otaq" },
    { key: "personWhoPlacedOrder", label: "Sifariş verən" },
    { key: "quantity", label: "Çeşid sayı" },
    { key: "sumQuantity", label: "Cəmi məbləğ" },
  ];

  useEffect(() => {
    fetchOrders();
    fetchWorkers();
    fetchCabinets();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleDeleteClick = (id) => {
    setOrderToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await useOrderFromWarehouseStore.getState().deleteOrder(orderToDelete);
      setAlertTitle("Uğur");
      setAlertMessage("Sifariş uğurla silindi!");
      setIsAlertModalOpen(true);
      setOrderToDelete(null);
    } catch (error) {
      setAlertTitle("Xəta");
      setAlertMessage("Sifarişi silmək mümkün olmadı: " + (error.message || error));
      setIsAlertModalOpen(true);
    }
  };

  const getWorkerNameById = (id) => {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return "Anonim";
    return `${worker.name} ${worker.surname}`;
  };

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.cabinetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.number?.toString().includes(searchTerm) ||
          getWorkerNameById(order.personWhoPlacedOrder)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory.value !== "all") {
      filtered = filtered.filter(
        (order) => order.status === selectedCategory.value
      );
    }

    if (selectedCabinet) {
      filtered = filtered.filter(
        (order) => order.cabinetName === selectedCabinet.value
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedCategory, selectedCabinet, workers]);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  };

  const formattedOrders = filteredOrders.map((order) => {
    return {
      id: order.id || "-",
      date: order.date ? new Date(order.date).toLocaleDateString("az-AZ") : "-",
      time: order.time
        ? formatTime(order.time)
        : order.date
        ? new Date(order.date).toLocaleTimeString("az-AZ", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      cabinetName: order.cabinetName || "-",
      quantity: order.number || 0,
      sumQuantity: Number(order.sumQuantity || 0),
      personWhoPlacedOrder: getWorkerNameById(order.personWhoPlacedOrder),
    };
  });

  const cabinetOptions = cabinets.map((c) => ({
    value: c.name || c.cabinetName || c.value,
    label: c.name || c.cabinetName || c.value,
  }));

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-1 h-screen">
      <div className="flex justify-between items-center gap-2 p-2">
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Axtarış..."
            className="w-100 p-2 rounded-lg border border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <SearchIcon />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-[#155EEF] text-white px-4 py-2 rounded-lg"
            onClick={() => navigate("/stock/order/add")}
          >
            Yenisini əlavə et
          </button>
          <button>
            <DownloadIcon />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 p-4 text-center">Xəta baş verdi: {error}</div>
      ) : (
        <SimpleList
          columns={columns}
          data={formattedOrders}
          enableDelete={true}
          enableEdit={true}
          enableView={true}
          handleView={(id) => navigate(`/stock/order/detail/${id}`)}
          handleEdit={(id) => navigate(`/stock/order/edit/${id}`)}
          handleDelete={handleDeleteClick}
        />
      )}
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Sifarişi silmək"
        message="Bu sifarişi silmək istədiyinizə əminsiniz?"
        onConfirm={handleConfirmDelete}
      />
      
      {/* Alert Modal using the new isAlert prop */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertTitle}
        message={alertMessage}
        isAlert={true}
      />
    </div>
  );
};

export default StockOrder;