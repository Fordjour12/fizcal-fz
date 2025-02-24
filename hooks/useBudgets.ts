import { budgets, type Budget, type InsertBudget, transactions, categories } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import { eq, and, between, sql } from "drizzle-orm";
import { useCallback, useEffect, useState, useRef } from "react";
import useDB from "@/hooks/useDB";
import { TRANSACTION_CATEGORIES } from "@/components/TransactionsList";

/**
 * Extended Budget type that includes UI-specific fields
 * Adds metadata for displaying budget information in the UI
 */
export interface BudgetWithMeta extends Budget {
  spent: number;          // Total amount spent for this budget
  icon?: string;          // Icon to represent the budget category
  color?: string;         // Color for UI elements (green for under budget, red for over)
  categoryName: string;   // Name of the associated category
}

/**
 * useBudgets Hook
 * Manages budget data and operations for the application
 * 
 * Features:
 * - Fetches budgets with their associated categories
 * - Calculates spending for each budget from transactions
 * - Provides CRUD operations for budgets
 * - Handles loading and error states
 * - Automatically refreshes data when needed
 * 
 * @returns {Object} Budget data and operations
 * @property {BudgetWithMeta[]} budgets - List of budgets with metadata
 * @property {boolean} isLoading - Loading state indicator
 * @property {Error | null} error - Error state
 * @property {Function} refresh - Function to refresh budget data
 * @property {Function} createBudget - Function to create a new budget
 * @property {Function} updateBudget - Function to update an existing budget
 * @property {Function} deleteBudget - Function to delete a budget
 */
export function useBudgets() {
  // State management
  const [budgetsList, setBudgetsList] = useState<BudgetWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Database and auth hooks
  const db = useDB();
  const { user } = useAuth();
  
  // Refs to prevent stale closures in callbacks
  const dbRef = useRef(db);
  const userRef = useRef(user);

  // Keep refs up to date
  useEffect(() => {
    dbRef.current = db;
    userRef.current = user;
  }, [db, user]);

  /**
   * Fetches budgets and calculates spending
   * 1. Gets all budgets with their categories
   * 2. Calculates spent amount for each budget from transactions
   * 3. Adds UI metadata (icons, colors) based on spending
   */
  const fetchBudgets = useCallback(async () => {
    if (!userRef.current) {
      setError(new Error('No user logged in'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First get all budgets with their categories
      const budgetsResult = await dbRef.current
        .select({
          budgetId: budgets.budgetId,
          userId: budgets.userId,
          categoryId: budgets.categoryId,
          budgetName: budgets.budgetName,
          budgetAmount: budgets.budgetAmount,
          periodType: budgets.periodType,
          startDate: budgets.startDate,
          endDate: budgets.endDate,
          rollover: budgets.rollover,
          createdAt: budgets.createdAt,
          updatedAt: budgets.updatedAt,
          categoryName: categories.categoryName,
        })
        .from(budgets)
        .innerJoin(categories, eq(budgets.categoryId, categories.categoryId))
        .where(eq(budgets.userId, userRef.current.userId))
        .orderBy(budgets.startDate);

      // For each budget, calculate the spent amount from transactions
      const budgetsWithSpending = await Promise.all(
        budgetsResult.map(async (budget) => {
          // Get all transactions for this budget's category within its date range
          const spentResult = await dbRef.current
            .select({
              totalSpent: sql<number>`sum(${transactions.amount})`,
            })
            .from(transactions)
            .where(
              and(
                eq(transactions.categoryId, budget.categoryId),
                between(transactions.transactionDate, budget.startDate, budget.endDate),
                eq(transactions.transactionType, "debit")
              )
            );

          const spent = Math.abs(spentResult[0]?.totalSpent || 0);

          // Find matching category for icon
          const category = TRANSACTION_CATEGORIES.find(
            (cat) => cat.title.toLowerCase() === budget.categoryName.toLowerCase()
          );

          // Return budget with UI metadata
          return {
            ...budget,
            spent,
            icon: category?.icon || "calculator-outline",
            color: spent >= budget.budgetAmount ? "#E85D75" : "#2DC653",
          };
        })
      );

      setBudgetsList(budgetsWithSpending);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch budgets"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Creates a new budget
   * @param newBudget - Budget data to create
   */
  const createBudget = async (newBudget: InsertBudget) => {
    try {
      await db.insert(budgets).values(newBudget);
      await fetchBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create budget");
    }
  };

  /**
   * Updates an existing budget
   * @param budgetId - ID of the budget to update
   * @param updates - Partial budget data to update
   */
  const updateBudget = async (budgetId: number, updates: Partial<InsertBudget>) => {
    try {
      await db.update(budgets)
        .set(updates)
        .where(eq(budgets.budgetId, budgetId));
      await fetchBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update budget");
    }
  };

  /**
   * Deletes a budget
   * @param budgetId - ID of the budget to delete
   */
  const deleteBudget = async (budgetId: number) => {
    try {
      await db.delete(budgets)
        .where(eq(budgets.budgetId, budgetId));
      await fetchBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete budget");
    }
  };

  // Fetch budgets on mount and when dependencies change
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets: budgetsList,
    isLoading,
    error,
    refresh: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
} 