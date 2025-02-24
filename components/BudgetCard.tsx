import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { formatCurrency } from '@/utils/currency';
import { useBudgets } from '@/hooks/useBudgets';

interface BudgetCardProps {
  onPressAllBudgets?: () => void;
}

/**
 * CircularProgress Component
 * Renders a circular progress indicator using SVG
 * 
 * @param progress - The percentage of progress (0-100)
 * @param size - The diameter of the circle in pixels
 * @param strokeWidth - The width of the progress line
 * @param color - The color of the progress line
 */
function CircularProgress({ progress, size, strokeWidth, color }: { progress: number; size: number; strokeWidth: number; color: string }) {
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Background circle */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress circle */}
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

/**
 * BudgetCard Component
 * Displays a summary of the user's budgets on the dashboard
 * Shows total budget remaining, total spent, and top 2 budgets by percentage spent
 * 
 * Features:
 * - Displays total amount left across all budgets
 * - Shows total amount spent this month
 * - Progress bar for overall budget usage
 * - Lists top 2 budgets with highest spending percentage
 * - Each budget shows name, amount spent, category icon, and progress
 * - Color coding (red when over budget, green otherwise)
 * 
 * @param onPressAllBudgets - Callback function when "All Budgets" is pressed
 */
export function BudgetCard({ onPressAllBudgets }: BudgetCardProps) {
  // Fetch budget data using the useBudgets hook
  const { budgets, isLoading, error } = useBudgets();

  // Loading state
  if (isLoading) {
    return (
      <Animated.View entering={FadeInDown.delay(200)} style={styles.budgetCard}>
        <View style={styles.budgetGradient}>
          <View style={styles.header}>
            <Text style={styles.title}>Budget</Text>
          </View>
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </Animated.View>
    );
  }

  // Error state
  if (error) {
    return (
      <Animated.View entering={FadeInDown.delay(200)} style={styles.budgetCard}>
        <View style={styles.budgetGradient}>
          <View style={styles.header}>
            <Text style={styles.title}>Budget</Text>
          </View>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      </Animated.View>
    );
  }

  // Calculate total budget metrics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const amountLeft = totalBudget - totalSpent;

  // Get top 2 budgets by percentage spent
  const topBudgets = [...budgets]
    .sort((a, b) => (b.spent / b.budgetAmount) - (a.spent / a.budgetAmount))
    .slice(0, 2)
    .map(budget => ({
      budgetId: budget.budgetId,
      title: budget.budgetName,
      spent: budget.spent,
      icon: (budget.icon || "calculator-outline") as keyof typeof Ionicons.glyphMap,
      iconColor: budget.color || "#2DC653",
      iconBackground: budget.color === "#E85D75" ? "#4A2328" : "#1B4332",
      progress: Math.min((budget.spent / budget.budgetAmount) * 100, 100),
    }));

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.budgetCard}>
      <View style={styles.budgetGradient}>
        {/* Header with title and "All Budgets" link */}
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Pressable onPress={onPressAllBudgets}>
            <Text style={styles.allBudgets}>All Budgets</Text>
          </Pressable>
        </View>

        {/* Total amount remaining */}
        <Text style={styles.budgetAmount}>
          {formatCurrency(amountLeft)}
          <Text style={styles.budgetLabel}>left</Text>
        </Text>

        {/* Total amount spent */}
        <Text style={styles.budgetSpent}>
          -{formatCurrency(totalSpent)} spent this month
        </Text>
        
        {/* Overall progress bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }
            ]} 
          />
        </View>
        
        {/* Top budgets list */}
        <View style={styles.budgetCategories}>
          {topBudgets.map((category) => (
            <View key={category.budgetId} style={styles.budgetCategory}>
              {/* Budget category info */}
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
              {/* Circular progress indicator */}
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
  loadingText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: '#E85D75',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
});
