/**
 * Campaign-specific Store
 * Manages campaign data, caching, and operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../config/api';

const useCampaignStore = create(
  devtools(
    (set, get) => ({
      // Campaigns data
      campaigns: [],
      campaignsLoading: false,
      campaignsError: null,
      campaignsPagination: {
        page: 1,
        limit: 12,
        total: 0,
      },

      // Fetch campaigns
      fetchCampaigns: async (filters = {}) => {
        set({ campaignsLoading: true, campaignsError: null });
        try {
          const params = new URLSearchParams({
            page: filters.page || 1,
            limit: filters.limit || 12,
            ...(filters.status && { status: filters.status }),
            ...(filters.sortBy && { sortBy: filters.sortBy }),
            ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
          });

          const response = await api.get(`/campaigns?${params}`);
          const data = response.data;
          
          set({
            campaigns: data.items || [],
            campaignsPagination: {
              page: data.page || 1,
              limit: data.limit || 12,
              total: data.total || 0,
            },
            campaignsLoading: false,
          });
        } catch (error) {
          set({
            campaignsError: error.message,
            campaignsLoading: false,
          });
        }
      },

      // Single campaign cache
      campaignCache: {},
      
      // Fetch single campaign
      fetchCampaign: async (id) => {
        // Check cache first
        const cached = get().campaignCache[id];
        if (cached && Date.now() - cached.timestamp < 60000) {
          return cached.data;
        }

        try {
          const response = await api.get(`/campaigns/${id}`);
          const data = response.data;
          
          // Update cache
          set((state) => ({
            campaignCache: {
              ...state.campaignCache,
              [id]: {
                data,
                timestamp: Date.now(),
              },
            },
          }));
          
          return data;
        } catch (error) {
          throw error;
        }
      },

      // Clear campaign cache
      clearCampaignCache: (id) => {
        if (id) {
          set((state) => {
            const newCache = { ...state.campaignCache };
            delete newCache[id];
            return { campaignCache: newCache };
          });
        } else {
          set({ campaignCache: {} });
        }
      },

      // Update campaign in cache
      updateCampaignInCache: (id, updates) => {
        set((state) => {
          const cached = state.campaignCache[id];
          if (!cached) return state;

          return {
            campaignCache: {
              ...state.campaignCache,
              [id]: {
                data: { ...cached.data, ...updates },
                timestamp: Date.now(),
              },
            },
          };
        });
      },

      // Donations cache
      donationsCache: {},
      
      // Fetch donations for campaign
      fetchDonations: async (campaignId, page = 1, limit = 20) => {
        const cacheKey = `${campaignId}-${page}-${limit}`;
        const cached = get().donationsCache[cacheKey];
        if (cached && Date.now() - cached.timestamp < 30000) {
          return cached.data;
        }

        try {
          const response = await api.get(
            `/campaigns/${campaignId}/donations?page=${page}&limit=${limit}`
          );
          const data = response.data;
          
          set((state) => ({
            donationsCache: {
              ...state.donationsCache,
              [cacheKey]: {
                data,
                timestamp: Date.now(),
              },
            },
          }));
          
          return data;
        } catch (error) {
          throw error;
        }
      },

      // Milestones cache
      milestonesCache: {},
      
      // Fetch milestones for campaign
      fetchMilestones: async (campaignId) => {
        const cached = get().milestonesCache[campaignId];
        if (cached && Date.now() - cached.timestamp < 60000) {
          return cached.data;
        }

        try {
          const response = await api.get(`/campaigns/${campaignId}/milestones`);
          const data = response.data;
          
          set((state) => ({
            milestonesCache: {
              ...state.milestonesCache,
              [campaignId]: {
                data: data.items || [],
                timestamp: Date.now(),
              },
            },
          }));
          
          return data.items || [];
        } catch (error) {
          throw error;
        }
      },

      // Add milestone to cache
      addMilestoneToCache: (campaignId, milestone) => {
        set((state) => ({
          milestonesCache: {
            ...state.milestonesCache,
            [campaignId]: [
              ...(state.milestonesCache[campaignId] || []),
              milestone,
            ],
          },
        }));
      },

      // Reset store
      reset: () =>
        set({
          campaigns: [],
          campaignsLoading: false,
          campaignsError: null,
          campaignsPagination: { page: 1, limit: 12, total: 0 },
          campaignCache: {},
          donationsCache: {},
          milestonesCache: {},
        }),
    }),
    { name: 'Campaign Store' }
  )
);

export default useCampaignStore;
