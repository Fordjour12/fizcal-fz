import { memo } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useRouter } from "expo-router";

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "savings",
    label: "Savings",
    icon: "wallet",
    route: "/savings",
    color: "#2E8B57", // Green
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "swap-horizontal",
    route: "/transactions",
    color: "#4169E1", // Royal Blue
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: "pie-chart",
    route: "/budgets",
    color: "#9370DB", // Purple
  },
  {
    id: "categories",
    label: "Categories",
    icon: "grid",
    route: "/categories",
    color: "#FF7F50", // Coral
  },
];

export const QuickNav = memo(function QuickNav() {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={() => router.push(`/(stack)${action.route}` as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
            <Ionicons name={action.icon} size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    alignItems: "center",
    marginRight: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
  },
});
