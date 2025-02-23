import { formatCurrency } from '@/utils/currency';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FinancialSummary {
  balance: number;
  income: number;
  expenses: number;
}

const mockData: FinancialSummary = {
  balance: 5000.00,
  income: 3000.00,
  expenses: 1500.00,
};

export const FinancialOverview = memo(function FinancialOverview() {
  const { balance, income, expenses } = mockData;

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.label}>Current Balance</Text>
        <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.label}>Income</Text>
          <Text style={[styles.statValue, styles.incomeText]}>
            {formatCurrency(income)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={[styles.statValue, styles.expensesText]}>
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  incomeText: {
    color: '#34C759',
  },
  expensesText: {
    color: '#FF3B30',
  },
});
