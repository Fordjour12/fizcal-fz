import { Transaction } from '@/types';
import { useCallback, useState } from 'react';

const SAMPLE_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        amount: -45.99,
        description: 'Grocery Shopping',
        date: new Date('2024-01-15'),
        category: 'Food',
    },
    {
        id: '2',
        amount: 1200.00,
        description: 'Salary Deposit',
        date: new Date('2024-01-14'),
        category: 'Income',
    },
    {
        id: '3',
        amount: -89.99,
        description: 'Monthly Gym Membership',
        date: new Date('2024-01-13'),
        category: 'Health',
    },
];

interface DashboardData {
    isLoading: boolean;
    error: Error | null;
    transactions: Transaction[];
    refreshData: () => Promise<void>;
}

export function useDashboardData(): DashboardData {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Use mock data instead of API call
            // const response = await fetch('/api/transactions');
            // const data = await response.json();
            setTransactions(SAMPLE_TRANSACTIONS);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        transactions,
        refreshData,
    };
}
