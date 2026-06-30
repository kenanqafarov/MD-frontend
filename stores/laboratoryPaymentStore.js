// src/store/laboratoryPaymentStore.js
import { create } from 'zustand';
import { createLaboratoryPayment, readLaboratoryPayments } from '../src/api/laboratory-payment'; // API servis faylını import edirik

/**
 * Laboratoriya ödənişləri üçün Zustand store-u.
 * Store ödəniş siyahısını, yüklənmə və xəta vəziyyətlərini idarə edir.
 */
const useLaboratoryPaymentStore = create((set, get) => ({
  payments: [], // Texniklərin ödəniş məlumatları
  loading: false, // Məlumat yüklənmə vəziyyəti
  error: null, // Xəta mesajı

  /**
   * API-dən ödəniş məlumatlarını əldə edir və store-u yeniləyir.
   */
  fetchPayments: async () => {
    set({ loading: true, error: null }); // Yüklənməni başla, xətanı sıfırla
    try {
      const data = await readLaboratoryPayments(); // API çağırışı
      set({ payments: data, loading: false }); // Məlumatları qeyd et, yüklənməni bitir
    } catch (error) {
      set({ error: error.message, loading: false }); // Xətanı qeyd et, yüklənməni bitir
      console.error("Failed to fetch payments:", error);
    }
  },

  /**
   * Yeni ödəniş əlavə edir.
   * Ödəniş əlavə edildikdən sonra məlumatları yenidən çəkir.
   * @param {object} paymentData - Əlavə ediləcək ödəniş məlumatları
   * @returns {Promise<object>} - Yeni ödəniş məlumatı
   */
  addPayment: async (paymentData) => {
    set({ loading: true, error: null }); // Yüklənməni başla, xətanı sıfırla
    try {
      const newPayment = await createLaboratoryPayment(paymentData); // API çağırışı
      // Ödəniş əlavə edildikdən sonra, cədvəlin yenilənməsi üçün məlumatları yenidən çək.
      await get().fetchPayments();
      set({ loading: false }); // Yüklənməni bitir
      return newPayment;
    } catch (error) {
      set({ error: error.message, loading: false }); // Xətanı qeyd et, yüklənməni bitir
      console.error("Failed to add payment:", error);
      throw error; // Komponentdə xəta idarəetməsi üçün xətanı yenidən at
    }
  },
}));

export default useLaboratoryPaymentStore;