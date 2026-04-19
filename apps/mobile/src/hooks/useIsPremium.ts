import { useUserStore } from '@cs/store';

/**
 * Returns true if the current user has PREMIUM access.
 *
 * In local development (__DEV__ === true) always returns true so that
 * guest users can explore all premium content without requiring a paid
 * subscription. This flag is stripped by the bundler in production builds.
 */
export function useIsPremium(): boolean {
  const tier = useUserStore((s) => s.profile?.tier);

  if (__DEV__) return true;

  return tier === 'PREMIUM';
}
