import type { Note } from './types';

export const CHROMATIC_SCALE: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_SCALE_FLATS: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CIRCLE_OF_FIFTHS: Note[] = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
];

// Semitone intervals from root
export const INTERVALS = {
  MAJOR:           [0, 2, 4, 5, 7, 9, 11],
  MINOR:           [0, 2, 3, 5, 7, 8, 10], // Natural Minor
  HARMONIC_MINOR:  [0, 2, 3, 5, 7, 8, 11],
  MELODIC_MINOR:   [0, 2, 3, 5, 7, 9, 11],
  IONIAN:          [0, 2, 4, 5, 7, 9, 11],
  DORIAN:          [0, 2, 3, 5, 7, 9, 10],
  PHRYGIAN:        [0, 1, 3, 5, 7, 8, 10],
  LYDIAN:          [0, 2, 4, 6, 7, 9, 11],
  MIXOLYDIAN:      [0, 2, 4, 5, 7, 9, 10],
  AEOLIAN:         [0, 2, 3, 5, 7, 8, 10],
  LOCRIAN:         [0, 1, 3, 5, 6, 8, 10],
  PENTATONIC_MAJOR:[0, 2, 4, 7, 9],
  PENTATONIC_MINOR:[0, 3, 5, 7, 10],
};

export const MODE_CHARACTERISTIC_DEGREES: Record<string, string[]> = {
  IONIAN:     ['I'],
  DORIAN:     ['bIII', 'IV', 'bVII'],
  PHRYGIAN:   ['bII'],
  LYDIAN:     ['#iv°'],
  MIXOLYDIAN: ['bVII'],
  AEOLIAN:    ['bIII', 'bVI', 'bVII'],
  LOCRIAN:    ['bII', 'bV'],
};

// Common Cadences — represented as indices of the diatonic chords array
export const CADENCES = {
  POP:      [[0, 4, 5, 3]],  // I-V-vi-IV
  JAZZ:     [[1, 4, 0]],     // ii-V-I
  CLASSICAL:[[0, 3, 4, 0]],  // I-IV-V-I
  REGGAE: [
    [0, 5, 3, 4], // I-vi-IV-V
    [0, 4, 3],    // I-V-IV
    [5, 3, 4],    // vi-IV-V
    [0, 3, 0],    // I-IV-I
    [0, 1, 0],    // I-ii-I
  ],
};

// I18N keys returned by the engine (UI layer translates them)
export const I18N_KEYS = {
  TONALITY: {
    MAJOR: 'tonality.major',
    MINOR: 'tonality.minor',
  },
  QUALITIES: {
    MAJOR:      'quality.major',
    MINOR:      'quality.minor',
    DIMINISHED: 'quality.diminished',
    AUGMENTED:  'quality.augmented',
  },
};

export const MODE_QUALITIES: Record<string, { type: string; i18n: string; degree: string; isCharacteristic?: boolean }[]> = {
  IONIAN: [
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'I'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'ii'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iii'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'IV'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'V'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'vi'   },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vii°' },
  ],
  DORIAN: [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'ii'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bIII' },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'IV'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'v'    },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'vi°'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVII' },
  ],
  PHRYGIAN: [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bII',  isCharacteristic: true },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bIII' },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iv'   },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'v°'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVI'  },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'bVII' },
  ],
  LYDIAN: [
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'I'    },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'II'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iii'  },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: '#iv°' },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'V'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'vi'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'vii'  },
  ],
  MIXOLYDIAN: [
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'I'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'ii'   },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'iii°' },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'IV'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'v'    },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'vi'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVII' },
  ],
  AEOLIAN: [
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'i'    },
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'ii°'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bIII' },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iv'   },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'v'    },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVI'  },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVII' },
  ],
  LOCRIAN: [
    { type: 'dim', i18n: I18N_KEYS.QUALITIES.DIMINISHED, degree: 'i°'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bII'  },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'bIII' },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'iv'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bV'   },
    { type: 'Maj', i18n: I18N_KEYS.QUALITIES.MAJOR,      degree: 'bVI'  },
    { type: 'min', i18n: I18N_KEYS.QUALITIES.MINOR,      degree: 'bVII' },
  ],
};
