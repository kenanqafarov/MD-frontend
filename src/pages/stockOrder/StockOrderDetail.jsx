// StockOrderEdit.jsx

import { useState, useEffect } from "react";
import CustomDropdown from "../../components/CustomDropdown";
import { useForm, Controller } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner, faEye } from "@fortawesome/free-solid-svg-icons";
import ListWithSubtotal from "../../components/list/ListwithSubtotal";
import EditIcon from "../../assets/icons/Edit";
import { useNavigate, useParams, Link } from "react-router-dom";
import MultiFileForm from "../../components/MultiFileForm";
import axios from "axios";
import useOrdersFromWarehouseStore from "../../../stores/orderFromWarehouseStore";
import useWorkerStore from "../../../stores/workerStore";
import useCalendarStore from "../../../stores/calendarStore";
import "../../assets/style/StockOrder/stockorderedit.css";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";

const StockOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, setValue, control } = useForm();

  const { rooms, fetchRooms } = useCalendarStore();
  const [roomOptions, setRoomOptions] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWorkerById, selectedWorker } = useWorkerStore();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found in localStorage.");
      return {};
    }
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authHeaders = getAuthHeaders();
        if (Object.keys(authHeaders).length === 0) {
          setIsLoading(false);
          alert("Giriş tokeni tapılmadı. Zəhmət olmasa yenidən daxil olun.");
          navigate("/login");
          return;
        }

        const [categoriesResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/product-category/read`, authHeaders),
          axios.get(`${API_BASE_URL}/product/read`, authHeaders),
        ]);

        const fetchedCategories = categoriesResponse.data.map((cat) => ({
          value: cat.id,
          label: cat.name || cat.categoryName,
        }));

        const fetchedProducts = productsResponse.data.map((prod) => ({
          value: prod.id,
          label: prod.name || prod.productName,
          categoryId: prod.categoryId || prod.productCategoryId,
          price: prod.price,
        }));

        await fetchRooms();

        if (id) {
          const orderResponse = await axios.get(
            `${API_BASE_URL}/order-from-warehouse/info/${id}`,
            authHeaders
          );
          const orderData = orderResponse.data;

          setValue("orderDate", orderData.date);

          let formattedTime = "";
          if (orderData.time) {
            if (typeof orderData.time === "object" && orderData.time !== null) {
              const hour = String(orderData.time.hour).padStart(2, "0");
              const minute = String(orderData.time.minute).padStart(2, "0");
              formattedTime = `${hour}:${minute}`;
            } else if (
              typeof orderData.time === "string" &&
              orderData.time.length >= 5
            ) {
              formattedTime = orderData.time.substring(0, 5);
            }
          }
          setValue("orderTime", formattedTime);

          const roomName = orderData.cabinetName;
          const room = rooms.find((r) => r.cabinetName === roomName);
          if (room) {
            setSelectedRoomId(room.id); // Store the ID to set the dropdown value
          }

          setValue("orderNumber", orderData.number);
          setValue("note", orderData.description);

          if (orderData.personWhoPlacedOrderUUID) {
            await fetchWorkerById(orderData.personWhoPlacedOrderUUID);
          }

          if (orderData.orderFromWarehouseProductResponses?.length > 0) {
            const formattedProducts =
              orderData.orderFromWarehouseProductResponses.map((item) => {
                const foundProduct = fetchedProducts.find(
                  (p) =>
                    p.value === item.productId ||
                    p.label === item.productName ||
                    p.label === item.productTitle
                );
                const foundCategory = fetchedCategories.find(
                  (c) => c.value === item.categoryId || c.label === item.categoryName
                );

                const unitPrice = item.price || foundProduct?.price || 0;
                const totalPrice = item.quantity * unitPrice;

                return {
                  id: Date.now() + Math.random(),
                  categoryName: item.categoryName,
                  productName: item.productName || item.productTitle,
                  quantity: item.quantity,
                  price: unitPrice,
                  totalPrice: totalPrice,
                  warehouseEntryProductName:
                    item.warehouseEntryProductName ||
                    item.productName ||
                    item.productTitle,
                };
              });
            setProducts(formattedProducts);
          }
        }
      } catch (error) {
        console.error("Məlumatları gətirərkən xəta baş verdi:", error);
        let errorMessage = "Məlumatları yükləyərkən xəta baş verdi: ";
        if (error.response?.status === 401) {
          errorMessage +=
            "Giriş səlahiyyəti yoxdur. Zəhmət olmasa yenidən daxil olun.";
          navigate("/login");
        } else {
          errorMessage += error.response?.data?.message || error.message;
        }
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, setValue, navigate, fetchWorkerById, fetchRooms, rooms]);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const transformedRooms = rooms.map((room) => ({
        value: room.id,
        label: room.cabinetName,
      }));
      setRoomOptions(transformedRooms);
      // Set the value for the dropdown once the options are available
      if (selectedRoomId) {
        setValue("room", selectedRoomId);
      }
    }
  }, [rooms, selectedRoomId, setValue]);

  useEffect(() => {
    if (selectedWorker) {
      setValue("personWhoPlacedOrder", selectedWorker.name + " " + selectedWorker.surname || "");
    }
  }, [selectedWorker, setValue]);

  if (isLoading) {
    return (
      <div className="stockOrderFormWrapper__loading">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="stockOrderFormWrapper__spinner"
        />
        <span className="stockOrderFormWrapper__loadingText">Yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="stockOrderFormWrapper">
      <div className="stockOrderTopPartIcons">
        <Link
          to={`/stock/order/edit/${id}`}
          className="stockOrderTopPartIcons__link"
        >
          <EditIcon className="stockOrderTopPartIcons__editIcon" />
        </Link>
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="stockOrderFormWrapper__form"
      >
        <div className="stockOrderFormWrapper__row">
          <label htmlFor="orderDate" className="stockOrderFormWrapper__label">
            Sifariş tarixi <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <input
              id="orderDate"
              type="date"
              {...register("orderDate")}
              className="stockOrderFormWrapper__input"
              readOnly
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label htmlFor="orderTime" className="stockOrderFormWrapper__label">
            Saat <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <input
              id="orderTime"
              type="time"
              {...register("orderTime")}
              className="stockOrderFormWrapper__input"
              readOnly
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label htmlFor="room" className="stockOrderFormWrapper__label">
            Otaq <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <Controller
              name="room"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  placeholder="Otaq seçin"
                  options={roomOptions}
                  value={roomOptions.find((option) => option.value === field.value)}
                  onChange={() => {}}
                  className="stockOrderFormWrapper__dropdown"
                  isDisabled={true}
                />
              )}
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label
            htmlFor="personWhoPlacedOrder"
            className="stockOrderFormWrapper__label"
          >
            Sifariş verən <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <input
              id="personWhoPlacedOrder"
              type="text"
              {...register("personWhoPlacedOrder")}
              className="stockOrderFormWrapper__input"
              readOnly
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label htmlFor="orderNumber" className="stockOrderFormWrapper__label">
            Çeşid sayı <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <input
              id="orderNumber"
              type="text"
              {...register("orderNumber")}
              className="stockOrderFormWrapper__input"
              readOnly
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label htmlFor="note" className="stockOrderFormWrapper__label">
            Qeyd <span className="stockOrderFormWrapper__required">*</span>
          </label>
          <div className="stockOrderFormWrapper__inputContainer">
            <textarea
              id="note"
              {...register("note")}
              className="stockOrderFormWrapper__textarea"
              readOnly
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__productsSection">
          <div className="stockOrderFormWrapper__row stockOrderFormWrapper__tableRow">
            <ListWithSubtotal
              columns={[
                { key: "categoryName", label: "Kategoriya" },
                { key: "productName", label: "Məhsul" },
                { key: "productTitle", label: "Özəlliklər" },
                { key: "quantity", label: "Miqdar" },
                { key: "price", label: "Vahid qiymət" },
                { key: "totalPrice", label: "Ümumi qiymət" },
                { key: "warehouseEntryProductName", label: "Anbar məhsulu" },
              ]}
              data={products}
              subtotalColumns={["price", "totalPrice"]}
              enableEdit={false}
              enableDelete={false}
              className="stockOrderFormWrapper__list"
            />
          </div>
        </div>

        <div className="stockOrderFormWrapper__row">
          <label className="stockOrderFormWrapper__label">Sənədlər</label>
          <div className="stockOrderFormWrapper__inputContainer">
            <MultiFileForm mode="info" />
          </div>
        </div>

        <div className="stockOrderFormWrapper__actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="stockOrderFormWrapper__buttonCancel"
          >
            <FontAwesomeIcon icon={faXmark} />
            Geri
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockOrderDetail;