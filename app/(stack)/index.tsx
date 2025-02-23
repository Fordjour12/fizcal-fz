import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import { BudgetCard } from '@/components/BudgetCard';
import { TransactionsList, TODAY_TRANSACTIONS, Transaction, NewTransaction, TRANSACTION_CATEGORIES } from '@/components/TransactionsList';
import { AddRecordModal } from '@/components/AddRecordModal';

interface AccountItemProps {
  title: string;
  type: string;
  amount: number;
  color: string;
}

function AccountItem({ title, type, amount, color }: AccountItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.accountItem}>
      <View style={styles.accountLeft}>
        <View style={[styles.accountDot, { backgroundColor: color }]} />
        <View>
          <Text style={styles.accountTitle}>{title}</Text>
          <Text style={styles.accountType}>{type}</Text>
        </View>
      </View>
      <Text style={styles.accountAmount}>$ {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(TODAY_TRANSACTIONS.slice(0, 5));
  const totalBalance = 36837.15;
  const growth = 3898.61;
  const growthPercentage = 13.67;

  const handleAddTransaction = (newTransaction: NewTransaction) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type === 'expense' ? 'Expense' : 'Income',
      amount: newTransaction.amount,
      category: TRANSACTION_CATEGORIES.find(cat => cat.id === newTransaction.category)?.title || '',
      paymentMethod: newTransaction.paymentMethod,
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      icon: TRANSACTION_CATEGORIES.find(cat => cat.id === newTransaction.category)?.icon || 'cash-outline',
      iconColor: newTransaction.amount < 0 ? '#E85D75' : '#2DC653',
      iconBackground: newTransaction.amount < 0 ? '#4A2328' : '#1B4332'
    };

    setTransactions([transaction, ...transactions.slice(0, 4)]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.time}>9:41</Text>
            <Pressable style={styles.iconButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </Pressable>
          </View>
          
          <Animated.View entering={FadeInDown.delay(200)} style={styles.balanceContainer}>
            <Text style={styles.balance}>$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            <View style={styles.growthContainer}>
              <Text style={styles.growthAmount}>+{growth.toLocaleString('en-US', { minimumFractionDigits: 2 })}$</Text>
              <Text style={styles.growthPercentage}>{growthPercentage}% the last year</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.budgetSection}>
          <Pressable onPress={() => router.push('/budgets')}>
            <BudgetCard
              amountLeft={14500.00}
              amountSpent={12450.30}
              categories={[
                {
                  title: 'Entertainment',
                  spent: 3430,
                  icon: 'game-controller',
                  iconColor: '#2DC653',
                  iconBackground: '#1B4332',
                  progress: 75
                },
                {
                  title: 'Food',
                  spent: 430,
                  icon: 'restaurant',
                  iconColor: '#E85D75',
                  iconBackground: '#4A2328',
                  progress: 45
                }
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          
          <AccountItem
            title="Checking Account"
            type="Cash"
            amount={14565.15}
            color="#007AFF"
          />
          <AccountItem
            title="Savings Account"
            type="Investments"
            amount={6819.15}
            color="#34C759"
          />
          <AccountItem
            title="ETFs"
            type="Investments"
            amount={15452.85}
            color="#FF3B30"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable 
              style={styles.viewAllButton} 
              onPress={() => router.push("/(stack)/transactions")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#2DC653" />
            </Pressable>
          </View>
          <TransactionsList 
            transactions={transactions}
            onTransactionPress={() => router.push("/(stack)/transactions")}
          />
        </View>

        <Pressable 
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>

        <AddRecordModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onAdd={handleAddTransaction}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2DC653',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  time: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceContainer: {
    marginBottom: 40,
  },
  balance: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  growthAmount: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '500',
  },
  growthPercentage: {
    color: '#666',
    fontSize: 16,
  },
  budgetSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionLink: {
    color: '#666',
    fontSize: 16,
  },

  accountsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 15,
    color: '#666',
  },
  accountAmount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
