// src/stores/sidebarStore.js
import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  // Change 'isCollapsed' initial state from false to true
  isCollapsed: true, 
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));

export default useSidebarStore;