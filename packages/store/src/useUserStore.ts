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
        // Do not persist guest profiles — they have no real session and
        // should not bypass the login screen on app restart.
        profile: state.profile?.id === 'guest' ? null : state.profile,
        billing: state.billing,
      }),
    }
  )
);
