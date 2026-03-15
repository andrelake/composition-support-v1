import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@cs/store';
import { getScale } from '@cs/music-engine';
import { Card } from '../ui/Card';
import { Title, Subtitle } from '../ui/Typography';
import { theme } from '../../theme';

const MAJOR_PENTATONIC_DEGREES = ['I', 'II', 'III', 'V', 'VI'];
const MINOR_PENTATONIC_DEGREES = ['i', 'bIII', 'iv', 'v', 'bVII'];

export function ScaleRefCard() {
  const { currentKey, harmonyResult, setKey } = useAppStore();
  const { t } = useTranslation();

  const handleTonalityToggle = () => {
    setKey(currentKey.root, currentKey.tonality === 'Major' ? 'Minor' : 'Major');
  };

  const scaleNotes = harmonyResult.scale;
  const scaleChords = harmonyResult.chords;

  if (!scaleNotes || scaleNotes.length === 0) return null;

  const majorPentatonic = getScale(currentKey.root, 'Major Pentatonic');
  const minorPentatonic = getScale(currentKey.root, 'Minor Pentatonic');

  return (
    <Card>
      <View style={styles.titleRow}>
        <Title>
          {currentKey.root} {t(`tonality.${currentKey.tonality}`, currentKey.tonality)}
        </Title>
        <TouchableOpacity style={styles.tonalityButton} onPress={handleTonalityToggle}>
          <Text style={styles.tonalityButtonText}>
            {currentKey.tonality === 'Major'
              ? t('dashboard.actions.switchToMinor')
              : t('dashboard.actions.switchToMajor')}
          </Text>
        </TouchableOpacity>
      </View>
      <Subtitle style={{ marginBottom: 12 }}>{t('dashboard.scale.notes')}</Subtitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {scaleNotes.map((note, idx) => (
          <View key={`${note}-${idx}`} style={styles.noteWrapper}>
            <Text style={styles.degreeText}>{scaleChords?.[idx]?.degree || ''}</Text>
            <View style={[styles.noteBadge, idx === 0 && styles.noteBadgeRoot]}>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.section}>
        <Subtitle style={{ marginBottom: 12 }}>{t('dashboard.scale.pentatonic')}</Subtitle>

        <View style={styles.pentatonicRow}>
          <Text style={styles.scaleLabel}>{t('tonality.Major')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {majorPentatonic.map((note, idx) => (
              <View key={`maj-${note}-${idx}`} style={styles.noteWrapper}>
                <Text style={styles.degreeText}>{MAJOR_PENTATONIC_DEGREES[idx]}</Text>
                <View style={[styles.noteBadge, idx === 0 && styles.noteBadgeRoot]}>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pentatonicRow}>
          <Text style={styles.scaleLabel}>{t('tonality.Minor')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {minorPentatonic.map((note, idx) => (
              <View key={`min-${note}-${idx}`} style={styles.noteWrapper}>
                <Text style={styles.degreeText}>{MINOR_PENTATONIC_DEGREES[idx]}</Text>
                <View style={[styles.noteBadge, idx === 0 && styles.noteBadgeRoot]}>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tonalityButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tonalityButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  noteWrapper: {
    alignItems: 'center',
    marginRight: 8,
  },
  degreeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    height: 14,
  },
  noteBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBadgeRoot: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: theme.colors.text,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  pentatonicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scaleLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    minWidth: 44,
  },
});
