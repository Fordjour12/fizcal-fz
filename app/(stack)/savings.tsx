import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View,Text  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { AddButton } from "@/components/AddButton";
import { SavingsGoalsList } from "@/components/savings/SavingsGoalsList";
import { AddSavingsGoalModal } from "@/components/savings/AddSavingsGoalModal";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useEffect } from "react";

export default function SavingsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const { goals, isLoading, fetchGoals, addGoal } = useSavingsGoals();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = useCallback(
    async (newGoal: {
      goalName: string;
      targetAmount: number;
      targetDate?: Date;
    }) => {
      try {
        await addGoal(newGoal);
        fetchGoals(); // Refresh the list after adding
      } catch (error) {
        console.error("Failed to add savings goal:", error);
        // TODO: Show error toast
      }
    },
    [addGoal, fetchGoals]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Savings Goals",
          headerRight: () => (
            <AddButton onPress={() => setIsAddModalVisible(true)} />
          ),
        }}
      />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E8B57" />
          </View>
        ) : (
          <SavingsGoalsList
            goals={goals}
            onGoalPress={(goal) => {
              // TODO: Implement goal details/edit screen
              console.log("Goal pressed:", goal);
            }}
          />
        )}
      </View>

      <AddSavingsGoalModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
