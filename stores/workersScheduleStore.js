import { create } from "zustand";
import {
  createWorkerSchedule,
  updateWorkerSchedule,
  getWorkerSchedules,
  searchWorkerSchedules,
  deleteWorkerSchedule,
} from "../src/api/worker-schedule";
import axios from "axios";
const API_BASE_URL = "http://localhost:5555/api/v1";

const useWorkersScheduleStore = create((set, get) => ({
  schedules: [], // Initialize as empty array
  loading: false,
  error: null,
  selectedDoctor: null,
  selectedRoom: null,

  // 🔄 Bütün iş qrafiklərini yüklə
  fetchSchedules: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getWorkerSchedules();
      set({ schedules: data || [] }); // Ensure it's always an array
    } catch (error) {
      console.error("Fetch schedules error:", error);
      set({ error, schedules: [] });
    } finally {
      set({ loading: false });
    }
  },

 // ➕ Yeni qrafik yarat
  addSchedule: async (scheduleData) => {
    set({ loading: true, error: null });
    try {
      await createWorkerSchedule(scheduleData);
      await get().fetchSchedules();
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  // 📝 Qrafiki yenilə
  updateSchedule: async (scheduleData) => {
    set({ loading: true, error: null });
    try {
      await updateWorkerSchedule(scheduleData);
      await get().fetchSchedules();
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
  searchSchedules: async (searchData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workers-work-schedule/search`,
        searchData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      set({ schedules: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
      console.error("Search schedules error:", error);
    }
  },
  // ❌ Qrafiki sil
  removeSchedule: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteWorkerSchedule(id);
      await get().fetchSchedules();
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },

  // Həkim seç
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),

  // Otaq seç
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useWorkersScheduleStore;
