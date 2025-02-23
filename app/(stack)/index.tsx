import { AddRecordModal } from "@/components/AddRecordModal";
import { BudgetCard } from "@/components/BudgetCard";
import { formatCurrency } from "@/utils/currency";
import {
	type NewTransaction,
	TODAY_TRANSACTIONS,
	TRANSACTION_CATEGORIES,
	type Transaction,
	TransactionsList,
} from "@/components/TransactionsList";
import { useAccounts } from "@/hooks/useAccounts";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface AccountItemProps {
	title: string;
	type: string;
	amount: number;
	color: string;
}

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
			<Text style={styles.accountAmount}>
				{formatCurrency(amount)}
			</Text>
		</Animated.View>
	);
}

export default function DashboardScreen() {
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [isAccountsExpanded, setIsAccountsExpanded] = useState(false);
	const { accounts, isLoading, totalBalance, error, refresh } = useAccounts();
	console.log('Dashboard state:', { isLoading, accounts, error });

	const accountsList = accounts || [];

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

	const [transactions, setTransactions] = useState<Transaction[]>(
		TODAY_TRANSACTIONS.slice(0, 5),
	);

	// Calculate month-over-month growth (this should be replaced with actual calculations later)
	const growth = 0;
	const growthPercentage = 0;

	const handleAddTransaction = (newTransaction: NewTransaction) => {
		const transaction: Transaction = {
			id: Date.now().toString(),
			type: newTransaction.type === "expense" ? "Expense" : "Income",
			amount: newTransaction.amount,
			category:
				TRANSACTION_CATEGORIES.find((cat) => cat.id === newTransaction.category)
					?.title || "",
			paymentMethod: newTransaction.paymentMethod,
			date: new Date()
				.toLocaleDateString("en-US", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})
				.toUpperCase(),
			icon:
				TRANSACTION_CATEGORIES.find((cat) => cat.id === newTransaction.category)
					?.icon || "cash-outline",
			iconColor: newTransaction.amount < 0 ? "#E85D75" : "#2DC653",
			iconBackground: newTransaction.amount < 0 ? "#4A2328" : "#1B4332",
		};

		setTransactions([transaction, ...transactions.slice(0, 4)]);
	};

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

					<Pressable onPress={() => setIsAccountsExpanded(!isAccountsExpanded)}>
						<Animated.View
							entering={FadeInDown.delay(200)}
							style={[
								styles.balanceContainer,
								isAccountsExpanded && styles.balanceContainerExpanded,
							]}
						>
							<View style={styles.balanceHeader}>
								<Text style={styles.balance}>
									{formatCurrency(totalBalance)}
								</Text>
								<Animated.View style={[styles.chevron, chevronStyle]}>
									<Ionicons name="chevron-down" size={24} color="#fff" />
								</Animated.View>
							</View>
							<View style={styles.growthContainer}>
								<Text style={styles.growthAmount}>
									+{formatCurrency(growth)}
								</Text>
								<Text style={styles.growthPercentage}>
									{growthPercentage}% the last year
								</Text>
							</View>
							{isLoading ? (
								<View style={styles.loadingContainer}>
									<Text style={styles.loadingText}>Loading accounts...</Text>
								</View>
							) : (
								<Animated.View style={[styles.accountsDropdown, dropdownStyle]}>
									{error ? (
										<View style={styles.errorContainer}>
											<Ionicons name="alert-circle-outline" size={24} color="#ff4444" />
											<Text style={styles.errorText}>{error.message}</Text>
											<Pressable style={styles.retryButton} onPress={refresh}>
												<Text style={styles.retryText}>Retry</Text>
											</Pressable>
										</View>
									) : accountsList.length === 0 ? (
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
										accountsList.map((account) => (
											<Pressable 
												key={account.accountId}
												onPress={() => router.push(`/(stack)/accounts/${account.accountId}`)}
											>
												<AccountItem
													title={account.accountName}
													type={account.accountType}
													amount={account.balance}
													color={account.color || "#757575"}
												/>
											</Pressable>
										))
									)}
								</Animated.View>
							)}
						</Animated.View>
					</Pressable>
				</View>

				<View style={styles.budgetSection}>
					<Pressable onPress={() => router.push("/(stack)/budgets")}>
						<BudgetCard
							amountLeft={14500.0}
							amountSpent={12450.3}
							categories={[
								{
									title: "Entertainment",
									spent: 3430,
									icon: "game-controller",
									iconColor: "#2DC653",
									iconBackground: "#1B4332",
									progress: 75,
								},
								{
									title: "Food",
									spent: 430,
									icon: "restaurant",
									iconColor: "#E85D75",
									iconBackground: "#4A2328",
									progress: 45,
								},
							]}
						/>
					</Pressable>
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Recent Transactions</Text>
						<Pressable
							style={styles.viewAllButton}
							onPress={() => router.push("/(stack)/transactions")}
						>
							<Text style={styles.viewAllText}>View All</Text>
							<Ionicons name="chevron-forward" size={16} color="#2DC653" />
						</Pressable>
					</View>
					<TransactionsList
						transactions={transactions}
						onTransactionPress={() => router.push("/(stack)/transactions")}
					/>
				</View>

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
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingText: {
		color: "#fff",
		textAlign: "center",
		fontSize: 16,
		marginTop: 8,
	},
	errorContainer: {
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
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
		backgroundColor: '#2DC653',
		borderRadius: 8,
	},
	retryText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
	emptyContainer: {
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
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
		backgroundColor: '#2DC653',
		borderRadius: 8,
	},
	addAccountText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
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
	headerLeft: {
		flex: 1,
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

	accountsSection: {
		paddingHorizontal: 20,
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
});
