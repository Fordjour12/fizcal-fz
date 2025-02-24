import { budgets, categories, type InsertBudget } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { eq } from "drizzle-orm";

const PERIOD_TYPES = [
	{
		id: "monthly",
		title: "Monthly",
		icon: "calendar-outline",
	},
	{
		id: "weekly",
		title: "Weekly",
		icon: "time-outline",
	},
	{
		id: "bi-weekly",
		title: "Bi-Weekly",
		icon: "calendar-number-outline",
	},
	{
		id: "yearly",
		title: "Yearly",
		icon: "calendar-clear-outline",
	},
] as const;

type PeriodType = typeof PERIOD_TYPES[number]["id"];

interface Category {
	categoryId: number;
	categoryName: string;
	isIncome: boolean;
}

interface ActionButtonProps {
	onPress: () => void;
	iconName: keyof typeof Ionicons.glyphMap;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onPress, iconName }) => {
	return (
		<Pressable 
			onPress={onPress}
			style={styles.iconButton}
			accessibilityRole="button"
		>
			<Ionicons name={iconName} size={20} color="#fff" />
		</Pressable>
	);
};

const CreateCategory: React.FC<Pick<ActionButtonProps, 'onPress'>> = ({ onPress }) => {
	return <ActionButton onPress={onPress} iconName="add-circle-outline" />;
}

export default function NewBudgetScreen() {
	const handleCreateCategory = () => {
		router.push('/(stack)/categories/new');
	};
	const [budgetName, setBudgetName] = useState("");
	const [budgetAmount, setBudgetAmount] = useState("");
	const [periodType, setPeriodType] = useState<PeriodType | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const db = useDB();
	const { user } = useAuth();

	// Fetch categories
	useEffect(() => {
		async function fetchCategories() {
			if (!user) return;
			try {
				const result = await db
					.select()
					.from(categories)
					.where(eq(categories.userId, user.userId));
				setCategoryList(result);
			} catch (err) {
				console.error("Failed to fetch categories:", err);
			}
		}
		fetchCategories();
	}, [db, user]);

	const handleSubmit = async () => {
		try {
			setError(null);
			setIsLoading(true);

			if (!budgetName.trim()) {
				throw new Error("Budget name is required");
			}
			if (!budgetAmount.trim()) {
				throw new Error("Budget amount is required");
			}
			if (!periodType) {
				throw new Error("Please select a period type");
			}
			if (!selectedCategoryId) {
				throw new Error("Please select a category");
			}

			if (!user?.userId) {
				throw new Error("You must be logged in");
			}

			const amount = Number.parseFloat(budgetAmount.replace(/[^0-9.-]+/g, ""));
			if (Number.isNaN(amount)) {
				throw new Error("Invalid budget amount");
			}

			const now = new Date();
			const startDate = now;
			const endDate = new Date(now);

			// Set end date based on period type
			switch (periodType) {
				case "weekly":
					endDate.setDate(endDate.getDate() + 7);
					break;
				case "bi-weekly":
					endDate.setDate(endDate.getDate() + 14);
					break;
				case "monthly":
					endDate.setMonth(endDate.getMonth() + 1);
					break;
				case "yearly":
					endDate.setFullYear(endDate.getFullYear() + 1);
					break;
			}

			const budgetData: InsertBudget = {
				userId: user.userId,
				categoryId: selectedCategoryId,
				budgetName: budgetName.trim(),
				budgetAmount: amount,
				periodType,
				startDate,
				endDate,
				rollover: false,
			};

			await db.insert(budgets).values([budgetData]);

			router.back();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create budget");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen
				options={{
					headerStyle: { backgroundColor: "#000" },
					headerTintColor: "#fff",
					title: "New Budget",
					headerShadowVisible: false,
				}}
			/>

			<ScrollView style={styles.scrollView}>
				<Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Budget Name</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter budget name"
							placeholderTextColor="#666"
							value={budgetName}
							onChangeText={setBudgetName}
						/>
					</View>

					<View style={styles.inputGroup}>
						<View style={styles.categoryHeader}>
							<Text style={styles.label}>Category</Text>
							<View style={styles.categoryActions}>
								<ActionButton 
									iconName="list-outline"
									onPress={() => router.push('/(stack)/categories')}
								/>
								<CreateCategory onPress={handleCreateCategory} />
							</View>
						</View>
						<View style={styles.categoriesGrid}>
							{categoryList.length === 0 ? (
								<Text style={styles.noCategoriesText}>No categories yet. Create one to get started!</Text>
							) : (
								categoryList.map((category) => (
									<Pressable
										key={category.categoryId}
										style={[
											styles.categoryButton,
											selectedCategoryId === category.categoryId &&
												styles.categoryButtonActive,
										]}
										onPress={() => setSelectedCategoryId(category.categoryId)}
								>
									<Text
										style={[
											styles.categoryText,
											selectedCategoryId === category.categoryId &&
												styles.categoryTextActive,
										]}
									>
										{category.categoryName}
									</Text>
								</Pressable>
							)))}
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Period</Text>
						<View style={styles.periodTypes}>
							{PERIOD_TYPES.map((type) => (
								<Pressable
									key={type.id}
									style={[
										styles.periodButton,
										periodType === type.id && styles.periodButtonActive,
									]}
									onPress={() => setPeriodType(type.id)}
								>
									<Ionicons
										name={type.icon as keyof typeof Ionicons.glyphMap}
										size={24}
										color={periodType === type.id ? "#fff" : "#2EC654"}
									/>
									<Text
										style={[
											styles.periodText,
											periodType === type.id && styles.periodTextActive,
										]}
									>
										{type.title}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Budget Amount</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter budget amount"
							placeholderTextColor="#666"
							value={budgetAmount}
							onChangeText={setBudgetAmount}
							keyboardType="decimal-pad"
						/>
					</View>

					{error && <Text style={styles.errorText}>{error}</Text>}

					<Pressable
						style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.submitButtonText}>Create Budget</Text>
						)}
					</Pressable>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	categoryActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	iconButton: {
		padding: 8,
		backgroundColor: '#333',
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 36,
		minHeight: 36,
	},
	categoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	noCategoriesText: {
		color: '#666',
		fontSize: 14,
		textAlign: 'center',
		padding: 16,
	},
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	createCategoryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		padding: 8,
		backgroundColor: '#1a1a1a',
		borderRadius: 8,
	},
	createCategoryText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
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
		fontSize: 16,
		color: "#fff",
		marginBottom: 8,
		fontWeight: "500",
	},
	input: {
		backgroundColor: "#1A1A1A",
		borderRadius: 8,
		padding: 16,
		color: "#fff",
		fontSize: 16,
	},
	categoriesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	categoryButton: {
		backgroundColor: "#1A1A1A",
		borderRadius: 8,
		padding: 12,
		minWidth: "30%",
	},
	categoryButtonActive: {
		backgroundColor: "#2EC654",
	},
	categoryText: {
		color: "#666",
		fontSize: 14,
		fontWeight: "500",
		textAlign: "center",
	},
	categoryTextActive: {
		color: "#fff",
	},
	periodTypes: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "space-between",
	},
	periodButton: {
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		width: "48%",
		marginBottom: 12,
	},
	periodButtonActive: {
		backgroundColor: "#2EC654",
	},
	periodText: {
		color: "#666",
		marginTop: 8,
		fontSize: 14,
		fontWeight: "500",
	},
	periodTextActive: {
		color: "#fff",
	},
	submitButton: {
		backgroundColor: "#2EC654",
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		marginTop: 24,
	},
	submitButtonDisabled: {
		opacity: 0.5,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		color: "#ff4444",
		fontSize: 14,
		marginTop: -16,
		marginBottom: 16,
	},
}); 
 