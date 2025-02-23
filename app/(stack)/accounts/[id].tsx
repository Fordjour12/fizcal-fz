import { formatCurrency } from "@/utils/currency";
import { useLocalSearchParams } from "expo-router";
import { useAccounts } from "@/hooks/useAccounts";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";

const PERIODS = [
  { label: '1W', title: '1 Week' },
  { label: '1M', title: '1 Month' },
  { label: '3M', title: '3 Months' },
  { label: '1Y', title: '1 Year' },
] as const;

type Period = typeof PERIODS[number]['label'];

// Mock data generator based on period
function generateChartData(period: Period) {
  const now = new Date();
  const data: { labels: string[]; datasets: { data: number[] }[] } = {
    labels: [],
    datasets: [{ data: [] }],
  };

  switch (period) {
    case '1W':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.datasets[0].data.push(Math.random() * 100000);
      }
      break;
    case '1M':
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.labels.push(date.toLocaleDateString('en-US', { day: '2-digit' }));
        data.datasets[0].data.push(Math.random() * 100000);
      }
      break;
    case '3M':
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        data.datasets[0].data.push(Math.random() * 100000);
      }
      break;
    case '1Y':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        data.datasets[0].data.push(Math.random() * 100000);
      }
      break;
  }

  return data;
}

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { accounts, isLoading, error } = useAccounts();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1M');
  
  const account = useMemo(() => 
    accounts.find((a) => a.accountId === Number(id)),
    [accounts, id]
  );

  const chartData = useMemo(() => 
    generateChartData(selectedPeriod),
    [selectedPeriod]
  );
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EC654" />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error.message}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!account) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>Account not found</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            {PERIODS.map((period) => (
              <Pressable
                key={period.label}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.label && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.label)}
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
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push(`/(stack)/accounts/${account.accountId}/settings`)}
          >
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2EC654',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
