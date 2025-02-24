import {
	StyleSheet,
	View,
	Text,
	Pressable,
	Modal,
	TextInput,
	type ViewStyle,
	type TextStyle,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useState, useEffect } from "react";
import type { TransactionType, NewTransaction } from "./TransactionsList";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/utils/currency";

interface Styles {
	modalContainer: ViewStyle;
	modalHeader: ViewStyle;
	modalTitle: TextStyle;
	content: ViewStyle;
	tabs: ViewStyle;
	tab: ViewStyle;
	activeTab: ViewStyle;
	tabText: TextStyle;
	activeTabText: TextStyle;
	amountContainer: ViewStyle;
	currencySymbol: TextStyle;
	amountInput: TextStyle;
	section: ViewStyle;
	sectionTitle: TextStyle;
	budgetSelector: ViewStyle;
	budgetItem: ViewStyle;
	activeBudgetItem: ViewStyle;
	budgetInfo: ViewStyle;
	budgetName: TextStyle;
	budgetAmount: TextStyle;
	categoryGrid: ViewStyle;
	categoryItem: ViewStyle;
	activeCategoryItem: ViewStyle;
	categoryText: TextStyle;
	activeCategoryText: TextStyle;
	accountGrid: ViewStyle;
	accountItem: ViewStyle;
	activeAccountItem: ViewStyle;
	accountText: TextStyle;
	activeAccountText: TextStyle;
	accountIcon: ViewStyle;
	noteInput: TextStyle;
	addButton: ViewStyle;
	addButtonDisabled: ViewStyle;
	addButtonText: TextStyle;
	sectionHeader: ViewStyle;
	budgetHint: TextStyle;
	noBudgetText: TextStyle;
	overBudgetText: TextStyle;
}

interface AddRecordModalProps {
	visible: boolean;
	onClose: () => void;
	onAdd?: (transaction: NewTransaction) => void;
	initialTransaction?: NewTransaction;
}

export function AddRecordModal({
	visible,
	onClose,
	onAdd,
	initialTransaction,
}: AddRecordModalProps) {
	const [type, setType] = useState<TransactionType>("expense");
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [accountId, setAccountId] = useState<number | null>(null);
	const [note, setNote] = useState("");
	const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

	// Fetch budgets, categories, and accounts
	const { budgets } = useBudgets();
	const { categories, isLoading: isCategoriesLoading } = useCategories();
	const { accounts, isLoading: isAccountsLoading } = useAccounts();

	// Reset form when modal is opened
	useEffect(() => {
		if (visible) {
			if (initialTransaction) {
				setType(initialTransaction.type);
				setAmount(Math.abs(initialTransaction.amount).toString());
				setCategoryId(initialTransaction.categoryId);
				setAccountId(initialTransaction.accountId);
				setNote(initialTransaction.note || "");
				setSelectedBudgetId(null); // Reset budget selection
			} else {
				setType("expense");
				setAmount("");
				setCategoryId(null);
				setAccountId(null);
				setNote("");
				setSelectedBudgetId(null);
			}
		}
	}, [visible, initialTransaction]);

	const handleAdd = () => {
		if (!amount || !categoryId || !accountId) return;

		const newTransaction: NewTransaction = {
			type,
			amount: Number.parseFloat(amount),
			categoryId,
			accountId,
			note: note || undefined,
			budgetId: selectedBudgetId,
		};

		onAdd?.(newTransaction);
		onClose();
	};

	// Filter categories based on transaction type
	const filteredCategories = categories.filter((cat) =>
		type === "income" ? cat.isIncome : !cat.isIncome,
	);

	// Filter budgets based on selected category
	const availableBudgets = budgets.filter(
		(budget) => categoryId === budget.categoryId,
	);

	// Show budget selection hint
	const showBudgetHint =
		categoryId &&
		type === "expense" &&
		availableBudgets.length > 0 &&
		!selectedBudgetId;

	if (!visible) return null;

	return (
		<View style={StyleSheet.absoluteFill}>
			<Pressable
				style={[
					StyleSheet.absoluteFill,
					{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
				]}
				onPress={onClose}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={[StyleSheet.absoluteFill, { justifyContent: "flex-end" }]}
			>
				<Animated.View
					entering={FadeIn.duration(200)}
					style={styles.modalContainer}
				>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>
							{initialTransaction ? "Edit Transaction" : "Add Transaction"}
						</Text>
						<Pressable onPress={onClose}>
							<Ionicons name="close-outline" size={24} color="#fff" />
						</Pressable>
					</View>

					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.tabs}>
							<Pressable
								style={[styles.tab, type === "expense" && styles.activeTab]}
								onPress={() => {
									setType("expense");
									setCategoryId(null);
									setSelectedBudgetId(null);
								}}
							>
								<Text
									style={[
										styles.tabText,
										type === "expense" && styles.activeTabText,
									]}
								>
									Expense
								</Text>
							</Pressable>
							<Pressable
								style={[styles.tab, type === "income" && styles.activeTab]}
								onPress={() => {
									setType("income");
									setCategoryId(null);
									setSelectedBudgetId(null);
								}}
							>
								<Text
									style={[
										styles.tabText,
										type === "income" && styles.activeTabText,
									]}
								>
									Income
								</Text>
							</Pressable>
						</View>

						<View style={styles.amountContainer}>
							<Text style={styles.currencySymbol}>GH₵</Text>
							<TextInput
								style={styles.amountInput}
								value={amount}
								onChangeText={setAmount}
								keyboardType="decimal-pad"
								placeholder="0.00"
								placeholderTextColor="#666"
							/>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Category</Text>
							{isCategoriesLoading ? (
								<Text style={styles.noBudgetText}>Loading categories...</Text>
							) : filteredCategories.length > 0 ? (
								<View style={styles.categoryGrid}>
									{filteredCategories.map((cat) => (
										<Pressable
											key={cat.categoryId}
											style={[
												styles.categoryItem,
												categoryId === cat.categoryId &&
													styles.activeCategoryItem,
											]}
											onPress={() => {
												setCategoryId(cat.categoryId);
												setSelectedBudgetId(null); // Reset budget when category changes
											}}
										>
											<Text
												style={[
													styles.categoryText,
													categoryId === cat.categoryId &&
														styles.activeCategoryText,
												]}
											>
												{cat.categoryName}
											</Text>
										</Pressable>
									))}
								</View>
							) : (
								<Text style={styles.noBudgetText}>No categories found</Text>
							)}
						</View>

						{categoryId && type === "expense" && (
							<View style={styles.section}>
								<View style={styles.sectionHeader}>
									<Text style={styles.sectionTitle}>Budget</Text>
									{showBudgetHint && (
										<Text style={styles.budgetHint}>
											Select a budget to track this expense
										</Text>
									)}
								</View>
								{availableBudgets.length > 0 ? (
									<View style={styles.budgetSelector}>
										{availableBudgets.map((budget) => (
											<Pressable
												key={budget.budgetId}
												style={[
													styles.budgetItem,
													selectedBudgetId === budget.budgetId &&
														styles.activeBudgetItem,
												]}
												onPress={() => setSelectedBudgetId(budget.budgetId)}
											>
												<View style={styles.budgetInfo}>
													<Text style={styles.budgetName}>
														{budget.budgetName}
													</Text>
													<Text
														style={[
															styles.budgetAmount,
															budget.budgetAmount - budget.spent < 0 &&
																styles.overBudgetText,
														]}
													>
														{formatCurrency(budget.budgetAmount - budget.spent)}{" "}
														remaining
													</Text>
												</View>
												{selectedBudgetId === budget.budgetId && (
													<Ionicons
														name="checkmark-circle"
														size={24}
														color="#2DC653"
													/>
												)}
											</Pressable>
										))}
									</View>
								) : (
									<Text style={styles.noBudgetText}>
										No budgets found for this category
									</Text>
								)}
							</View>
						)}

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Account</Text>
							{isAccountsLoading ? (
								<Text style={styles.noBudgetText}>Loading accounts...</Text>
							) : accounts.length > 0 ? (
								<View style={styles.accountGrid}>
									{accounts.map((account) => (
										<Pressable
											key={account.accountId}
											style={[
												styles.accountItem,
												accountId === account.accountId &&
													styles.activeAccountItem,
											]}
											onPress={() => setAccountId(account.accountId)}
										>
											<View
												style={[
													styles.accountIcon,
													{ backgroundColor: account.color },
												]}
											>
												<Ionicons
													name={
														account.accountType === "cash"
															? "cash-outline"
															: account.accountType === "credit_card"
																? "card-outline"
																: account.accountType === "savings"
																	? "wallet-outline"
																	: "business-outline"
													}
													size={20}
													color={
														accountId === account.accountId ? "#2DC653" : "#666"
													}
												/>
											</View>
											<Text
												style={[
													styles.accountText,
													accountId === account.accountId &&
														styles.activeAccountText,
												]}
											>
												{account.accountName}
											</Text>
											<Text style={styles.accountText}>
												{formatCurrency(account.balance)}
											</Text>
										</Pressable>
									))}
								</View>
							) : (
								<Text style={styles.noBudgetText}>No accounts found</Text>
							)}
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Note</Text>
							<TextInput
								style={styles.noteInput}
								value={note}
								onChangeText={setNote}
								placeholder="Add a note"
								placeholderTextColor="#666"
							/>
						</View>

						<Pressable
							style={[
								styles.addButton,
								(!amount || !categoryId || !accountId) &&
									styles.addButtonDisabled,
							]}
							onPress={handleAdd}
							disabled={!amount || !categoryId || !accountId}
						>
							<Text style={styles.addButtonText}>
								{initialTransaction ? "Save Changes" : "Add Transaction"}
							</Text>
						</Pressable>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create<Styles>({
	modalContainer: {
		backgroundColor: "#141414",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 20,
		width: "100%",
		maxHeight: "90%",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 8,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#fff",
	},
	content: {
		flexGrow: 1,
	},
	tabs: {
		flexDirection: "row",
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		padding: 4,
		marginBottom: 20,
	},
	tab: {
		flex: 1,
		paddingVertical: 8,
		alignItems: "center",
		borderRadius: 8,
	},
	activeTab: {
		backgroundColor: "#2DC653",
	},
	tabText: {
		color: "#666",
		fontSize: 14,
		fontWeight: "500",
	},
	activeTabText: {
		color: "#fff",
	},
	amountContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		padding: 16,
	},
	currencySymbol: {
		fontSize: 32,
		fontWeight: "600",
		color: "#fff",
		marginRight: 8,
	},
	amountInput: {
		flex: 1,
		fontSize: 32,
		fontWeight: "600",
		color: "#fff",
		padding: 0,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 12,
	},
	budgetSelector: {
		gap: 8,
	},
	budgetItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		gap: 12,
	},
	activeBudgetItem: {
		backgroundColor: "#2A2A2A",
		borderColor: "#2DC653",
		borderWidth: 1,
	},
	budgetInfo: {
		flex: 1,
	},
	budgetName: {
		fontSize: 16,
		fontWeight: "500",
		color: "#fff",
		marginBottom: 4,
	},
	budgetAmount: {
		fontSize: 14,
		color: "#666",
	},
	categoryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		margin: -4,
	},
	categoryItem: {
		width: "33.33%",
		padding: 4,
	},
	activeCategoryItem: {
		backgroundColor: "#2A2A2A",
		borderRadius: 12,
		borderColor: "#2DC653",
		borderWidth: 1,
	},
	categoryText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		paddingVertical: 12,
		paddingHorizontal: 8,
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
	},
	activeCategoryText: {
		color: "#2DC653",
		backgroundColor: "transparent",
	},
	accountGrid: {
		gap: 8,
	},
	accountItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		gap: 12,
	},
	activeAccountItem: {
		backgroundColor: "#2A2A2A",
		borderColor: "#2DC653",
		borderWidth: 1,
	},
	accountText: {
		fontSize: 14,
		color: "#666",
		flex: 1,
	},
	activeAccountText: {
		color: "#2DC653",
	},
	accountIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		opacity: 0.2,
	},
	noteInput: {
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		padding: 12,
		color: "#fff",
		fontSize: 14,
	},
	addButton: {
		backgroundColor: "#2DC653",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		marginTop: 24,
		marginBottom: 24,
	},
	addButtonDisabled: {
		opacity: 0.5,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	budgetHint: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
	},
	noBudgetText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		backgroundColor: "#1A1A1A",
		padding: 16,
		borderRadius: 12,
	},
	overBudgetText: {
		color: "#E85D75",
	},
});
