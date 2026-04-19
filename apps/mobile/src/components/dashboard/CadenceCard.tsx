import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@cs/store';
import type { Chord } from '@cs/music-engine';
import { Card } from '../ui/Card';
import { Title } from '../ui/Typography';
import { theme } from '../../theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const formatChordClass = (c: string) => {
  if (c === 'maj') return '';
  if (c === 'min') return 'm';
  if (c === 'aug') return '#5';
  return c;
};

const isMinor = (c: string) => c === 'min' || c.startsWith('m');
const formatDegree = (degree: string, chordClass: string) =>
  isMinor(chordClass) ? degree.replace(/[IV]+/g, (m) => m.toLowerCase()) : degree;

const chordHasCharacteristic = (chord: Chord) =>
  chord.degree.includes('b') || chord.degree.includes('#');

export function CadenceCard() {
  const { harmonyResult } = useAppStore();
  const isPremium = useIsPremium();
  const { t } = useTranslation();
  const { cadences } = harmonyResult;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cadenceGenres = useMemo(() => {
    const allGenres = Object.keys(cadences || {});
    if (isPremium) return allGenres;
    return allGenres.filter((g) => ['POP', 'JAZZ', 'CLASSICAL'].includes(g));
  }, [cadences, isPremium]);

  const [activeGenre, setActiveGenre] = useState<string>('');

  useEffect(() => {
    if (!cadenceGenres.length) { if (activeGenre) setActiveGenre(''); return; }
    if (!activeGenre || !cadenceGenres.includes(activeGenre)) setActiveGenre(cadenceGenres[0]);
  }, [activeGenre, cadenceGenres]);

  if (!cadences || !Object.keys(cadences).length) return null;

  const activeProgressions = cadences[activeGenre] || [];

  return (
    <Card>
      <View style={styles.header}>
        <Title>{t('dashboard.cadence.title')}</Title>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsCollapsed((p) => !p)}>
          <Text style={styles.toggleBtnText}>
            {isCollapsed ? t('dashboard.cadence.show') : t('dashboard.cadence.hide')}
          </Text>
        </TouchableOpacity>
      </View>

      {!isCollapsed && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabList}>
            {cadenceGenres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreTab, activeGenre === genre && styles.genreTabActive]}
                onPress={() => setActiveGenre(genre)}
              >
                <Text style={[styles.genreTabText, activeGenre === genre && styles.genreTabTextActive]}>
                  {t(`dashboard.cadence.${genre.toLowerCase()}`, genre)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!isPremium && (
            <Text style={styles.premiumNotice}>{t('dashboard.cadence.premiumNotice')}</Text>
          )}

          <View style={styles.cadenceList}>
            {activeProgressions.map((progression, idx) => (
              <View key={`${activeGenre}-${idx}`} style={styles.cadenceRow}>
                <Text style={styles.cadenceLabel}>
                  {t('dashboard.cadence.progression')} {idx + 1}
                </Text>
                <View style={styles.progression}>
                  {progression.map((chord, cIdx) => (
                    <View key={`${chord.name}-${cIdx}`} style={styles.chordWithArrow}>
                      <View style={styles.chordStack}>
                        <Text style={[styles.degreeText, chordHasCharacteristic(chord) && styles.degreeTextHighlight]}>
                          {`${formatDegree(chord.degree, chord.chordClass)}${formatChordClass(chord.chordClass)}`}
                        </Text>
                        <Text style={styles.chordName}>{chord.name}</Text>
                      </View>
                      {cIdx < progression.length - 1 && (
                        <Text style={styles.arrow}>→</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleBtn: {
    backgroundColor: theme.colors.surfaceHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  toggleBtnText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  tabList: {
    marginTop: 8,
    marginBottom: 4,
  },
  genreTab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceHover,
    marginRight: 8,
  },
  genreTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genreTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  genreTabTextActive: {
    color: '#fff',
  },
  premiumNotice: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  cadenceList: {
    marginTop: 12,
    gap: 10,
  },
  cadenceRow: {
    backgroundColor: theme.colors.surfaceHover,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  cadenceLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  progression: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  chordWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chordStack: {
    alignItems: 'center',
    minWidth: 40,
  },
  degreeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  degreeTextHighlight: {
    color: theme.colors.primary,
  },
  chordName: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  arrow: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
