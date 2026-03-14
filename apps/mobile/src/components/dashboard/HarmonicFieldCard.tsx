import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@cs/store';
import { getScale, getDiatonicChords } from '@cs/music-engine';
import type { Note, Tonality } from '@cs/music-engine';
import { Card } from '../ui/Card';
import { Title } from '../ui/Typography';
import { theme } from '../../theme';

const formatChordClass = (c: string) => {
  if (c === 'maj') return '';
  if (c === 'min') return 'm';
  if (c === 'aug') return '#5';
  return c;
};

const isMinor = (c: string) => c === 'min' || c.startsWith('m');

const formatDegree = (degree: string, chordClass: string) =>
  isMinor(chordClass) ? degree.replace(/[IV]+/g, (m) => m.toLowerCase()) : degree;

interface HarmonicRowProps {
  root: Note;
  tonality: Tonality;
  label?: string;
}

function HarmonicRow({ root, tonality, label }: HarmonicRowProps) {
  const { t } = useTranslation();
  const scale = getScale(root, tonality);
  const chords = getDiatonicChords(scale, tonality);
  if (!chords.length) return null;

  return (
    <View style={styles.rowWrapper}>
      <View style={styles.rowHeader}>
        <View style={styles.rowAccent} />
        <Text style={styles.rowTitle}>
          {root} {t(`tonality.${tonality}`, tonality)}
        </Text>
        {label && <Text style={styles.badge}>{label}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chordList}>
        {chords.map((chord, idx) => (
          <View key={`${chord.name}-${idx}`} style={[styles.chordItem, chord.isCharacteristic && styles.chordItemHighlight]}>
            <Text style={[styles.degreeText, chord.isCharacteristic && styles.degreeTextHighlight]}>
              {`${formatDegree(chord.degree, chord.chordClass)}${formatChordClass(chord.chordClass)}`}
            </Text>
            <Text style={[styles.chordName, chord.isCharacteristic && styles.chordNameHighlight]}>
              {chord.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function HarmonicFieldCard() {
  const { currentKey } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'modes'>('basic');

  if (!currentKey) return null;

  const parallelTonality: Tonality = currentKey.tonality === 'Major' ? 'Minor' : 'Major';

  const basicRows: Array<{ root: Note; tonality: Tonality; label?: string }> = [
    { root: currentKey.root, tonality: currentKey.tonality, label: t('dashboard.harmonicField.selectedKey') },
    { root: currentKey.root, tonality: parallelTonality, label: t('dashboard.harmonicField.parallelKey') },
    { root: currentKey.root, tonality: 'Melodic Minor' },
    { root: currentKey.root, tonality: 'Harmonic Minor' },
  ];

  const modeRows: Array<{ root: Note; tonality: Tonality }> = [
    { root: currentKey.root, tonality: 'Ionian' },
    { root: currentKey.root, tonality: 'Dorian' },
    { root: currentKey.root, tonality: 'Phrygian' },
    { root: currentKey.root, tonality: 'Lydian' },
    { root: currentKey.root, tonality: 'Mixolydian' },
    { root: currentKey.root, tonality: 'Aeolian' },
    { root: currentKey.root, tonality: 'Locrian' },
  ];

  const rows = activeTab === 'basic' ? basicRows : modeRows;

  return (
    <Card>
      <Title>{t('dashboard.harmonicField.title')}</Title>
      <View style={styles.tabContainer}>
        {(['basic', 'modes'] as const).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tab}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'basic' ? t('dashboard.harmonicField.basic') : t('dashboard.harmonicField.modes')}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.listContainer}>
        {rows.map((row, idx) => (
          <HarmonicRow key={`${row.root}-${row.tonality}-${idx}`} root={row.root} tonality={row.tonality} label={'label' in row ? row.label : undefined} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginTop: 8,
    marginBottom: 12,
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
    marginTop: 4,
  },
  listContainer: {
    gap: 16,
  },
  rowWrapper: {
    gap: 6,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowAccent: {
    width: 3,
    height: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  badge: {
    fontSize: 10,
    backgroundColor: theme.colors.surfaceHover,
    color: theme.colors.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  chordList: {
    paddingLeft: 4,
  },
  chordItem: {
    marginRight: 16,
    padding: 4,
    borderRadius: 6,
  },
  chordItemHighlight: {
    backgroundColor: theme.colors.surfaceHover,
  },
  degreeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  degreeTextHighlight: {
    color: theme.colors.primary,
  },
  chordName: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  chordNameHighlight: {
    color: theme.colors.primary,
  },
});
