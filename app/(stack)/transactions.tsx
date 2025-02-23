import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { AddRecordModal } from '@/components/AddRecordModal';
import { 
  TransactionsList, 
  TODAY_TRANSACTIONS, 
  Transaction, 
  NewTransaction, 
  TRANSACTION_CATEGORIES 
} from '@/components/TransactionsList';
import { formatCurrency } from '@/utils/currency';



export default function TransactionsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(TODAY_TRANSACTIONS);
  const totalBalance = 26000.00;
  const currentDate = new Date(2025, 1, 22); // Feb 22, 2025

  const handleTransactionPress = (transaction: Transaction) => {
    // Handle transaction press
    console.log('Transaction pressed:', transaction);
  };

  const handleAddTransaction = (newTransaction: NewTransaction) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type === 'expense' ? 'Expense' : 'Income',
      amount: newTransaction.amount,
      category: TRANSACTION_CATEGORIES.find(cat => cat.id === newTransaction.category)?.title || '',
      paymentMethod: newTransaction.paymentMethod,
      date: currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      icon: TRANSACTION_CATEGORIES.find(cat => cat.id === newTransaction.category)?.icon || 'cash-outline',
      iconColor: newTransaction.amount < 0 ? '#E85D75' : '#2DC653',
      iconBackground: newTransaction.amount < 0 ? '#4A2328' : '#1B4332'
    };

    setTransactions([transaction, ...transactions]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 20,
            fontWeight: '600',
          },
          headerRight: () => (
            <Pressable 
              style={[styles.headerButton, { backgroundColor: '#1B4332' }]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add-outline" size={24} color="#2DC653" />
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Pressable style={styles.balanceButton}>
              <Text style={styles.balanceAmount}>
                {formatCurrency(totalBalance)}
              </Text>
              <Ionicons name="chevron-down-outline" size={20} color="#666" />
            </Pressable>
          </View>

          <View style={styles.periodSelector}>
            <Pressable>
              <Ionicons name="chevron-back-outline" size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.periodButton}>
              <Text style={styles.periodText}>22 FEB 2025</Text>
              <Ionicons name="chevron-down-outline" size={20} color="#666" />
            </Pressable>
            <Pressable>
              <Ionicons name="chevron-forward-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statAmount, { color: '#2DC653' }]}>+{formatCurrency(3500.00)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={[styles.statAmount, { color: '#FF3B30' }]}>-{formatCurrency(164.46)}</Text>
            </View>
          </View>

          <View style={styles.transactionsList}>
            <Text style={styles.sectionTitle}>Today</Text>
            <TransactionsList 
              transactions={transactions}
              onTransactionPress={handleTransactionPress}
            />
          </View>
        </ScrollView>

        <Pressable 
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <AddRecordModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddTransaction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2DC653',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#141414',
    borderRadius: 20,
  },
  periodText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    padding: 16,
    backgroundColor: '#141414',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  transactionsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },

});
