import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/currency';

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
}

export const PAYMENT_METHODS: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'cash',
    title: 'Cash',
    icon: 'cash-outline'
  },
  {
    id: 'card',
    title: 'Credit Card',
    icon: 'card-outline'
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    icon: 'business-outline'
  }
];

export const TRANSACTION_CATEGORIES: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
}[] = [
  {
    id: 'food',
    title: 'Food & Drinks',
    icon: 'cafe-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: 'car-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  },
  {
    id: 'shopping',
    title: 'Shopping',
    icon: 'cart-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    icon: 'film-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: 'health',
    title: 'Health',
    icon: 'fitness-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  },
  {
    id: 'income',
    title: 'Income',
    icon: 'cash-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  }
];

export const TODAY_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'Coffee Shop',
    amount: -5.50,
    category: 'Food & Drinks',
    paymentMethod: 'Credit Card',
    date: '22 Feb 2025',
    icon: 'cafe-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: '2',
    type: 'Uber Ride',
    amount: -12.99,
    category: 'Transport',
    paymentMethod: 'Credit Card',
    date: '22 Feb 2025',
    icon: 'car-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  },
  {
    id: '3',
    type: 'Salary',
    amount: 3500.00,
    category: 'Income',
    paymentMethod: 'Bank Transfer',
    date: '22 Feb 2025',
    icon: 'cash-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  },
  {
    id: '4',
    type: 'Amazon',
    amount: -79.99,
    category: 'Shopping',
    paymentMethod: 'Credit Card',
    date: '22 Feb 2025',
    icon: 'cart-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: '5',
    type: 'Netflix',
    amount: -15.99,
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    date: '22 Feb 2025',
    icon: 'film-outline',
    iconColor: '#E85D75',
    iconBackground: '#4A2328'
  },
  {
    id: '6',
    type: 'Gym Membership',
    amount: -49.99,
    category: 'Health',
    paymentMethod: 'Credit Card',
    date: '22 Feb 2025',
    icon: 'fitness-outline',
    iconColor: '#2DC653',
    iconBackground: '#1B4332'
  }
];

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isExpense = transaction.amount < 0;
  
  return (
    <Pressable onPress={onPress}>
      <Animated.View entering={FadeInDown} style={styles.transaction}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBackground }]}>
            <Ionicons name={transaction.icon} size={20} color={transaction.iconColor} />
          </View>
          <View>
            <Text style={styles.transactionType}>{transaction.type}</Text>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionMethod}>{transaction.paymentMethod}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isExpense ? '#FF3B30' : '#2DC653' }]}>
            {isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
          </Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export interface NewTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: string;
  note?: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  onAddTransaction?: (transaction: NewTransaction) => void;
}

export function TransactionsList({ transactions, onTransactionPress, onAddTransaction }: TransactionsListProps) {
  return (
    <View style={styles.container}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onPress={() => onTransactionPress?.(transaction)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionType: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionMethod: {
    fontSize: 14,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
});
