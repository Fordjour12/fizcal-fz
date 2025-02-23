import { StyleSheet, View } from 'react-native';
import { Text } from './Themed';
import { useMemo } from 'react';

interface FinancialMetric {
  label: string;
  value: string;
  trend?: number;
}

interface FinancialOverviewProps {
  metrics?: FinancialMetric[];
}

export function FinancialOverview({ metrics = [] }: FinancialOverviewProps) {
  const displayMetrics = useMemo(() => {
    if (metrics.length) return metrics;
    return [
      { label: 'Total Balance', value: '$0.00' },
      { label: 'Income', value: '$0.00', trend: 0 },
      { label: 'Expenses', value: '$0.00', trend: 0 },
    ];
  }, [metrics]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Overview</Text>
      </View>
      <View style={styles.metricsGrid}>
        {displayMetrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
            {metric.trend !== undefined && (
              <Text 
                style={[
                  styles.trendValue,
                  { color: metric.trend >= 0 ? '#4CAF50' : '#F44336' }
                ]}
              >
                {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
});
