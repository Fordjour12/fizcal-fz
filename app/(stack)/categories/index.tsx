import { categories, budgets } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { eq } from "drizzle-orm";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Category {
  categoryId: number;
  categoryName: string;
  isIncome: boolean;
}

export default function CategoriesScreen() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = useDB();
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, user.userId));
      setCategoryList(result);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCategoryList, setError]);

  useEffect(() => {
    if (db && user) {
      fetchCategories();
    }
  }, [fetchCategories]);

  const handleDeleteCategory = async (categoryId: number) => {
    if (!user) return;
    try {
      // Check if category is used in any budgets
      const relatedBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.categoryId, categoryId));

      if (relatedBudgets.length > 0) {
        Alert.alert(
          "Cannot Delete Category",
          "This category is being used by one or more budgets. Please update or delete those budgets first.",
          [{ text: "OK" }]
        );
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await db
                  .delete(categories)
                  .where(eq(categories.categoryId, categoryId));
                await fetchCategories();
              } catch (err) {
                console.error("Failed to delete category:", err);
                setError("Failed to delete category");
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("Failed to check category dependencies:", err);
      setError("Failed to delete category");
    }
  };

  const renderCategory = (category: Category) => (
    <Animated.View
      entering={FadeInDown.delay(200)}
      key={category.categoryId}
      style={styles.categoryCard}
    >
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.categoryName}</Text>
        <Text
          style={[
            styles.categoryType,
            category.isIncome ? styles.incomeText : styles.expenseText,
          ]}
        >
          {category.isIncome ? "Income" : "Expense"}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push({
            pathname: "/(stack)/categories/[id]",
            params: { id: category.categoryId }
          })}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(category.categoryId)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          title: "Categories",
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              style={styles.headerButton}
              onPress={() => router.push("/(stack)/categories/new")}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : categoryList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories yet</Text>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/(stack)/categories/new")}
          >
            <Text style={styles.createButtonText}>Create Category</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {categoryList.map(renderCategory)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerButton: {
    marginRight: 8,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 14,
    fontWeight: "500",
  },
  incomeText: {
    color: "#4CAF50",
  },
  expenseText: {
    color: "#f44336",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  deleteButton: {
    backgroundColor: "#ff000030",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#ff000020",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 14,
  },
});
