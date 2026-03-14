export type Note = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Tonality =
  | 'Major'
  | 'Minor'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Ionian'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian'
  | 'Major Pentatonic'
  | 'Minor Pentatonic';

export interface KeyConfig {
  root: Note;
  tonality: Tonality;
}

export interface Scale {
  root: Note;
  notes: Note[];
  tonality: Tonality;
}

export interface Chord {
  name: string;        // e.g., "Cmaj7"
  root: Note;
  quality: string;     // i18n key, e.g., "quality.major"
  qualityType: 'Maj' | 'min' | 'dim' | 'aug';
  chordClass: string;  // e.g., "maj", "min", "dim", "aug", "m7", "maj7", etc.
  notes: Note[];       // The constituent notes
  degree: string;      // Roman numeral: I, ii, V7, etc.
  isCharacteristic?: boolean;
}

export interface HarmonyResult {
  key: KeyConfig;
  scale: Note[];
  chords: Chord[];
  cadences: Record<string, Chord[][]>; // Genre -> list of progressions
}
