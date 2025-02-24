import { categories } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eq } from "drizzle-orm";

interface Category {
  categoryId: number;
  categoryName: string;
  isIncome: boolean;
}

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useDB();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategory();
  }, [id, db, user]);

  const fetchCategory = async () => {
    if (!user || !id) return;
    try {
      setIsLoading(true);
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.categoryId, Number(id)));

      if (result.length > 0) {
        const categoryData = result[0];
        setCategory(categoryData);
        setCategoryName(categoryData.categoryName);
        setIsIncome(categoryData.isIncome);
      } else {
        setError("Category not found");
      }
    } catch (err) {
      console.error("Failed to fetch category:", err);
      setError("Failed to load category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !id) return;
    try {
      setError(null);
      setIsSaving(true);

      if (!categoryName.trim()) {
        throw new Error("Category name is required");
      }

      await db
        .update(categories)
        .set({
          categoryName: categoryName.trim(),
          isIncome,
        })
        .where(eq(categories.categoryId, Number(id)));

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          title: "Edit Category",
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor="#666"
            value={categoryName}
            onChangeText={setCategoryName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Is Income Category?</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={isIncome}
              onValueChange={setIsIncome}
              trackColor={{ false: "#333", true: "#4CAF50" }}
              thumbColor={isIncome ? "#fff" : "#f4f3f4"}
            />
            <Text style={styles.switchLabel}>
              {isIncome ? "Income" : "Expense"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Category</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
  },
  switchLabel: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#ff000020",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
