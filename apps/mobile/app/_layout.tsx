import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { initI18n } from '@cs/locales';
import { supabase } from '@cs/supabase';
import { useUserStore } from '@cs/store';
import type { UserProfile } from '@cs/store';

// Initialize i18n once at app startup
initI18n('en');

export default function RootLayout() {
  const setProfile = useUserStore((s) => s.setProfile);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    let currentUserId: string | null = null;

    const fetchAndSetProfile = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }) => {
      // Idempotency guard: skip if same user already loaded
      if (currentUserId === user.id) return;

      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const profile: UserProfile = {
          id: user.id,
          name: profileRow?.name ?? (user.user_metadata?.full_name as string) ?? user.email ?? 'User',
          email: user.email ?? '',
          tier: profileRow?.tier ?? 'FREE',
          memberSince: profileRow?.created_at ?? user.created_at ?? new Date().toISOString(),
        };

        currentUserId = user.id;
        setProfile(profile);
        router.replace('/(tabs)');
      } catch {
        // Fallback profile on network error or missing row
        const fallback: UserProfile = {
          id: user.id,
          name: (user.user_metadata?.full_name as string) ?? user.email ?? 'User',
          email: user.email ?? '',
          tier: 'FREE',
          memberSince: user.created_at ?? new Date().toISOString(),
        };
        currentUserId = user.id;
        setProfile(fallback);
        router.replace('/(tabs)');
      }
    };

    // Listen for auth state changes (handles OAuth redirect + sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          await fetchAndSetProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          currentUserId = null;
          clearUser();
          router.replace('/(auth)/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setProfile, clearUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <StatusBar style="light" backgroundColor={theme.colors.background} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
