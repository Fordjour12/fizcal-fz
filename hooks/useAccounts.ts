import { accounts } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import useDB from "@/hooks/useDB";

export type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment";

export interface Account {
  accountId: number;
  userId: number;
  accountName: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  color?: string;
}

const DEFAULT_COLORS = {
  checking: "#4CAF50",
  savings: "#2196F3",
  credit_card: "#F44336",
  cash: "#FFC107",
  investment: "#9C27B0",
};

export function useAccounts() {
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const db = useDB();
  const { user } = useAuth();

  console.log({...user})

  const fetchAccounts = useCallback(async () => {
    if (!user) return;


    
    try {
      setIsLoading(true);
      const result = await db.select()
        .from(accounts)
        .where(eq(accounts.userId, user.userId))
        .orderBy(accounts.accountType, accounts.accountName);

      // Add colors to accounts based on their type
      const accountsWithColors = result.map(account => ({
        accountId: account.accountId,
        userId: account.userId,
        accountName: account.accountName,
        accountType: account.accountType as AccountType,
        balance: account.balance,
        currency: account.currency,
        color: DEFAULT_COLORS[account.accountType as AccountType] || "#757575"
      }));

      setAccountsList(accountsWithColors);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch accounts"));
    } finally {
      setIsLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const totalBalance = accountsList.reduce((sum, account) => sum + account.balance, 0);

  return {
    accounts: accountsList,
    isLoading,
    error,
    totalBalance,
    refresh: fetchAccounts
  };
}
