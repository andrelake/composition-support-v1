import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAppStore } from '@cs/store';
import { CIRCLE_OF_FIFTHS, getRandomKey } from '@cs/music-engine';
import type { Note } from '@cs/music-engine';
import { theme } from '../../theme';

const SIZE = 280;
const RADIUS = SIZE / 2;
const INNER_RADIUS = RADIUS * 0.35;
const SEGMENT_COUNT = CIRCLE_OF_FIFTHS.length; // 12
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

// Map enharmonics to CIRCLE_OF_FIFTHS entries
const normalizeKey = (key: string): Note => {
  const map: Record<string, Note> = { 'C#': 'Db', 'G#': 'Ab', 'D#': 'Eb', 'A#': 'Bb' };
  if (CIRCLE_OF_FIFTHS.includes(key as Note)) return key as Note;
  return (map[key] ?? key) as Note;
};

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const buildSegmentPath = (cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number): string => {
  const o1 = polarToCartesian(cx, cy, outerR, startAngle);
  const o2 = polarToCartesian(cx, cy, outerR, endAngle);
  const i1 = polarToCartesian(cx, cy, innerR, endAngle);
  const i2 = polarToCartesian(cx, cy, innerR, startAngle);
  return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 0 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 0 0 ${i2.x} ${i2.y} Z`;
};

const AnimatedG = Animated.createAnimatedComponent(G);

export function RouletteWheel() {
  const { currentKey, isSpinning, setKey, setSpinning, spin } = useAppStore();
  const rotation = useSharedValue(0);
  const totalRotation = React.useRef(0);
  const targetKeyRef = React.useRef<ReturnType<typeof getRandomKey> | null>(null);

  const cx = RADIUS;
  const cy = RADIUS;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleSpinComplete = () => {
    if (targetKeyRef.current) {
      setKey(targetKeyRef.current.root, targetKeyRef.current.tonality);
    }
    setSpinning(false);
    targetKeyRef.current = null;
  };

  useEffect(() => {
    if (isSpinning && targetKeyRef.current) {
      const targetRoot = normalizeKey(targetKeyRef.current.root);
      const index = CIRCLE_OF_FIFTHS.indexOf(targetRoot);
      if (index === -1) { setSpinning(false); return; }

      const targetSlot = -(index * SEGMENT_ANGLE);
      const minSpins = 5 * 360;
      const current = totalRotation.current;
      let normalized = targetSlot % 360;
      if (normalized < 0) normalized += 360;
      const roughTarget = current + minSpins;
      const roughRemainder = roughTarget % 360;
      let diff = normalized - roughRemainder;
      if (diff < 0) diff += 360;
      const finalTarget = roughTarget + diff;
      totalRotation.current = finalTarget;

      rotation.value = withTiming(finalTarget, {
        duration: 4000,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(handleSpinComplete)();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  // Sync rotation when key changes externally (not spinning)
  useEffect(() => {
    if (!isSpinning) {
      const displayRoot = normalizeKey(currentKey.root);
      const index = CIRCLE_OF_FIFTHS.indexOf(displayRoot);
      if (index === -1) return;
      const targetSlot = -(index * SEGMENT_ANGLE);
      let normalized = targetSlot % 360;
      if (normalized < 0) normalized += 360;
      const current = totalRotation.current;
      const posRemainder = ((current % 360) + 360) % 360;
      let cleanDiff = normalized - posRemainder;
      if (cleanDiff > 180) cleanDiff -= 360;
      else if (cleanDiff < -180) cleanDiff += 360;
      const finalTarget = current + cleanDiff;
      if (Math.abs(finalTarget - current) > 0.5) {
        totalRotation.current = finalTarget;
        rotation.value = withTiming(finalTarget, { duration: 500, easing: Easing.out(Easing.quad) });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  const handleSpin = () => {
    if (isSpinning) return;
    targetKeyRef.current = getRandomKey();
    spin();
  };

  const handleSegmentPress = (note: Note) => {
    if (isSpinning) return;
    setKey(note, currentKey.tonality);
  };

  return (
    <View style={styles.container}>
      {/* Pointer */}
      <View style={styles.pointer} />

      {/* Wheel */}
      <Animated.View style={[{ width: SIZE, height: SIZE }, animatedStyle]}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {CIRCLE_OF_FIFTHS.map((note, i) => {
            const startAngle = i * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
            const endAngle = startAngle + SEGMENT_ANGLE;
            const midAngle = (startAngle + endAngle) / 2;
            const labelPos = polarToCartesian(cx, cy, RADIUS * 0.72, midAngle);
            const isActive = normalizeKey(currentKey.root) === note;
            const path = buildSegmentPath(cx, cy, RADIUS - 2, INNER_RADIUS, startAngle, endAngle);

            return (
              <G key={note} onPress={() => handleSegmentPress(note)}>
                <Path
                  d={path}
                  fill={isActive ? theme.colors.primary : i % 2 === 0 ? theme.colors.surface : theme.colors.surfaceHover}
                  stroke={theme.colors.border}
                  strokeWidth={1}
                />
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={13}
                  fontWeight="700"
                  fill={isActive ? '#fff' : theme.colors.text}
                >
                  {note}
                </SvgText>
              </G>
            );
          })}

          {/* Center button */}
          <Circle cx={cx} cy={cy} r={INNER_RADIUS - 4} fill={theme.colors.background} stroke={theme.colors.border} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {/* Spin button overlay on center */}
      <TouchableOpacity style={styles.spinButton} onPress={handleSpin} disabled={isSpinning}>
        {/* Text rendered outside SVG for better RN compatibility */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.text,
    position: 'absolute',
    top: -8,
    zIndex: 20,
  },
  spinButton: {
    position: 'absolute',
    width: (INNER_RADIUS - 4) * 2,
    height: (INNER_RADIUS - 4) * 2,
    borderRadius: INNER_RADIUS - 4,
  },
});
