import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { AddRecordModal } from "@/components/AddRecordModal";
import {
	TRANSACTION_CATEGORIES,
	type NewTransaction,
} from "@/components/TransactionsList";
import { formatCurrency } from "@/utils/currency";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);

	// Fetch accounts and transactions
	const { accounts, refresh: refreshAccounts } = useAccounts();
	const { 
		transactions, 
		isLoading,
		addTransaction,
	} = useTransactions({ limit: 50 });

	// Calculate totals
	const totalIncome = transactions
		.filter(t => t.amount > 0)
		.reduce((sum, t) => sum + t.amount, 0);
	const totalExpenses = transactions
		.filter(t => t.amount < 0)
		.reduce((sum, t) => sum + Math.abs(t.amount), 0);

	const handleAddTransaction = async (newTransaction: NewTransaction) => {
		try {
			// Create the transaction
			await addTransaction({
				accountId: newTransaction.accountId,
				categoryId: newTransaction.categoryId,
				amount:
					newTransaction.type === "expense"
						? -Math.abs(newTransaction.amount)
						: Math.abs(newTransaction.amount),
				description: newTransaction.note || "",
				transactionDate: new Date(),
				transactionType:
					newTransaction.type === "expense" ? "debit" : "credit",
				linkedTransactionId: null,
				budgetId: newTransaction.budgetId || null,
			});

			setIsAddModalVisible(false);
			refreshAccounts();
		} catch (error) {
			console.error("Error adding transaction:", error);
			Alert.alert("Error", "Failed to add transaction");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerStyle: {
						backgroundColor: "#000",
					},
					headerTitleStyle: {
						color: "#fff",
						fontSize: 20,
						fontWeight: "600",
					},
					headerRight: () => (
						<Pressable
							style={[styles.headerButton, { backgroundColor: "#1B4332" }]}
							onPress={() => setIsAddModalVisible(true)}
						>
							<Ionicons name="add-outline" size={24} color="#2DC653" />
						</Pressable>
					),
				}}
			/>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.balanceLabel}>Total Balance</Text>
					<Pressable style={styles.balanceButton}>
						<Text style={styles.balanceAmount}>
							{formatCurrency(totalIncome - totalExpenses)}
						</Text>
						<Ionicons name="chevron-down-outline" size={20} color="#666" />
					</Pressable>
				</View>

				<View style={styles.quickStats}>
					<View style={styles.statItem}>
						<Text style={styles.statLabel}>Income</Text>
						<Text style={[styles.statAmount, { color: "#2DC653" }]}>
							+{formatCurrency(totalIncome)}
						</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statLabel}>Expenses</Text>
						<Text style={[styles.statAmount, { color: "#E85D75" }]}>
							-{formatCurrency(totalExpenses)}
						</Text>
					</View>
				</View>

				<View style={styles.transactionsList}>
					<Text style={styles.sectionTitle}>Recent Transactions</Text>
					{isLoading ? (
						<Text style={styles.loadingText}>Loading transactions...</Text>
					) : transactions.length > 0 ? (
						transactions.map((transaction) => (
							<View key={transaction.transactionId} style={styles.transactionItem}>
								<View style={styles.transactionLeft}>
									<View
										style={[
											styles.transactionIcon,
											{ backgroundColor: transaction.iconBackground },
										]}
									>
										<Ionicons
											name={transaction.icon}
											size={20}
											color={transaction.iconColor}
										/>
									</View>
									<View>
										<Text style={styles.transactionTitle}>
											{transaction.description || transaction.categoryName}
										</Text>
										<Text style={styles.transactionDate}>
											{transaction.transactionDate.toLocaleDateString()}
										</Text>
									</View>
								</View>
								<Text
									style={[
										styles.transactionAmount,
										transaction.amount < 0 ? styles.expenseText : styles.incomeText,
									]}
								>
									{formatCurrency(transaction.amount)}
								</Text>
							</View>
						))
					) : (
						<Text style={styles.emptyText}>No transactions found</Text>
					)}
				</View>
			</ScrollView>

			<Pressable
				style={styles.fab}
				onPress={() => setIsAddModalVisible(true)}
			>
				<Ionicons name="add" size={24} color="#fff" />
			</Pressable>

			<AddRecordModal
				visible={isAddModalVisible}
				onClose={() => setIsAddModalVisible(false)}
				onAdd={handleAddTransaction}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	fab: {
		position: "absolute",
		bottom: 32,
		right: 32,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#2DC653",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 8,
		zIndex: 999,
	},
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	header: {
		marginTop: 20,
		marginBottom: 24,
	},
	balanceLabel: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	balanceButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	balanceAmount: {
		fontSize: 34,
		fontWeight: "600",
		color: "#fff",
	},
	quickStats: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 32,
	},
	statItem: {
		flex: 1,
		padding: 16,
		backgroundColor: "#141414",
		borderRadius: 12,
	},
	statLabel: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	statAmount: {
		fontSize: 20,
		fontWeight: "600",
	},
	transactionsList: {
		flex: 1,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "500",
		color: "#666",
		marginBottom: 16,
	},
	transactionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#141414",
		borderRadius: 12,
		marginBottom: 8,
	},
	transactionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	transactionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	transactionTitle: {
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
	expenseText: {
		color: "#E85D75",
	},
	incomeText: {
		color: "#2DC653",
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
});
