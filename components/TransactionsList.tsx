import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatCurrency } from "@/utils/currency";
import type { TransactionWithMeta } from "@/hooks/useTransactions";

export type TransactionType = "expense" | "income" | "transfer";

export type Transaction = TransactionWithMeta;

export const PAYMENT_METHODS: {
	id: string;
	title: string;
	icon: keyof typeof Ionicons.glyphMap;
}[] = [
	{
		id: "cash",
		title: "Cash",
		icon: "cash-outline",
	},
	{
		id: "card",
		title: "Credit Card",
		icon: "card-outline",
	},
	{
		id: "bank",
		title: "Bank Transfer",
		icon: "business-outline",
	},
];

export const TRANSACTION_CATEGORIES: {
	id: string;
	title: string;
	icon: keyof typeof Ionicons.glyphMap;
}[] = [
	{
		id: "1",
		title: "Food & Drinks",
		icon: "restaurant-outline",
	},
	{
		id: "2",
		title: "Shopping",
		icon: "cart-outline",
	},
	{
		id: "3",
		title: "Transport",
		icon: "car-outline",
	},
	{
		id: "4",
		title: "Entertainment",
		icon: "game-controller-outline",
	},
	{
		id: "5",
		title: "Health",
		icon: "fitness-outline",
	},
	{
		id: "6",
		title: "Income",
		icon: "cash-outline",
	},
];

interface TransactionItemProps {
	transaction: Transaction;
	onPress?: () => void;
}

function TransactionItem({ transaction, onPress }: TransactionItemProps) {
	const formattedDate = transaction.transactionDate.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	return (
		<Animated.View entering={FadeInDown.delay(300)}>
			<Pressable style={styles.transactionItem} onPress={onPress}>
				<View style={styles.transactionLeft}>
					<View
						style={[
							styles.iconContainer,
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
						<View style={styles.transactionDetails}>
							<Text style={styles.transactionCategory}>
								{transaction.categoryName}
							</Text>
							<Text style={styles.transactionDate}>
								{formattedDate}
							</Text>
						</View>
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
			</Pressable>
		</Animated.View>
	);
}

export interface NewTransaction {
	type: TransactionType;
	amount: number;
	categoryId: number;
	accountId: number;
	note?: string;
	budgetId?: number | null;
}

interface TransactionsListProps {
	transactions: Transaction[];
	onTransactionPress?: (transaction: Transaction) => void;
	onAddTransaction?: (transaction: NewTransaction) => void;
}

export function TransactionsList({
	transactions,
	onTransactionPress,
}: TransactionsListProps) {
	return (
		<View style={styles.container}>
			{transactions.map((transaction) => (
				<TransactionItem
					key={transaction.transactionId}
					transaction={transaction}
					onPress={() => onTransactionPress?.(transaction)}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 16,
	},
	transactionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#141414",
		borderRadius: 12,
	},
	transactionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconContainer: {
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
	transactionDetails: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	transactionCategory: {
		fontSize: 14,
		color: "#666",
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
});
