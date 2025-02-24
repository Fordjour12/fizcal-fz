import { memo } from "react";
import { StyleSheet, View, FlatList,Text } from "react-native";
import { formatCurrency } from "@/utils/currency";

interface SavingsGoal {
  goalId: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
}

interface SavingsGoalsListProps {
  goals: SavingsGoal[];
  onGoalPress?: (goal: SavingsGoal) => void;
}

const SavingsGoalItem = memo(function SavingsGoalItem({
  goal,
  onPress,
}: {
  goal: SavingsGoal;
  onPress?: () => void;
}) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  
  return (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalName}>{goal.goalName}</Text>
        <Text style={styles.goalAmount}>
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      
      <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      
      {goal.targetDate && (
        <Text style={styles.targetDate}>
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
});

export const SavingsGoalsList = memo(function SavingsGoalsList({
  goals,
  onGoalPress,
}: SavingsGoalsListProps) {
  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No savings goals yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.goalId.toString()}
      renderItem={({ item }) => (
        <SavingsGoalItem
          goal={item}
          onPress={() => onGoalPress?.(item)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  goalItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: "600",
  },
  goalAmount: {
    fontSize: 16,
    color: "#888",
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2E8B57",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  targetDate: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
