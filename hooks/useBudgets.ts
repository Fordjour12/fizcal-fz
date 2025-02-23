import { budgets, type Budget, type InsertBudget } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState, useRef } from "react";
import useDB from "@/hooks/useDB";

// Extended type to include UI-specific fields
export interface BudgetWithMeta extends Budget {
  spent: number;
  icon?: string;
  color?: string;
}

export function useBudgets() {
  const [budgetsList, setBudgetsList] = useState<BudgetWithMeta[]>([]);
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

  const fetchBudgets = useCallback(async () => {
    if (!userRef.current) {
      setError(new Error('No user logged in'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await dbRef.current.select()
        .from(budgets)
        .where(eq(budgets.userId, userRef.current.userId))
        .orderBy(budgets.startDate);

      // Transform budgets with UI metadata
      const budgetsWithMeta = result.map(budget => ({
        ...budget,
        spent: 0, // TODO: Calculate from transactions
        icon: "calculator-outline",
        color: "#2EC654",
      }));

      setBudgetsList(budgetsWithMeta);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch budgets"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBudget = async (newBudget: InsertBudget) => {
    try {
      await db.insert(budgets).values(newBudget);
      await fetchBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create budget");
    }
  };

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

  const deleteBudget = async (budgetId: number) => {
    try {
      await db.delete(budgets)
        .where(eq(budgets.budgetId, budgetId));
      await fetchBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete budget");
    }
  };

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