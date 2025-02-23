import { formatCurrency } from '@/utils/currency';
import React, { memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

const mockTransactions: Transaction[] = [
  { id: '1', title: 'Salary', amount: 3000, date: '2024-01-01', type: 'income' },
  { id: '2', title: 'Rent', amount: -1000, date: '2024-01-02', type: 'expense' },
  { id: '3', title: 'Groceries', amount: -200, date: '2024-01-03', type: 'expense' },
];

const TransactionItem = memo(function TransactionItem({ 
  title, 
  amount, 
  date 
}: Omit<Transaction, 'id' | 'type'>) {
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        amount > 0 ? styles.incomeText : styles.expenseText
      ]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );
});

export const TransactionsList = memo(function TransactionsList() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Transactions</Text>
      <FlatList
        data={mockTransactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            title={item.title}
            amount={item.amount}
            date={item.date}
          />
        )}
        getItemLayout={(_, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeText: {
    color: '#34C759',
  },
  expenseText: {
    color: '#FF3B30',
  },
});
