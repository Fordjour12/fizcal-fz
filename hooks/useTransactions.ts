import { useState, useCallback, useEffect, useRef } from "react";
import useDB from "@/hooks/useDB";
import { useAuth } from "./useAuth";
import { eq, desc, and } from "drizzle-orm";
import { transactions, categories, type Transaction } from "@/db/schema";
import { TRANSACTION_CATEGORIES } from "@/components/TransactionsList";
import type { Ionicons } from "@expo/vector-icons";

export interface TransactionWithMeta extends Transaction {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	iconBackground: string;
	categoryName: string;
}

export interface UseTransactionsOptions {
	limit?: number;
	budgetId?: number | null;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
	const { limit, budgetId } = options;
	const [transactionsList, setTransactionsList] = useState<TransactionWithMeta[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const db = useDB();
	const { user } = useAuth();

	const dbRef = useRef(db);
	const userRef = useRef(user);

	useEffect(() => {
		dbRef.current = db;
		userRef.current = user;
	}, [db, user]);

	const fetchTransactions = useCallback(async () => {
		if (!userRef.current) {
			setError(new Error("No user logged in"));
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);

			// Build where conditions
			const whereConditions = [];
			if (budgetId !== undefined) {
				whereConditions.push(eq(transactions.budgetId, budgetId));
			}

			// Join with categories to get category information
			const query = dbRef.current
				.select({
					transactionId: transactions.transactionId,
					accountId: transactions.accountId,
					categoryId: transactions.categoryId,
					transactionDate: transactions.transactionDate,
					amount: transactions.amount,
					description: transactions.description,
					transactionType: transactions.transactionType,
					linkedTransactionId: transactions.linkedTransactionId,
					budgetId: transactions.budgetId,
					createdAt: transactions.createdAt,
					updatedAt: transactions.updatedAt,
					categoryName: categories.categoryName,
				})
				.from(transactions)
				.innerJoin(
					categories,
					eq(transactions.categoryId, categories.categoryId),
				)
				.where(and(...whereConditions))
				.orderBy(desc(transactions.transactionDate));

			// Apply limit if specified
			const result = limit ? await query.limit(limit) : await query;

			// Transform transactions with UI metadata
			const transactionsWithMeta = result.map((transaction) => {
				const category = TRANSACTION_CATEGORIES.find(
					(cat) =>
						cat.title.toLowerCase() === transaction.categoryName.toLowerCase(),
				);

				return {
					...transaction,
					icon: category?.icon || "cash-outline",
					iconColor: transaction.amount < 0 ? "#E85D75" : "#2DC653",
					iconBackground: transaction.amount < 0 ? "#4A2328" : "#1B4332",
					// Convert timestamps to Date objects
					transactionDate: new Date(transaction.transactionDate),
					createdAt: transaction.createdAt ? new Date(transaction.createdAt) : null,
					updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : null,
				};
			});

			setTransactionsList(transactionsWithMeta);
		} catch (err) {
			console.error("Error fetching transactions:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to fetch transactions"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [limit, budgetId]);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	const refresh = useCallback(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	const addTransaction = useCallback(
		async (
			newTransaction: Omit<
				Transaction,
				"transactionId" | "createdAt" | "updatedAt"
			>,
		) => {
			try {
				await dbRef.current.insert(transactions).values(newTransaction);
				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to add transaction");
			}
		},
		[fetchTransactions],
	);

	const updateTransaction = useCallback(
		async (
			transactionId: number,
			updates: Partial<Omit<Transaction, "transactionId" | "createdAt" | "updatedAt">>,
		) => {
			try {
				await dbRef.current
					.update(transactions)
					.set(updates)
					.where(eq(transactions.transactionId, transactionId));
				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to update transaction");
			}
		},
		[fetchTransactions],
	);

	const deleteTransaction = useCallback(
		async (transactionId: number) => {
			try {
				await dbRef.current
					.delete(transactions)
					.where(eq(transactions.transactionId, transactionId));
				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to delete transaction");
			}
		},
		[fetchTransactions],
	);

	return {
		transactions: transactionsList,
		isLoading,
		error,
		refresh,
		addTransaction,
		updateTransaction,
		deleteTransaction,
	};
}
