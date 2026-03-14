import type { Note, Tonality, Chord, KeyConfig, HarmonyResult } from './types';
import {
  CHROMATIC_SCALE,
  CHROMATIC_SCALE_FLATS,
  CIRCLE_OF_FIFTHS,
  INTERVALS,
  CADENCES,
  I18N_KEYS,
  MODE_QUALITIES,
  MODE_CHARACTERISTIC_DEGREES,
} from './constants';

/** Helper to get chromatic index for a note (handles sharps and flats) */
const getNoteIndex = (note: Note): number => {
  let idx = CHROMATIC_SCALE.indexOf(note);
  if (idx === -1) idx = CHROMATIC_SCALE_FLATS.indexOf(note);
  return idx;
};

/** Returns the note name at a given interval from root, respecting sharp/flat context */
const getNoteAtInterval = (rootIndex: number, semitones: number, useFlats: boolean): Note => {
  const normalizedIndex = (rootIndex + semitones) % 12;
  return useFlats ? CHROMATIC_SCALE_FLATS[normalizedIndex] : CHROMATIC_SCALE[normalizedIndex];
};

/**
 * Identifies chord quality class from interval pattern.
 * Returns shorthand strings used in chord names (e.g. 'm7', 'maj7').
 */
const getChordClassFromIntervals = (intervals: number[]): string => {
  const pattern = intervals.join(',');
  switch (pattern) {
    case '0,4,7,11': return 'maj7';
    case '0,4,7,10': return '7';
    case '0,3,7,10': return 'm7';
    case '0,3,6,10': return 'm7b5';
    case '0,3,6,9':  return 'dim7';
    case '0,3,7,11': return 'mMaj7';
    case '0,4,8,11': return 'augMaj7';
    case '0,4,8,10': return 'aug7';
    case '0,4,7':    return 'maj';
    case '0,3,7':    return 'm';
    case '0,3,6':    return 'dim';
    case '0,4,8':    return 'aug';
    default:         return 'maj';
  }
};

/**
 * Determines whether a key should use flats or sharps.
 * Major: F, Bb, Eb, Ab, Db, Gb, Cb → flats.
 * Minor: D, G, C, F, Bb, Eb, Ab → flats.
 */
const shouldUseFlats = (root: Note, tonality: Tonality = 'Major'): boolean => {
  if (root.includes('b')) return true;
  if (root.includes('#')) return false;
  if (tonality.includes('Minor')) {
    return ['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'].includes(root);
  }
  return ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(root);
};

/** Returns the ordered notes of a scale for a given root and tonality */
export const getScale = (root: Note, tonality: Tonality): Note[] => {
  const rootIdx = getNoteIndex(root);
  const flatKeys = shouldUseFlats(root, tonality);

  let intervals = INTERVALS.MAJOR;
  if      (tonality === 'Minor')           intervals = INTERVALS.MINOR;
  else if (tonality === 'Harmonic Minor')  intervals = INTERVALS.HARMONIC_MINOR;
  else if (tonality === 'Melodic Minor')   intervals = INTERVALS.MELODIC_MINOR;
  else if (tonality === 'Ionian')          intervals = INTERVALS.IONIAN;
  else if (tonality === 'Dorian')          intervals = INTERVALS.DORIAN;
  else if (tonality === 'Phrygian')        intervals = INTERVALS.PHRYGIAN;
  else if (tonality === 'Lydian')          intervals = INTERVALS.LYDIAN;
  else if (tonality === 'Mixolydian')      intervals = INTERVALS.MIXOLYDIAN;
  else if (tonality === 'Aeolian')         intervals = INTERVALS.AEOLIAN;
  else if (tonality === 'Locrian')         intervals = INTERVALS.LOCRIAN;
  else if (tonality === 'Major Pentatonic') intervals = INTERVALS.PENTATONIC_MAJOR;
  else if (tonality === 'Minor Pentatonic') intervals = INTERVALS.PENTATONIC_MINOR;

  return intervals.map(interval => getNoteAtInterval(rootIdx, interval, flatKeys));
};

/** Builds the 7 diatonic chords (with 7th) for a given scale and tonality */
export const getDiatonicChords = (scale: Note[], tonality: Tonality): Chord[] => {
  type Q = { type: 'Maj' | 'min' | 'dim' | 'aug'; i18n: string; degree: string; isCharacteristic?: boolean };

  const qualitiesMajor: Q[] = [
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'I'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'ii'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iii'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'IV'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'V'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'vi'   },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vii°' },
  ];
  const qualitiesMinor: Q[] = [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'ii°'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'III'  },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iv'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'v'    },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'VI'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'VII'  },
  ];
  const qualitiesHarmonic: Q[] = [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'ii°'  },
    { type: 'aug', i18n: I18N_KEYS.QUALITIES.AUGMENTED,  degree: 'III+' },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iv'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'V'    },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'VI'   },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vii°' },
  ];
  const qualitiesMelodic: Q[] = [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'ii'   },
    { type: 'aug', i18n: I18N_KEYS.QUALITIES.AUGMENTED,  degree: 'III+' },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'IV'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'V'    },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vi°'  },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vii°' },
  ];

  let qualities: Q[] = qualitiesMajor;
  if      (tonality === 'Minor')          qualities = qualitiesMinor;
  else if (tonality === 'Harmonic Minor') qualities = qualitiesHarmonic;
  else if (tonality === 'Melodic Minor')  qualities = qualitiesMelodic;
  else if (tonality === 'Ionian')         qualities = MODE_QUALITIES.IONIAN as Q[];
  else if (tonality === 'Dorian')         qualities = MODE_QUALITIES.DORIAN as Q[];
  else if (tonality === 'Phrygian')       qualities = MODE_QUALITIES.PHRYGIAN as Q[];
  else if (tonality === 'Lydian')         qualities = MODE_QUALITIES.LYDIAN as Q[];
  else if (tonality === 'Mixolydian')     qualities = MODE_QUALITIES.MIXOLYDIAN as Q[];
  else if (tonality === 'Aeolian')        qualities = MODE_QUALITIES.AEOLIAN as Q[];
  else if (tonality === 'Locrian')        qualities = MODE_QUALITIES.LOCRIAN as Q[];

  if (scale.length !== 7) return [];

  const characteristicDegrees = MODE_CHARACTERISTIC_DEGREES[tonality.toUpperCase().replace(' ', '_')] ?? [];

  return scale.map((rootNote, index) => {
    const q = qualities[index];
    const chordNotes = [
      scale[index],
      scale[(index + 2) % 7],
      scale[(index + 4) % 7],
      scale[(index + 6) % 7],
    ];

    const rootIdx = getNoteIndex(rootNote);
    const noteIntervals = chordNotes.map(note => {
      const noteIdx = getNoteIndex(note);
      return (noteIdx - rootIdx + 12) % 12;
    });

    const chordClass = getChordClassFromIntervals(noteIntervals);
    const chordName = `${rootNote}${chordClass === 'maj' ? '' : chordClass}`;

    return {
      name: chordName,
      root: rootNote,
      quality: q.i18n,
      qualityType: q.type,
      chordClass,
      notes: chordNotes,
      degree: q.degree,
      isCharacteristic: characteristicDegrees.includes(q.degree),
    };
  });
};

/** Transposes the CADENCES constant into actual chord objects for the given key */
export const getCadences = (chords: Chord[]): Record<string, Chord[][]> => {
  if (chords.length === 0) return {};
  return Object.entries(CADENCES).reduce<Record<string, Chord[][]>>((acc, [genre, progressions]) => {
    acc[genre] = progressions.map(progression => progression.map(i => chords[i]));
    return acc;
  }, {});
};

/** Main public API: calculates the full harmonic context for a key */
export const calculateHarmony = (root: Note, tonality: Tonality): HarmonyResult => {
  const scale = getScale(root, tonality);
  const chords = getDiatonicChords(scale, tonality);
  const cadences = getCadences(chords);
  return { key: { root, tonality }, scale, chords, cadences };
};

/** Returns a random key from the Circle of Fifths */
export const getRandomKey = (): KeyConfig => {
  const root = CIRCLE_OF_FIFTHS[Math.floor(Math.random() * CIRCLE_OF_FIFTHS.length)];
  const tonality = Math.random() > 0.5 ? 'Major' : 'Minor';
  return { root, tonality };
};
