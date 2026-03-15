import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useUserStore } from '@cs/store';
import { supabase } from '@cs/supabase';
import { i18n, SUPPORTED_LOCALES } from '@cs/locales';
import type { SupportedLocale } from '@cs/locales';
import { Card } from '../../src/components/ui/Card';
import { Title, Subtitle } from '../../src/components/ui/Typography';
import { theme } from '../../src/theme';

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
};

export default function UserAreaScreen() {
  const { t } = useTranslation();
  const { profile, clearUser } = useUserStore();
  const currentLocale = (i18n.language ?? 'en') as SupportedLocale;

  const handleSignOut = async () => {
    if (profile?.id === 'guest') {
      // Guest has no Supabase session — clear store and navigate directly
      clearUser();
      router.replace('/(auth)/login');
      return;
    }
    // Authenticated user: sign out from Supabase.
    // clearUser() + navigation are handled by the SIGNED_OUT listener in _layout.tsx
    await supabase.auth.signOut();
  };

  const handleSignOutConfirm = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('auth.signOutConfirm'))) {
        handleSignOut();
      }
      return;
    }
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: handleSignOut },
    ]);
  };

  const handleLanguageChange = (locale: SupportedLocale) => {
    i18n.changeLanguage(locale);
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Title style={styles.pageTitle}>{t('userArea.title')}</Title>

        {/* Profile Card */}
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{profile.tier === 'PREMIUM' ? t('plan.premium') : t('plan.free')}</Text>
          </View>
        </Card>

        {/* Plan Card */}
        <Card>
          <Subtitle style={{ marginBottom: 12 }}>{t('userArea.currentPlan')}</Subtitle>
          {profile.tier === 'FREE' ? (
            <>
              <Text style={styles.planFeature}>• {t('plan.features.basicTools')}</Text>
              <Text style={styles.planFeature}>• {t('plan.features.limitedProjects')}</Text>
              <TouchableOpacity style={styles.upgradeButton} onPress={() => {}}>
                <Text style={styles.upgradeButtonText}>{t('userArea.upgrade')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.planFeature}>• {t('plan.features.advancedTools')}</Text>
              <Text style={styles.planFeature}>• {t('plan.features.unlimitedProjects')}</Text>
              <Text style={styles.planFeature}>• {t('plan.features.midiExport')}</Text>
              <TouchableOpacity style={styles.manageButton} onPress={() => {}}>
                <Text style={styles.manageButtonText}>{t('userArea.manageSubscription')}</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Language Card */}
        <Card>
          <Subtitle style={{ marginBottom: 12 }}>{t('settings.language')}</Subtitle>
          <View style={styles.localeRow}>
            {SUPPORTED_LOCALES.map((locale) => (
              <TouchableOpacity
                key={locale}
                style={[styles.localeBtn, currentLocale === locale && styles.localeBtnActive]}
                onPress={() => handleLanguageChange(locale)}
              >
                <Text style={[styles.localeBtnText, currentLocale === locale && styles.localeBtnTextActive]}>
                  {LOCALE_LABELS[locale]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOutConfirm}>
          <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  pageTitle: { marginBottom: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontSize: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  profileEmail: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceHover,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border,
  },
  tierText: { color: theme.colors.primary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  planFeature: { color: theme.colors.text, fontSize: 14, marginBottom: 6 },
  upgradeButton: {
    marginTop: 16, backgroundColor: theme.colors.primary,
    paddingVertical: 12, borderRadius: 8, alignItems: 'center',
  },
  upgradeButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  manageButton: {
    marginTop: 16, borderWidth: 1, borderColor: theme.colors.border,
    paddingVertical: 12, borderRadius: 8, alignItems: 'center',
  },
  manageButtonText: { color: theme.colors.text, fontWeight: '600', fontSize: 15 },
  localeRow: { flexDirection: 'row', gap: 8 },
  localeBtn: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceHover,
  },
  localeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  localeBtnText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  localeBtnTextActive: { color: '#fff' },
  signOutButton: {
    marginTop: 8, borderWidth: 1, borderColor: theme.colors.error,
    paddingVertical: 12, borderRadius: 8, alignItems: 'center',
  },
  signOutText: { color: theme.colors.error, fontWeight: '600', fontSize: 15 },
});
