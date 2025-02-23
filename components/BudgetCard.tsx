import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { formatCurrency } from '@/utils/currency';

interface BudgetCardProps {
  amountLeft: number;
  amountSpent: number;
  categories: Array<{
    title: string;
    spent: number;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackground: string;
    progress: number;
  }>;
  onPressAllBudgets?: () => void;
}

function CircularProgress({ progress, size, strokeWidth, color }: { progress: number; size: number; strokeWidth: number; color: string }) {
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
      />
    </Svg>
  );
}

export function BudgetCard({ amountLeft, amountSpent, categories, onPressAllBudgets }: BudgetCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.budgetCard}>
      <View style={styles.budgetGradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Pressable onPress={onPressAllBudgets}>
            <Text style={styles.allBudgets}>All Budgets</Text>
          </Pressable>
        </View>

        <Text style={styles.budgetAmount}>
          {formatCurrency(amountLeft)}
          <Text style={styles.budgetLabel}>left</Text>
        </Text>
        <Text style={styles.budgetSpent}>
          -{formatCurrency(amountSpent)} spent this month
        </Text>
        
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        
        <View style={styles.budgetCategories}>
          {categories.map((category, index) => (
            <View key={index} style={styles.budgetCategory}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: category.iconBackground }]}>
                  <Ionicons name={category.icon} size={20} color={category.iconColor} />
                </View>
                <View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySpent}>
                    {formatCurrency(category.spent)} spent
                  </Text>
                </View>
              </View>
              <View style={styles.progressWrapper}>
                <CircularProgress
                  progress={category.progress}
                  size={36}
                  strokeWidth={4}
                  color={category.iconColor}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  allBudgets: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  budgetCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#141414',
  },
  budgetGradient: {
    padding: 16,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  budgetSpent: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2DC653',
    borderRadius: 2,
  },
  budgetCategories: {
    gap: 12,
  },
  budgetCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressWrapper: {
    width: 36,
    height: 36,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  categorySpent: {
    fontSize: 14,
    color: '#666',
  },
});
