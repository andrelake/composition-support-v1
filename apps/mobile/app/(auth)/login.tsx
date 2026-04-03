import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@cs/supabase';
import { useUserStore } from '@cs/store';
import type { UserProfile } from '@cs/store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const setProfile = useUserStore((s) => s.setProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.EXPO_PUBLIC_SITE_URL ?? '';

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (authError) throw authError;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setLoading(false);
    }
  };

  // Quick guest access (no auth) — skips login for now
  const handleContinueAsGuest = () => {
    const guestProfile: UserProfile = {
      id: `guest-${crypto.randomUUID()}`,
      name: 'Guest',
      email: '',
      tier: 'FREE',
      memberSince: new Date().toISOString(),
    };
    setProfile(guestProfile);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.title')}</Text>
      <Text style={styles.subtitle}>Music theory tools for composers</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={[styles.googleButton, loading && styles.googleButtonDisabled]} onPress={handleGoogleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e1e1e6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#a8a8b3',
    marginBottom: 48,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#8257e6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleButtonDisabled: {
    opacity: 0.4,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#323238',
  },
  guestButtonText: {
    color: '#a8a8b3',
    fontSize: 16,
  },
  error: {
    color: '#E83F5B',
    marginBottom: 16,
    textAlign: 'center',
  },
});
