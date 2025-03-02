import { accounts } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState, useRef } from "react";
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
  const [totalBalance, setTotalBalance] = useState(0);
  
  const db = useDB();
  const { user } = useAuth();
  
  // Use refs to avoid dependency changes
  const dbRef = useRef(db);
  const userRef = useRef(user);

  // Update refs when values change
  useEffect(() => {
    dbRef.current = db;
    userRef.current = user;
  }, [db, user]);

  const fetchAccounts = useCallback(async () => {
    console.log('Fetching accounts...', { user: userRef.current });
    
    if (!userRef.current) {
      console.log('No user found');
      setError(new Error('No user logged in'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Querying database for user:', userRef.current.userId);
      const result = await dbRef.current.select()
        .from(accounts)
        .where(eq(accounts.userId, userRef.current.userId))
        .orderBy(accounts.accountType, accounts.accountName);

      console.log('Query result:', result);

      const accountsWithColors = result.map(account => ({
        accountId: account.accountId,
        userId: account.userId,
        accountName: account.accountName,
        accountType: account.accountType as AccountType,
        balance: account.balance,
        currency: account.currency,
        color: DEFAULT_COLORS[account.accountType as AccountType] || "#757575"
      }));

      console.log('Processed accounts:', accountsWithColors);
      setAccountsList(accountsWithColors);
      setTotalBalance(accountsWithColors.reduce((sum, account) => sum + account.balance, 0));
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err : new Error("Failed to fetch accounts"));
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependencies since we're using refs

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const updateBalance = useCallback(async (accountId: number, amount: number) => {
    try {
      // Get current account
      const account = accountsList.find(acc => acc.accountId === accountId);
      if (!account) throw new Error("Account not found");

      // Calculate new balance
      const newBalance = account.balance + amount;

      // Update account balance in database
      await dbRef.current
        .update(accounts)
        .set({ balance: newBalance })
        .where(eq(accounts.accountId, accountId));

      // Update local state with optimistic update
      setAccountsList(prevAccounts =>
        prevAccounts.map(acc =>
          acc.accountId === accountId
            ? { ...acc, balance: newBalance }
            : acc
        )
      );

      // Update total balance
      setTotalBalance(prev => prev + amount);

      return newBalance;
    } catch (err) {
      console.error('Error updating account balance:', err);
      throw err instanceof Error ? err : new Error("Failed to update account balance");
    }
  }, [accountsList]);

  const refresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts: accountsList,
    isLoading,
    error,
    totalBalance,
    refresh,
    updateBalance
  };
}
