import { useState, useCallback, useEffect, useRef } from "react";
import useDB from "@/hooks/useDB";
import { useAuth } from "./useAuth";
import { eq, desc, and } from "drizzle-orm";
import { transactions, categories, type Transaction } from "@/db/schema";
import { TRANSACTION_CATEGORIES } from "@/components/TransactionsList";
import type { Ionicons } from "@expo/vector-icons";
import { useAccounts } from "./useAccounts";

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
	const { updateBalance } = useAccounts();

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
				// Start a transaction to ensure both operations succeed or fail together
				await dbRef.current.transaction(async (tx) => {
					// Insert the transaction
					await tx.insert(transactions).values(newTransaction);
					
					// For expenses (debit), we need to subtract from the account balance
					// For income (credit), we add to the account balance
					const balanceChange = newTransaction.transactionType === "debit" 
						? -Math.abs(newTransaction.amount)  // Make sure it's negative for expenses
						: Math.abs(newTransaction.amount);  // Make sure it's positive for income

					// Update the account balance
					await updateBalance(
						newTransaction.accountId,
						balanceChange
					);
				});

				// Refresh the transactions list
				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to add transaction");
			}
		},
		[fetchTransactions, updateBalance],
	);

	const updateTransaction = useCallback(
		async (
			transactionId: number,
			updates: Partial<Omit<Transaction, "transactionId" | "createdAt" | "updatedAt">>,
		) => {
			try {
				// Get the original transaction
				const originalTransaction = transactionsList.find(
					t => t.transactionId === transactionId
				);
				if (!originalTransaction) throw new Error("Transaction not found");

				await dbRef.current.transaction(async (tx) => {
					// Update the transaction
					await tx
						.update(transactions)
						.set(updates)
						.where(eq(transactions.transactionId, transactionId));

					// If amount, account, or transaction type changed, update account balances
					if (updates.amount !== undefined || updates.accountId !== undefined || updates.transactionType !== undefined) {
						// First, reverse the original transaction's effect
						const originalBalanceChange = originalTransaction.transactionType === "debit"
							? Math.abs(originalTransaction.amount)  // Add back the amount for expenses
							: -Math.abs(originalTransaction.amount); // Subtract the amount for income

						await updateBalance(
							originalTransaction.accountId,
							originalBalanceChange
						);

						// Then apply the new transaction's effect
						const newBalanceChange = (updates.transactionType || originalTransaction.transactionType) === "debit"
							? -Math.abs(updates.amount || originalTransaction.amount)
							: Math.abs(updates.amount || originalTransaction.amount);

						await updateBalance(
							updates.accountId || originalTransaction.accountId,
							newBalanceChange
						);
					}
				});

				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to update transaction");
			}
		},
		[fetchTransactions, updateBalance, transactionsList],
	);

	const deleteTransaction = useCallback(
		async (transactionId: number) => {
			try {
				// Get the transaction to be deleted
				const transaction = transactionsList.find(
					t => t.transactionId === transactionId
				);
				if (!transaction) throw new Error("Transaction not found");

				await dbRef.current.transaction(async (tx) => {
					// Delete the transaction
					await tx
						.delete(transactions)
						.where(eq(transactions.transactionId, transactionId));

					// Reverse the transaction's effect on the account balance
					const balanceChange = transaction.transactionType === "debit"
						? Math.abs(transaction.amount)  // Add back the amount for expenses
						: -Math.abs(transaction.amount); // Subtract the amount for income

					await updateBalance(
						transaction.accountId,
						balanceChange
					);
				});

				await fetchTransactions();
			} catch (err) {
				throw err instanceof Error
					? err
					: new Error("Failed to delete transaction");
			}
		},
		[fetchTransactions, updateBalance, transactionsList],
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
