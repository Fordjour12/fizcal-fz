import { AddRecordModal } from "@/components/AddRecordModal";
import { BudgetCard } from "@/components/BudgetCard";
import { formatCurrency } from "@/utils/currency";
import {
	type NewTransaction,
	TRANSACTION_CATEGORIES,
	TransactionsList,
} from "@/components/TransactionsList";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

/**
 * Props for the AccountItem component
 */
interface AccountItemProps {
	title: string;      // Account name
	type: string;       // Account type (e.g., "Savings", "Checking")
	amount: number;     // Current balance
	color: string;      // Color for the account indicator
}

/**
 * AccountItem Component
 * Displays a single account item in the accounts list
 * Shows account name, type, and current balance
 */
function AccountItem({ title, type, amount, color }: AccountItemProps) {
	return (
		<Animated.View entering={FadeInDown.delay(300)} style={styles.accountItem}>
			<View style={styles.accountLeft}>
				<View style={[styles.accountDot, { backgroundColor: color }]} />
				<View>
					<Text style={styles.accountTitle}>{title}</Text>
					<Text style={styles.accountType}>{type}</Text>
				</View>
			</View>
			<Text style={styles.accountAmount}>{formatCurrency(amount)}</Text>
		</Animated.View>
	);
}

/**
 * AddAccountCard Component
 * Displays a card to add a new account
 * Shown at the bottom of the accounts list
 */
function AddAccountCard() {
	return (
		<Animated.View entering={FadeInDown.delay(300)} style={styles.accountItem}>
			<View style={styles.accountLeft}>
				<View style={[styles.accountDot, { backgroundColor: "#2EC654" }]} />
				<View>
					<Text style={styles.accountTitle}>Add New Account</Text>
					<Text style={styles.accountType}>Get started with a new account</Text>
				</View>
			</View>
			<Ionicons name="add-circle-outline" size={24} color="#2EC654" />
		</Animated.View>
	);
}

/**
 * DashboardScreen Component
 * Main dashboard screen of the application
 * 
 * Features:
 * - Displays total balance with month-over-month growth
 * - Shows expandable list of accounts
 * - Displays budget overview with top spending categories
 * - Shows recent transactions
 * - Provides quick access to add new transactions
 */
export default function DashboardScreen() {
	// State for UI controls
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [isAccountsExpanded, setIsAccountsExpanded] = useState(false);

	// Fetch accounts data
	const {
		accounts,
		isLoading: accountsLoading,
		totalBalance,
		error: accountsError,
		refresh: refreshAccounts,
	} = useAccounts();

	// Fetch recent transactions (limit 5)
	const {
		transactions,
		isLoading: transactionsLoading,
		error: transactionsError,
		refresh: refreshTransactions,
		addTransaction,
	} = useTransactions(5);

	const accountsList = accounts || [];

	// Animation styles for the accounts dropdown
	const chevronStyle = useAnimatedStyle(() => ({
		transform: [
			{
				rotate: withSpring(isAccountsExpanded ? "180deg" : "0deg"),
			},
		],
	}));

	const dropdownStyle = useAnimatedStyle(() => ({
		maxHeight: withSpring(isAccountsExpanded ? 500 : 0),
		opacity: withTiming(isAccountsExpanded ? 1 : 0, { duration: 200 }),
	}));

	// TODO: Implement actual growth calculations
	const growth = 0;
	const growthPercentage = 0;

	// Navigation handler for transactions
	const handleTransactionPress = useCallback(() => {
		router.push("/(stack)/transactions");
	}, []);

	/**
	 * Handles adding a new transaction
	 * 1. Validates the transaction data
	 * 2. Determines the transaction type and amount
	 * 3. Creates the transaction in the database
	 * 4. Refreshes account balances
	 */
	const handleAddTransaction = useCallback(
		async (newTransaction: NewTransaction) => {
			try {
				// Find the selected category
				const category = TRANSACTION_CATEGORIES.find(
					(cat) => cat.id === newTransaction.category,
				);
				if (!category) throw new Error("Invalid category");

				// Get the first account (TODO: Allow selecting account)
				const account = accountsList[0];
				if (!account) throw new Error("No account available");

				// Create the transaction
				await addTransaction({
					accountId: account.accountId,
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
					budgetId: null,
				});

				setIsAddModalVisible(false); // Close modal after successful add
				refreshAccounts(); // Refresh account balances
			} catch (error) {
				console.error("Error adding transaction:", error);
				// Optionally show error to user
			}
		},
		[accountsList, addTransaction, refreshAccounts],
	);

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{/* Header Section */}
				<View style={styles.header}>
					<View style={styles.headerRow}>
						<View style={styles.headerLeft} />
						<View style={styles.headerRight}>
							<Pressable
								style={styles.iconButton}
								onPress={() => router.push("/(stack)/settings")}
							>
								<Ionicons name="settings-outline" size={24} color="#fff" />
							</Pressable>
						</View>
					</View>

					{/* Balance and Accounts Section */}
					<Pressable onPress={() => setIsAccountsExpanded(!isAccountsExpanded)}>
						<Animated.View
							entering={FadeInDown.delay(200)}
							style={[
								styles.balanceContainer,
								isAccountsExpanded && styles.balanceContainerExpanded,
							]}
						>
							{/* Total Balance Display */}
							<View style={styles.balanceHeader}>
								<Text style={styles.balance}>
									{formatCurrency(totalBalance)}
								</Text>
								<Animated.View style={[styles.chevron, chevronStyle]}>
									<Ionicons name="chevron-down" size={24} color="#fff" />
								</Animated.View>
							</View>

							{/* Growth Statistics */}
							<View style={styles.growthContainer}>
								<Text style={styles.growthAmount}>
									+{formatCurrency(growth)}
								</Text>
								<Text style={styles.growthPercentage}>
									{growthPercentage}% the last year
								</Text>
							</View>

							{/* Accounts List Header */}
							<View style={styles.accountsHeader}>
								<Text style={styles.accountsTitle}>Accounts</Text>
								<Pressable
									style={styles.viewAllButton}
									onPress={() => router.push("/accounts")}
								>
									<Text style={styles.viewAllText}>View All</Text>
									<Ionicons name="chevron-forward" size={16} color="#2DC653" />
								</Pressable>
							</View>

							{/* Accounts List Content */}
							{accountsLoading ? (
								<View style={styles.loadingContainer}>
									<Text style={styles.loadingText}>Loading accounts...</Text>
								</View>
							) : accountsError ? (
								<View style={styles.errorContainer}>
									<Ionicons
										name="alert-circle-outline"
										size={24}
										color="#ff4444"
									/>
									<Text style={styles.errorText}>{accountsError.message}</Text>
									<Pressable
										style={styles.retryButton}
										onPress={refreshAccounts}
									>
										<Text style={styles.retryText}>Retry</Text>
									</Pressable>
								</View>
							) : (
								<Animated.View style={[styles.accountsDropdown, dropdownStyle]}>
									{accountsList.length === 0 ? (
										<View style={styles.emptyContainer}>
											<Ionicons name="wallet-outline" size={24} color="#999" />
											<Text style={styles.emptyText}>No accounts found</Text>
											<Pressable
												style={styles.addAccountButton}
												onPress={() => router.push("/(stack)/accounts/new")}
											>
												<Text style={styles.addAccountText}>Add Account</Text>
											</Pressable>
										</View>
									) : (
										<>
											{accountsList.map((account) => (
												<Pressable
													key={account.accountId}
													onPress={() =>
														router.push(
															`/(stack)/accounts/${account.accountId}`,
														)
													}
												>
													<AccountItem
														title={account.accountName}
														type={account.accountType}
														amount={account.balance}
														color={account.color || "#757575"}
													/>
												</Pressable>
											))}
											<Pressable
												onPress={() => router.push("/(stack)/accounts/new")}
											>
												<AddAccountCard />
											</Pressable>
										</>
									)}
								</Animated.View>
							)}
						</Animated.View>
					</Pressable>
				</View>

				{/* Budget Overview Section */}
				<View style={styles.budgetSection}>
					<Pressable onPress={() => router.push("/(stack)/budgets/")}>
						<BudgetCard
							onPressAllBudgets={() => router.push("/(stack)/budgets/")}
						/>
					</Pressable>
				</View>

				{/* Recent Transactions Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Recent Transactions</Text>
						<Pressable
							style={styles.viewAllButton}
							onPress={handleTransactionPress}
						>
							<Text style={styles.viewAllText}>View All</Text>
							<Ionicons name="chevron-forward" size={16} color="#2DC653" />
						</Pressable>
					</View>
					{transactionsLoading ? (
						<View style={styles.loadingContainer}>
							<Text style={styles.loadingText}>Loading transactions...</Text>
						</View>
					) : transactionsError ? (
						<View style={styles.errorContainer}>
							<Ionicons name="alert-circle-outline" size={24} color="#ff4444" />
							<Text style={styles.errorText}>{transactionsError.message}</Text>
							<Pressable
								style={styles.retryButton}
								onPress={refreshTransactions}
							>
								<Text style={styles.retryText}>Retry</Text>
							</Pressable>
						</View>
					) : (
						<TransactionsList
							transactions={transactions}
							onTransactionPress={handleTransactionPress}
						/>
					)}
				</View>

				{/* Add Transaction FAB */}
				<Pressable
					style={styles.fab}
					onPress={() => setIsAddModalVisible(true)}
				>
					<Ionicons name="add" size={24} color="#fff" />
				</Pressable>

				{/* Add Transaction Modal */}
				<AddRecordModal
					visible={isAddModalVisible}
					onClose={() => setIsAddModalVisible(false)}
					onAdd={handleAddTransaction}
				/>
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
	header: {
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 40,
	},
	headerLeft: {
		flex: 1,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	iconButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255,255,255,0.1)",
		alignItems: "center",
		justifyContent: "center",
	},
	time: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	balanceContainer: {
		marginBottom: 40,
	},
	balance: {
		fontSize: 34,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 8,
	},
	growthContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	growthAmount: {
		color: "#34C759",
		fontSize: 16,
		fontWeight: "500",
	},
	growthPercentage: {
		color: "#666",
		fontSize: 16,
	},
	budgetSection: {
		paddingHorizontal: 20,
		marginBottom: 32,
	},
	sectionLink: {
		color: "#666",
		fontSize: 16,
	},
	section: {
		marginTop: 32,
		paddingHorizontal: 20,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	viewAllButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	viewAllText: {
		fontSize: 14,
		color: "#2DC653",
		fontWeight: "500",
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 20,
	},
	accountItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#222",
	},
	accountLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	accountDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	accountTitle: {
		fontSize: 17,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 4,
	},
	accountType: {
		fontSize: 15,
		color: "#666",
	},
	accountAmount: {
		fontSize: 17,
		fontWeight: "600",
		color: "#fff",
	},
	accountsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 24,
		marginBottom: 16,
	},
	accountsTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
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
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	loadingContainer: {
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		color: "#fff",
		textAlign: "center",
		fontSize: 16,
		marginTop: 8,
	},
	errorContainer: {
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	errorText: {
		color: "#ff4444",
		textAlign: "center",
		fontSize: 16,
		marginTop: 8,
	},
	retryButton: {
		marginTop: 12,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#2DC653",
		borderRadius: 8,
	},
	retryText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	emptyContainer: {
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		color: "#999",
		textAlign: "center",
		fontSize: 16,
		marginTop: 8,
	},
	addAccountButton: {
		marginTop: 12,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#2DC653",
		borderRadius: 8,
	},
	addAccountText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	balanceHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	chevron: {
		transform: [{ rotate: "0deg" }],
	},
	chevronExpanded: {
		transform: [{ rotate: "180deg" }],
	},
	balanceContainerExpanded: {
		backgroundColor: "rgba(255,255,255,0.05)",
		padding: 16,
		borderRadius: 16,
	},
	accountsDropdown: {
		marginTop: 16,
		overflow: "hidden",
	},
});
