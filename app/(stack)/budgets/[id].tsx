import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AddRecordModal } from "@/components/AddRecordModal";
import { formatCurrency } from "@/utils/currency";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import type { TransactionWithMeta } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { TRANSACTION_CATEGORIES } from "@/components/TransactionsList";
import type { NewTransaction } from "@/components/TransactionsList";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Props for the Transaction component
 */
interface TransactionProps {
	transaction: TransactionWithMeta;
	onPress?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

/**
 * Transaction component displays a single transaction item
 * Shows the transaction icon, category, date, and amount
 * Includes options to edit or delete the transaction
 */
function Transaction({ transaction, onPress, onEdit, onDelete }: TransactionProps) {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<Animated.View entering={FadeInDown}>
			<Pressable 
				style={styles.transactionContainer} 
				onPress={onPress}
				onLongPress={() => setShowOptions(true)}
			>
				<View style={[styles.iconContainer, { backgroundColor: transaction.iconBackground }]}>
					<Ionicons name={transaction.icon} size={24} color={transaction.iconColor} />
				</View>
				<View style={styles.transactionDetails}>
					<Text style={styles.transactionDescription}>
						{transaction.description || transaction.categoryName}
					</Text>
					<Text style={styles.transactionDate}>
						{format(transaction.transactionDate, "MMM d, yyyy")}
					</Text>
				</View>
				<Text
					style={[
						styles.transactionAmount,
						{ color: transaction.amount < 0 ? "#E85D75" : "#2DC653" },
					]}
				>
					{formatCurrency(transaction.amount)}
				</Text>
			</Pressable>
			{showOptions && (
				<View style={styles.optionsContainer}>
					<Pressable 
						style={styles.optionButton} 
						onPress={() => {
							setShowOptions(false);
							onEdit?.();
						}}
					>
						<Ionicons name="pencil" size={20} color="#2DC653" />
						<Text style={styles.optionText}>Edit</Text>
					</Pressable>
					<Pressable 
						style={styles.optionButton} 
						onPress={() => {
							setShowOptions(false);
							onDelete?.();
						}}
					>
						<Ionicons name="trash" size={20} color="#E85D75" />
						<Text style={[styles.optionText, { color: "#E85D75" }]}>Delete</Text>
					</Pressable>
					<Pressable 
						style={styles.optionButton} 
						onPress={() => setShowOptions(false)}
					>
						<Ionicons name="close" size={20} color="#666" />
						<Text style={[styles.optionText, { color: "#666" }]}>Cancel</Text>
					</Pressable>
				</View>
			)}
		</Animated.View>
	);
}

/**
 * BudgetDetailsScreen displays detailed information about a specific budget
 * Shows budget progress, remaining amount, and related transactions
 * Allows adding, editing, and deleting transactions
 */
export default function BudgetDetailsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<TransactionWithMeta | null>(null);

	// Fetch budget and transaction data
	const { budgets, isLoading: isLoadingBudgets } = useBudgets();
	const { 
		transactions, 
		isLoading: isLoadingTransactions,
		addTransaction,
		updateTransaction,
		deleteTransaction,
	} = useTransactions({
		budgetId: id ? Number(id) : null,
	});

	// Find the current budget
	const budget = budgets.find((b) => b.budgetId === Number(id));

	// Calculate progress
	const progress = budget ? (budget.spent / budget.budgetAmount) * 100 : 0;
	const remaining = budget ? budget.budgetAmount - budget.spent : 0;

	const handleAddTransaction = async (newTransaction: NewTransaction) => {
		try {
			// Find the selected category
			const category = TRANSACTION_CATEGORIES.find(
				(cat) => cat.id === newTransaction.category,
			);
			if (!category) throw new Error("Invalid category");

			if (editingTransaction) {
				// Update existing transaction
				await updateTransaction(editingTransaction.transactionId, {
					categoryId: Number.parseInt(category.id),
					amount:
						newTransaction.type === "expense"
							? -Math.abs(newTransaction.amount)
							: Math.abs(newTransaction.amount),
					description: newTransaction.note || "",
					transactionType:
						newTransaction.type === "expense" ? "debit" : "credit",
				});
			} else {
				// Create new transaction
				await addTransaction({
					accountId: 1, // TODO: Allow selecting account
					categoryId: Number.parseInt(category.id),
					amount:
						newTransaction.type === "expense"
							? -Math.abs(newTransaction.amount)
							: Math.abs(newTransaction.amount),
					description: newTransaction.note || "",
					transactionDate: new Date(),
					transactionType:
						newTransaction.type === "expense" ? "debit" : "credit",
					linkedTransactionId: null,
					budgetId: id ? Number(id) : null,
				});
			}

			setIsAddModalVisible(false);
			setEditingTransaction(null);
		} catch (error) {
			console.error("Error with transaction:", error);
			Alert.alert("Error", `Failed to ${editingTransaction ? "update" : "add"} transaction`);
		}
	};

	const handleEditTransaction = async (transaction: TransactionWithMeta) => {
		setEditingTransaction(transaction);
		setIsAddModalVisible(true);
	};

	const handleDeleteTransaction = async (transaction: TransactionWithMeta) => {
		Alert.alert(
			"Delete Transaction",
			"Are you sure you want to delete this transaction?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteTransaction(transaction.transactionId);
						} catch (error) {
							console.error("Error deleting transaction:", error);
							Alert.alert("Error", "Failed to delete transaction");
						}
					},
				},
			],
		);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
			<Stack.Screen
				options={{
					title: budget?.budgetName || "Budget Details",
					headerTintColor: "#2DC653",
					headerStyle: { backgroundColor: "#000" },
					headerRight: () => (
						<Pressable
							onPress={() => {
								setEditingTransaction(null);
								setIsAddModalVisible(true);
							}}
							style={({ pressed }) => ({
								opacity: pressed ? 0.5 : 1,
							})}
						>
							<Ionicons name="add-circle-outline" size={24} color="#2DC653" />
						</Pressable>
					),
				}}
			/>

			<ScrollView style={styles.container}>
				{/* Budget Progress Section */}
				<View style={styles.progressContainer}>
					<View style={styles.progressHeader}>
						<Text style={styles.progressTitle}>Budget Progress</Text>
						<Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
					</View>
					<View style={styles.progressBarContainer}>
						<View
							style={[
								styles.progressBar,
								{
									width: `${Math.min(progress, 100)}%`,
									backgroundColor: progress > 100 ? "#E85D75" : "#2DC653",
								},
							]}
						/>
					</View>
					<View style={styles.amountContainer}>
						<View>
							<Text style={styles.amountLabel}>Spent</Text>
							<Text style={styles.amountValue}>
								{budget ? formatCurrency(budget.spent) : "-"}
							</Text>
						</View>
						<View>
							<Text style={styles.amountLabel}>Remaining</Text>
							<Text
								style={[
									styles.amountValue,
									{ color: remaining < 0 ? "#E85D75" : "#2DC653" },
								]}
							>
								{formatCurrency(remaining)}
							</Text>
						</View>
					</View>
				</View>

				{/* Transactions Section */}
				<View style={styles.transactionsContainer}>
					<Text style={styles.sectionTitle}>Transactions</Text>
					{isLoadingTransactions ? (
						<Text style={styles.loadingText}>Loading transactions...</Text>
					) : transactions.length > 0 ? (
						transactions.map((transaction) => (
							<Transaction
								key={transaction.transactionId}
								transaction={transaction}
								onEdit={() => handleEditTransaction(transaction)}
								onDelete={() => handleDeleteTransaction(transaction)}
							/>
						))
					) : (
						<Text style={styles.emptyText}>No transactions found</Text>
					)}
				</View>
			</ScrollView>

			{/* Add/Edit Transaction Modal */}
			<AddRecordModal
				visible={isAddModalVisible}
				onClose={() => {
					setIsAddModalVisible(false);
					setEditingTransaction(null);
				}}
				onAdd={handleAddTransaction}
				initialTransaction={editingTransaction ? {
					type: editingTransaction.transactionType === "debit" ? "expense" : "income",
					amount: Math.abs(editingTransaction.amount),
					category: editingTransaction.categoryId.toString(),
					paymentMethod: "cash", // TODO: Add payment method to transaction schema
					note: editingTransaction.description || undefined,
				} : undefined}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	progressContainer: {
		padding: 16,
		backgroundColor: "#141414",
		borderRadius: 12,
		margin: 16,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	progressTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
	},
	progressPercentage: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666",
	},
	progressBarContainer: {
		height: 8,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressBar: {
		height: "100%",
		borderRadius: 4,
	},
	amountContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16,
	},
	amountLabel: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	amountValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#fff",
	},
	transactionsContainer: {
		padding: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 16,
	},
	transactionContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#141414",
		padding: 12,
		borderRadius: 12,
		marginBottom: 8,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	transactionDetails: {
		flex: 1,
	},
	transactionDescription: {
		fontSize: 16,
		fontWeight: "500",
		color: "#fff",
		marginBottom: 4,
	},
	transactionDate: {
		fontSize: 14,
		color: "#666",
	},
	transactionAmount: {
		fontSize: 16,
		fontWeight: "600",
	},
	loadingText: {
		textAlign: "center",
		color: "#666",
		marginTop: 16,
	},
	emptyText: {
		textAlign: "center",
		color: "#666",
		marginTop: 16,
	},
	optionsContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 16,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#141414",
		marginTop: -8,
		marginBottom: 8,
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	optionButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	optionText: {
		fontSize: 14,
		color: "#2DC653",
	},
});
