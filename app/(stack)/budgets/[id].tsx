import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AddRecordModal } from '@/components/AddRecordModal';

interface TransactionProps {
  type: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
}

function Transaction({ type, amount, date, category, paymentMethod, icon, iconColor, iconBackground }: TransactionProps) {
  const isExpense = amount < 0;
  
  return (
    <Animated.View entering={FadeInDown} style={styles.transaction}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View>
          <Text style={styles.transactionType}>{type}</Text>
          <Text style={styles.transactionMethod}>{paymentMethod}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: isExpense ? '#FF3B30' : '#2DC653' }]}>
          {isExpense ? '-' : ''}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
    </Animated.View>
  );
}

export default function BudgetDetailsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const title = 'Entertainment';
  const budget = 10000;
  const spent = 5450.30;
  const progress = 54;

  const transactions: TransactionProps[] = [
    {
      type: 'Shopping',
      amount: -25.56,
      date: '31 Aug 2023',
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      icon: 'cart',
      iconColor: '#E85D75',
      iconBackground: '#4A2328'
    },
    {
      type: 'Salary',
      amount: 500.50,
      date: '31 Aug 2023',
      category: 'Income',
      paymentMethod: 'Cash',
      icon: 'cash',
      iconColor: '#2DC653',
      iconBackground: '#1B4332'
    },
    {
      type: 'Vacation',
      amount: -25.56,
      date: '31 Aug 2023',
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      icon: 'airplane',
      iconColor: '#E85D75',
      iconBackground: '#4A2328'
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title,
          headerTintColor: '#2DC653',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTitleStyle: {
            color: '#2DC653',
            fontSize: 20,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#2DC653" />
            </Pressable>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable 
                style={[styles.menuButton, { backgroundColor: '#1B4332' }]}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Ionicons name="add" size={24} color="#2DC653" />
              </Pressable>
              {/* <Pressable style={[styles.menuButton, { backgroundColor: '#1B4332' }]}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#2DC653" />
              </Pressable> */}
            </View>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          <Pressable>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.periodButton}>
            <Text style={styles.periodText}>This Month</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
          <Pressable>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.amount}>
          ${budget.toLocaleString('en-US')}
        </Text>
        <Text style={styles.percentageText}>{progress}%</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        
        <View style={styles.budgetDetails}>
          <Text style={styles.spentAmount}>
            -${spent.toLocaleString('en-US')} spent
          </Text>
          <Text style={styles.remainingAmount}>
            ${(budget - spent).toLocaleString('en-US')} left
          </Text>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Last Records</Text>
          <Text style={styles.dateHeader}>16 September 2023</Text>
          
          {transactions.map((transaction, index) => (
            <Transaction key={index} {...transaction} />
          ))}

          <Text style={styles.dateHeader}>15 September 2023</Text>
          
          {transactions.map((transaction, index) => (
            <Transaction key={`prev-${index}`} {...transaction} />
          ))}
        </View>
      </ScrollView>

      <AddRecordModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45,198,83,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  menuButton: {
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
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 20,
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
  amount: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2DC653',
    borderRadius: 2,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  spentAmount: {
    fontSize: 14,
    color: '#666',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#fff',
  },
  transactionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
