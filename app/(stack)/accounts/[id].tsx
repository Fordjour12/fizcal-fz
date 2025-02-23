import { formatCurrency } from "@/utils/currency";
import { useLocalSearchParams } from "expo-router";
import { useAccounts } from "@/hooks/useAccounts";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";

// Mock data for the chart
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [20000, 45000, 28000, 80000, 99000, 43000],
    },
  ],
};

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { accounts } = useAccounts();
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
  
  const account = accounts.find((a) => a.accountId === Number(id));
  
  if (!account) return null;

  const periods = [
    { label: '1W', title: '1 Week' },
    { label: '1M', title: '1 Month' },
    { label: '3M', title: '3 Months' },
    { label: '1Y', title: '1 Year' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          title: account.accountName,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(account.balance)}
          </Text>
          <View style={styles.accountInfo}>
            <View style={styles.accountInfoItem}>
              <Ionicons 
                name={account.accountType === 'credit_card' ? 'card' : 'wallet'} 
                size={20} 
                color="#666"
              />
              <Text style={styles.accountInfoText}>{account.accountType}</Text>
            </View>
            <View style={[styles.accountInfoItem, styles.accountInfoDivider]}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.accountInfoText}>{account.currency}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.chartSection}>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <Pressable
                key={period.label}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.label && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.label as typeof selectedPeriod)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.label && styles.periodButtonTextActive,
                ]}>
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: "#1A1A1A",
              backgroundGradientFrom: "#1A1A1A",
              backgroundGradientTo: "#1A1A1A",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(46, 198, 84, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#1A1A1A"
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.actionsSection}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#2EC654" />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="arrow-forward-circle-outline" size={24} color="#2EC654" />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="settings-outline" size={24} color="#2EC654" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  accountInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountInfoDivider: {
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  accountInfoText: {
    color: '#666',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  chartSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  periodButtonActive: {
    backgroundColor: '#2EC654',
  },
  periodButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#2EC654',
    fontSize: 14,
    fontWeight: '500',
  },
});
