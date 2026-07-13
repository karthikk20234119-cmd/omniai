import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  isDarkMode: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

export default useAppStore;
