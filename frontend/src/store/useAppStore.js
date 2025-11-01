/**
 * Global Application Store using Zustand
 * Manages app-wide state without prop drilling
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        // User state
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),

        // UI state
        theme: 'light',
        toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
        
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        // Notifications
        notifications: [],
        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              { id: Date.now(), ...notification },
            ],
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),

        // Campaign filters (persisted across sessions)
        campaignFilters: {
          status: '',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          search: '',
        },
        setCampaignFilters: (filters) =>
          set((state) => ({
            campaignFilters: { ...state.campaignFilters, ...filters },
          })),
        resetCampaignFilters: () =>
          set({
            campaignFilters: {
              status: '',
              sortBy: 'createdAt',
              sortOrder: 'desc',
              search: '',
            },
          }),

        // Recent campaigns (cache)
        recentCampaigns: [],
        setRecentCampaigns: (campaigns) => set({ recentCampaigns: campaigns }),
        addRecentCampaign: (campaign) =>
          set((state) => ({
            recentCampaigns: [campaign, ...state.recentCampaigns.slice(0, 9)],
          })),

        // Favorites
        favoriteCampaigns: [],
        toggleFavorite: (campaignId) =>
          set((state) => {
            const isFavorite = state.favoriteCampaigns.includes(campaignId);
            return {
              favoriteCampaigns: isFavorite
                ? state.favoriteCampaigns.filter((id) => id !== campaignId)
                : [...state.favoriteCampaigns, campaignId],
            };
          }),
        isFavorite: (campaignId) => get().favoriteCampaigns.includes(campaignId),

        // Modal state
        activeModal: null,
        modalData: null,
        openModal: (modalName, data = null) =>
          set({ activeModal: modalName, modalData: data }),
        closeModal: () => set({ activeModal: null, modalData: null }),

        // Loading states
        globalLoading: false,
        setGlobalLoading: (loading) => set({ globalLoading: loading }),

        // Error state
        globalError: null,
        setGlobalError: (error) => set({ globalError: error }),
        clearGlobalError: () => set({ globalError: null }),

        // Stats cache
        stats: null,
        setStats: (stats) => set({ stats }),

        // Search history
        searchHistory: [],
        addSearchTerm: (term) =>
          set((state) => ({
            searchHistory: [
              term,
              ...state.searchHistory.filter((t) => t !== term).slice(0, 9),
            ],
          })),
        clearSearchHistory: () => set({ searchHistory: [] }),
      }),
      {
        name: 'd3r-storage', // LocalStorage key
        partialize: (state) => ({
          // Only persist these fields
          theme: state.theme,
          campaignFilters: state.campaignFilters,
          favoriteCampaigns: state.favoriteCampaigns,
          searchHistory: state.searchHistory,
        }),
      }
    ),
    { name: 'D3R App Store' } // DevTools name
  )
);

export default useAppStore;
