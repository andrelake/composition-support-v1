import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserState, UserProfile } from './types';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      billing: {
        method: undefined,
        history: [],
      },
      isLoading: false,
      error: null,

      setProfile: (profile: UserProfile | null) => {
        set({ profile, error: null });
      },

      updateUser: (data: Partial<UserProfile>) => {
        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, ...data } });
        }
      },

      clearUser: () => {
        set({
          profile: null,
          billing: { method: undefined, history: [] },
          error: null,
        });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
        billing: state.billing,
      }),
    }
  )
);
