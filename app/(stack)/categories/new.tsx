import { categories, type InsertCategory } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

interface FormState {
  categoryName: string;
  isIncome: boolean;
}

export default function NewCategoryScreen() {
  const [categoryName, setCategoryName] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useDB();
  const { user } = useAuth();

  const handleSubmit = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!categoryName.trim()) {
        throw new Error("Category name is required");
      }

      if (!user?.userId) {
        throw new Error("You must be logged in");
      }

      const categoryData: InsertCategory = {
        userId: user.userId,
        categoryName: categoryName.trim(),
        isIncome,
      };

      await db.insert(categories).values([categoryData]);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  }, [categoryName, isIncome]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          title: "New Category",
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
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
              returnKeyType="done"
              autoCapitalize="words"
              maxLength={50}
              accessibilityLabel="Category name input"
              accessibilityHint="Enter a name for your new category"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Is Income Category?</Text>
            <Pressable 
              style={styles.switchContainer}
              onPress={() => setIsIncome(!isIncome)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isIncome }}
              accessibilityLabel="Toggle income category"
              accessibilityHint="Double tap to toggle between income and expense category"
            >
              <Switch
                value={isIncome}
                onValueChange={setIsIncome}
                trackColor={{ false: "#333", true: "#4CAF50" }}
                thumbColor={isIncome ? "#fff" : "#f4f3f4"}
              />
              <Text style={styles.switchLabel}>
                {isIncome ? "Income" : "Expense"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Category</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
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
