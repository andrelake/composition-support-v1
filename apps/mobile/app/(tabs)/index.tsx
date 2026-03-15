import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouletteWheel } from '../../src/components/roulette/RouletteWheel';
import { SpinButton } from '../../src/components/roulette/SpinButton';
import { HarmonicFieldCard } from '../../src/components/dashboard/HarmonicFieldCard';
import { ScaleRefCard } from '../../src/components/dashboard/ScaleRefCard';
import { CadenceCard } from '../../src/components/dashboard/CadenceCard';
import { theme } from '../../src/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Roulette section */}
        <View style={styles.rouletteSection}>
          <RouletteWheel />
          <SpinButton />
        </View>

        {/* Dashboard cards */}
        <ScaleRefCard />
        <HarmonicFieldCard />
        <CadenceCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  rouletteSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
});
