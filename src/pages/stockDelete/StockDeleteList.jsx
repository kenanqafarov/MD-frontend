import React, { useEffect, useState, useCallback } from "react";
import SimpleList from "../../components/list/SimpleList";
import SearchIcon from "../../assets/icons/Search";
import CustomDropdown from "../../components/CustomDropdown";
import DownloadIcon from "../../assets/icons/Download";
import { useNavigate } from "react-router-dom";
import useWarehouseDeletionStore from "../../../stores/warehouseDeletionStore";

const StockDelete = () => {
  const navigate = useNavigate();
  const {
    deletions,
    loading,
    error,
    fetchDeletions,
    deleteDeletion,
    searchDeletions,
  } = useWarehouseDeletionStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(""); // Axtarış üçün tarix state-i

  // Komponent yüklənəndə və ya silinmə əməliyyatı olanda datanı çək
  useEffect(() => {
    fetchDeletions();
  }, [fetchDeletions]);

  // Axtarış funksiyası
  const handleSearch = useCallback(async () => {
    const filters = {};
    if (filterDate) {
      filters.date = filterDate;
    }
    // Əgər API "time" obyektini tələb edirsə, onu da əlavə edin:
    // if (filterDate) {
    //     filters.time = { hour: 0, minute: 0, second: 0, nano: 0 }; // Və ya istədiyiniz vaxt
    // }

    // searchTerm-i digər filtrlərlə necə birləşdirəcəyiniz API-nızdan asılıdır.
    // Məsələn, əgər API "description" üzrə axtarışı dəstəkləyirsə:
    // if (searchTerm) {
    //     filters.description = searchTerm;
    // }

    try {
      await searchDeletions(filters);
    } catch (err) {
      console.error("Axtarış xətası:", err);
      alert(`Axtarış zamanı xəta: ${err.message}`);
    }
  }, [filterDate, searchDeletions]); // searchTerm-i hələ ki əlavə etmirik, çünki search API-də yoxdur

  // Silmə funksiyası
  const handleDelete = async (id) => {
    if (window.confirm("Bu anbar silinmə əməliyyatını silməyə əminsiniz?")) {
      try {
        await deleteDeletion(id);
        alert("Anbar silinməsi uğurla silindi.");
      } catch (err) {
        console.error("Silmə xətası:", err);
        alert(`Silmə zamanı xəta: ${err.message}`);
      }
    }
  };

  // SimpleList üçün sütunlar
  const columns = [
    {
      key: "id", // API-dən gələn 'id' sahəsi
      label: "ID",
    },
    {
      key: "date", // API-dən gələn 'date' sahəsi
      label: "Tarix",
    },
    {
      key: "time", // API-dən gələn 'time' sahəsi
      label: "Saat",
      render: (time) => `${time.hour}:${String(time.minute).padStart(2, "0")}`, // Saat formatlaması
    },
    {
      key: "number", // API-dən gələn 'number' sahəsi
      label: "Nömrə", // Example: anbar silinmə sənədinin nömrəsi
    },
    // Qeyd: API-dən gələn məlumatda `category`, `name`, `code`, `quantity` birbaşa yoxdur.
    // Bu məlumatlar `info/{id}` endpointindən gələn `deletionFromWarehouseProductResponses` içindədir.
    // Əgər siz ümumi siyahıda bu məlumatları göstərmək istəyirsinizsə, API bu məlumatı `read` endpointindən qaytarmalıdır,
    // ya da hər sətir üçün əlavə API çağırışı etməlisiniz (bu tövsiyə olunmur, performansı aşağı salar).
    // Hazırda mövcud API-yə uyğun sütunları qeyd edirəm.
  ];

  // SimpleList-ə ötürüləcək data
  // `deletions` array-i API-dən gələn obyektlərə malikdir.
  // Bizim sütunlar bu obyektlərin key-lərinə uyğun olmalıdır.
  const listData = deletions.map((deletion) => ({
    id: deletion.id,
    date: deletion.date,
    time: deletion.time,
    number: deletion.number,
    // Əgər məhsul məlumatlarını burada göstərmək istəyirsinizsə,
    // ya API `/read` endpointini dəyişməli, ya da SimpleList daxilində məhsul detallarını çəkməlisiniz (bu daha mürəkkəbdir).
    // Məhsul məlumatları ancaq `info/{id}` endpointindədir.
  }));

  if (loading) {
    return <div className="text-center py-4">Yüklənir...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Xəta: {error}</div>;
  }

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-1 min-h-screen">
      <div className="flex justify-between items-center gap-2 p-2">
        <div className="flex items-center gap-2">
          {/* CustomDropdown-u olduğu kimi saxlayaq, lakin onun funksionallığını 
                        bu kontekstdə necə istifadə edəcəyinizdən asılıdır.
                        Məsələn, kateqoriya üzrə filter üçün istifadə oluna bilər.
                    */}
          <CustomDropdown />
          <input
            type="date" // Tarix üzrə axtarış üçün type="date"
            placeholder="Tarixə görə axtarış..."
            className="w-full p-2 rounded-lg border border-gray-300"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Axtarış..."
            className="w-full p-2 rounded-lg border border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="" onClick={handleSearch}>
            <SearchIcon />
          </button>
        </div>
        <div className="flex items-center gap-8">
          <button
            className="bg-[#155EEF] text-white px-4 py-2 rounded-lg"
            onClick={() => {
              navigate("/stock/delete/add");
            }}>
            Yenisini əlavə et
          </button>
          <button className="">
            <DownloadIcon />
          </button>
        </div>
      </div>

      <SimpleList
        columns={columns}
        data={listData}
        enableDelete={true}
        enableEdit={true}
        enableView={true}
        handleView={(id) => {
          navigate("/stock/delete/" + id);
        }}
        handleEdit={(id) => {
          navigate("/stock/delete/" + id + "/edit");
        }} // Redaktə səhifəsinə yönləndirmə
        handleDelete={handleDelete} // Silmə funksiyasını ötürürük
      />
    </div>
  );
};

export default StockDelete;
