import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// 🟢 Yeni iş qrafiki yaratmaq
export const createWorkerSchedule = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/workers-work-schedule/create`,
    data
  );
  return response.data;
};
// 🟡 Mövcud iş qrafikini yeniləmək
export const updateWorkerSchedule = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/workers-work-schedule/update`,
    data
  );
  return response.data;
};

// 🔵 Bütün iş qrafiklərini oxumaq
export const getWorkerSchedules = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/workers-work-schedule/read`
  );
  return response.data;
};

export const searchWorkerSchedules = async (searchData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/workers-work-schedule/search`,
      searchData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching worker schedules:", error);
    throw error;
  }
};
// 🔴 İş qrafikini silmək
export const deleteWorkerSchedule = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/workers-work-schedule/delete/${id}`
  );
  return response.data;
};
