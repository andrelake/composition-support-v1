import { Redirect } from 'expo-router';
import { useUserStore } from '@cs/store';

export default function Index() {
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  // If there is an OAuth callback in progress (tokens in the URL hash),
  // stay put and let onAuthStateChange in _layout.tsx handle navigation
  const isOAuthCallback =
    typeof window !== 'undefined' && window.location.hash.includes('access_token');

  if (!hasHydrated || isOAuthCallback) {
    return null;
  }

  // If logged in, go to the main dashboard; otherwise go to login
  if (profile) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
