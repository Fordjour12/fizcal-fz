import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useMemo } from 'react';

function CreditCard() {
  const { width } = useWindowDimensions();
  const cardWidth = useMemo(() => Math.min(width * 0.85, 400), [width]);
  const cardHeight = useMemo(() => cardWidth * 0.63, [cardWidth]);

  return (
    <Animated.View
      entering={SlideInRight.delay(300)}
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardBalance}>$ 37,249.00</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLabel}>Family</Text>
            <Text style={styles.cardExpiry}>11/26</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function LandingContent() {
  return (
    <Animated.View entering={FadeIn} style={styles.content}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Manage{`\n`}your{`\n`}finances <Text style={styles.highlight}>simply</Text></Text>
        <Text style={styles.subtitle}>From easy money management, to{`\n`}travel perks and investments.</Text>
      </View>
      <CreditCard />
      <Link href="/(stack)" asChild>
        <Pressable style={styles.actionButton}>
          <BlurView intensity={80} tint="light" style={styles.buttonBackground}>
            <Text style={styles.buttonText}>→</Text>
          </BlurView>
        </Pressable>
      </Link>

    </Animated.View>
  );
}

const GridPattern = () => {
  return (
    <View style={styles.squareGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: i * 120 }]} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: i * 120 }]} />
      ))}
    </View>
  );
};

export default function LandingScreen() {
  return (
    <View style={styles.background}>
      <LinearGradient
        colors={['#0a0a0a', '#141414', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <GridPattern />
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            headerShown: false
          }} 
        />
        <LandingContent />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  squareGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 50,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 30,
    lineHeight: 65,
    textAlignVertical: 'center',
  },
  highlight: {
    color: '#9FE870',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
  },
  cardGradient: {
    flex: 1,
    padding: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  cardExpiry: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  actionButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  buttonBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
  }
});
