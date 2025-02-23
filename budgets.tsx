// import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { formatCurrency } from '@/utils/currency';

// interface BudgetItemProps {
//   title: string;
//   amount: number;
//   spent: number;
//   progress: number;
//   isOverspent?: boolean;
// }

// function BudgetItem({ title, amount, spent, progress, isOverspent }: BudgetItemProps) {
//   const amountLeft = amount - spent;
//   const progressColor = isOverspent ? '#FF3B30' : '#007AFF';
  
//   return (
//     <Pressable onPress={() => router.push(`/budgets/${title.toLowerCase()}`)}>
//       <Animated.View entering={FadeInDown} style={styles.budgetItem}>
//       <View style={styles.budgetItemHeader}>
//         <Text style={[styles.budgetTitle, { color: isOverspent ? '#FF3B30' : '#2DC653' }]}>{title}</Text>
//         <Pressable>
//           <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
//         </Pressable>
//       </View>
      
//       <Text style={styles.budgetAmount}>
//         {formatCurrency(amount)}
//       </Text>
      
//       <View style={styles.progressBar}>
//         <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }]} />
//       </View>
      
//       <View style={styles.budgetDetails}>
//         <Text style={styles.spentAmount}>-{formatCurrency(spent)} spent</Text>
//         <Text style={[styles.remainingAmount, { color: isOverspent ? '#FF3B30' : '#fff' }]}>
//           {isOverspent ? 
//             `${formatCurrency(Math.abs(amountLeft))} overspending` :
//             `${formatCurrency(amountLeft)} left`
//           }
//         </Text>
//       </View>
//     </Animated.View>
//     </Pressable>
//   );
// }

// export default function BudgetsScreen() {
//   const totalBudget = 26950;
//   const totalSpent = 10900.60;
//   const totalProgress = 43;

//   return (
//     <View style={styles.container}>
//       <Stack.Screen
//         options={{
//           headerShown: true,
//         }}
//       />

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         <View style={styles.totalBudget}>
//           <Text style={styles.totalTitle}>Total Budget</Text>
//           <Text style={styles.totalAmount}>{formatCurrency(totalBudget)}</Text>
//           <Text style={styles.percentageText}>{totalProgress}%</Text>
          
//           <View style={styles.progressBar}>
//             <View style={[styles.progressFill, { width: `${totalProgress}%` }]} />
//           </View>
          
//           <View style={styles.totalDetails}>
//             <Text style={styles.spentAmount}>
//               -{formatCurrency(totalSpent)} spent
//             </Text>
//             <Text style={styles.remainingAmount}>
//               {formatCurrency(totalBudget - totalSpent)} left
//             </Text>
//           </View>
//         </View>

//         <BudgetItem
//           title="Entertainment"
//           amount={10000}
//           spent={5450.30}
//           progress={54}
//         />
        
//         <BudgetItem
//           title="Food"
//           amount={5000}
//           spent={5450.30}
//           progress={93}
//           isOverspent
//         />
        
//         <BudgetItem
//           title="Transport"
//           amount={3000}
//           spent={1200}
//           progress={40}
//         />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },

//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   totalBudget: {
//     backgroundColor: '#141414',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//   },
//   totalTitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 8,
//   },
//   totalAmount: {
//     fontSize: 34,
//     fontWeight: '600',
//     color: '#fff',
//     marginBottom: 4,
//   },
//   percentageText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   budgetItem: {
//     backgroundColor: '#141414',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//   },
//   budgetItemHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   budgetTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   budgetAmount: {
//     fontSize: 28,
//     fontWeight: '600',
//     color: '#fff',
//     marginBottom: 12,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 2,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#007AFF',
//     borderRadius: 2,
//   },
//   budgetDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   spentAmount: {
//     fontSize: 14,
//     color: '#666',
//   },
//   remainingAmount: {
//     fontSize: 14,
//     color: '#fff',
//   },
//   totalDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//   },
// });
