import { Card } from '@/components/common/Card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { FinancialOverview } from '@/components/FinancialOverview';
import { TransactionsList } from '@/components/TransactionsList';
import { colors, shadows, spacing } from '@/constants/theme';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function DashboardContent() {
  const { isLoading, error, refreshData, transactions } = useDashboardData();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </Card>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={styles.content}>
      <FlatList
        data={transactions}
        contentContainerStyle={styles.scrollContent}
        refreshing={isLoading}
        onRefresh={refreshData}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <FinancialOverview />
          </View>
        )}
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeIn.delay(200)}
            style={styles.transactionCard}
          >
            <TransactionsList.Item transaction={item} />
          </Animated.View>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <Text style={styles.emptyText}>No transactions found</Text>
            )}
          </View>
        )}
      />
    </Animated.View>
  );
}

export default function DashboardScreen() {
  return (
    <ErrorBoundary>
      <View style={styles.background}>
        <SafeAreaView style={styles.container}>
          <Stack.Screen 
            options={{ 
              title: 'Dashboard',
              headerLargeTitle: true,
              headerTransparent: true,
              headerBlurEffect: 'light',
              headerLargeTitleStyle: styles.headerTitle,
            }} 
          />
          <DashboardContent />
        </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 120,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  errorCard: {
    padding: spacing.lg,
    borderRadius: 16,
    width: '90%',
    overflow: 'hidden',
    ...shadows.medium,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: 'bold',
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.small,
  },
  emptyContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  background: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
