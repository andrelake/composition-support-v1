import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@cs/store';
import { getRandomKey } from '@cs/music-engine';
import { theme } from '../../theme';

export function SpinButton() {
  const { t } = useTranslation();
  const { isSpinning, spin } = useAppStore();

  const handleSpin = () => {
    if (isSpinning) return;
    spin();
  };

  return (
    <TouchableOpacity style={[styles.button, isSpinning && styles.disabled]} onPress={handleSpin} disabled={isSpinning}>
      {isSpinning ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.label}>{t('roulette.spin')}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
