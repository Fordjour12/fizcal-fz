import { useBudgets } from "@/hooks/useBudgets";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { BudgetWithMeta } from "@/hooks/useBudgets";

function BudgetCard({
	budgetId,
	budgetName,
	budgetAmount,
	spent,
	icon,
	color,
}: {
	budgetId: number;
	budgetName: string;
	budgetAmount: number;
	spent: number;
	icon?: string;
	color?: string;
}) {
	const progress = (spent / budgetAmount) * 100;
	const remaining = budgetAmount - spent;

	return (
		<Animated.View
			entering={FadeInDown.delay(200)}
			style={[styles.budgetCard, { borderLeftColor: color || "#757575" }]}
		>
			<Pressable
				style={styles.budgetCardContent}
				onPress={() => router.push(`/(stack)/budgets/${budgetId}`)}
			>
				<View style={styles.budgetHeader}>
					<View style={styles.budgetInfo}>
						<Ionicons
							name={icon as keyof typeof Ionicons.glyphMap}
							size={24}
							color={color || "#757575"}
						/>
						<Text style={styles.budgetName}>{budgetName}</Text>
					</View>
					<Ionicons name="chevron-forward" size={24} color="#666" />
				</View>

				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{
									width: `${Math.min(progress, 100)}%`,
									backgroundColor: color || "#757575",
								},
							]}
						/>
					</View>
					<View style={styles.budgetStats}>
						<Text style={styles.spentText}>Spent: {formatCurrency(spent)}</Text>
						<Text style={styles.remainingText}>
							Remaining: {formatCurrency(remaining)}
						</Text>
					</View>
				</View>
			</Pressable>
		</Animated.View>
	);
}

export default function BudgetsScreen() {
	const { budgets, isLoading, error, refresh } = useBudgets();

	const totalBudgeted = budgets.reduce(
		(sum, budget) => sum + budget.budgetAmount,
		0,
	);

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerStyle: { backgroundColor: "#000" },
					headerTintColor: "#fff",
					title: "Budgets",
					headerShadowVisible: false,
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/(stack)/budgets/new")}
							style={styles.headerButton}
						>
							<Ionicons name="add" size={24} color="#2EC654" />
						</Pressable>
					),
				}}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View style={styles.messageContainer}>
						<Text style={styles.messageText}>Loading budgets...</Text>
					</View>
				) : error ? (
					<View style={styles.messageContainer}>
						<Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
						<Text style={styles.errorText}>{error.message}</Text>
						<Pressable style={styles.retryButton} onPress={refresh}>
							<Text style={styles.retryText}>Retry</Text>
						</Pressable>
					</View>
				) : budgets.length === 0 ? (
					<View style={styles.messageContainer}>
						<Ionicons name="calculator-outline" size={48} color="#666" />
						<Text style={styles.messageText}>No budgets yet</Text>
						<Pressable
							style={styles.addButton}
							onPress={() => router.push("/(stack)/budgets/new")}
						>
							<Text style={styles.addButtonText}>Create Budget</Text>
						</Pressable>
					</View>
				) : (
					<>
						<View style={styles.totalSection}>
							<Text style={styles.totalLabel}>Total Budgeted</Text>
							<Text style={styles.totalAmount}>
								{formatCurrency(totalBudgeted)}
							</Text>
						</View>

						<View style={styles.budgetsList}>
							{budgets.map((budget) => (
								<BudgetCard
									key={budget.budgetId}
									budgetId={budget.budgetId}
									budgetName={budget.budgetName}
									budgetAmount={budget.budgetAmount}
									spent={budget.spent}
									icon={budget.icon}
									color={budget.color}
								/>
							))}
						</View>

						<Pressable
							style={styles.addBudgetCard}
							onPress={() => router.push("/(stack)/budgets/new")}
						>
							<Ionicons name="add-circle-outline" size={24} color="#2EC654" />
							<Text style={styles.addBudgetText}>Create New Budget</Text>
						</Pressable>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	headerButton: {
		marginRight: 8,
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	messageContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
		paddingVertical: 32,
	},
	messageText: {
		color: "#666",
		fontSize: 16,
		textAlign: "center",
	},
	errorText: {
		color: "#ff4444",
		fontSize: 16,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: "#2EC654",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	retryText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	totalSection: {
		marginBottom: 24,
	},
	totalLabel: {
		fontSize: 16,
		color: "#666",
		marginBottom: 8,
	},
	totalAmount: {
		fontSize: 34,
		fontWeight: "600",
		color: "#fff",
	},
	budgetsList: {
		gap: 16,
	},
	budgetCard: {
		backgroundColor: "#1A1A1A",
		borderRadius: 16,
		borderLeftWidth: 4,
		overflow: "hidden",
	},
	budgetCardContent: {
		padding: 16,
	},
	budgetHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	budgetInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	budgetName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
	},
	progressContainer: {
		gap: 8,
	},
	progressBar: {
		height: 8,
		backgroundColor: "#333",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 4,
	},
	budgetStats: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	spentText: {
		color: "#666",
		fontSize: 14,
	},
	remainingText: {
		color: "#666",
		fontSize: 14,
	},
	addButton: {
		backgroundColor: "#2EC654",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	addBudgetCard: {
		marginTop: 24,
		backgroundColor: "#1A1A1A",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	addBudgetText: {
		color: "#2EC654",
		fontSize: 16,
		fontWeight: "500",
	},
});
