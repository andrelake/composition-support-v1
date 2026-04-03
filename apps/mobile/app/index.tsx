import { Redirect } from 'expo-router';
import { useUserStore } from '@cs/store';

export default function Index() {
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  // Wait for store rehydration to prevent flash redirect on cold-start
  if (!hasHydrated) {
    return null;
  }

  // If logged in, go to the main dashboard; otherwise go to login
  if (profile) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
