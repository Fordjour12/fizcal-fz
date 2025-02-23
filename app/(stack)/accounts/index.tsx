import { useAccounts, type AccountType } from "@/hooks/useAccounts";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import React from "react";

const ACCOUNT_TYPE_ICONS: Record<AccountType, keyof typeof Ionicons.glyphMap> = {
  checking: "wallet-outline",
  savings: "save-outline",
  credit_card: "card-outline",
  cash: "cash-outline",
  investment: "trending-up-outline",
};

function AccountCard({ 
  accountId,
  accountName, 
  accountType, 
  balance, 
  color 
}: { 
  accountId: number;
  accountName: string;
  accountType: AccountType;
  balance: number;
  color: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={[styles.accountCard, { borderLeftColor: color }]}
    >
      <Pressable 
        style={styles.accountCardContent}
        onPress={() => router.push(`/accounts/${accountId}`)}
      >
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Ionicons 
              name={ACCOUNT_TYPE_ICONS[accountType]} 
              size={24} 
              color={color} 
            />
            <View>
              <Text style={styles.accountName}>{accountName}</Text>
              <Text style={styles.accountType}>{accountType.replace('_', ' ')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AccountsScreen() {
  const { accounts, isLoading, error, refresh } = useAccounts();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          title: "Accounts",
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/accounts/new")}
              style={styles.headerButton}
            >
              <Ionicons name="add" size={24} color="#2EC654" />
            </Pressable>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Loading accounts...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
            <Text style={styles.errorText}>{error.message}</Text>
            <Pressable style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.messageContainer}>
            <Ionicons name="wallet-outline" size={48} color="#666" />
            <Text style={styles.messageText}>No accounts yet</Text>
            <Pressable 
              style={styles.addButton}
              onPress={() => router.push("/accounts/new")}
            >
              <Text style={styles.addButtonText}>Add Account</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Balance</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </Text>
            </View>

            <View style={styles.accountsList}>
              {accounts.map((account) => (
                <AccountCard
                  key={account.accountId}
                  accountId={account.accountId}
                  accountName={account.accountName}
                  accountType={account.accountType}
                  balance={account.balance}
                  color={account.color || "#757575"}
                />
              ))}
            </View>

            <Pressable 
              style={styles.addAccountCard}
              onPress={() => router.push("/accounts/new")}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2EC654" />
              <Text style={styles.addAccountText}>Add New Account</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    marginRight: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 32,
  },
  messageText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2EC654",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  totalSection: {
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 34,
    fontWeight: "600",
    color: "#fff",
  },
  accountsList: {
    gap: 16,
  },
  accountCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  accountCardContent: {
    padding: 16,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#2EC654",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addAccountCard: {
    marginTop: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addAccountText: {
    color: "#2EC654",
    fontSize: 16,
    fontWeight: "500",
  },
});
