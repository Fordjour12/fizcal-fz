import { accounts } from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
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

const ACCOUNT_TYPES = [
	{
		id: "checking",
		title: "Checking",
		icon: "wallet-outline",
		color: "#4CAF50",
	},
	{
		id: "savings",
		title: "Savings",
		icon: "save-outline",
		color: "#2196F3",
	},
	{
		id: "credit_card",
		title: "Credit Card",
		icon: "card-outline",
		color: "#F44336",
	},
	{
		id: "cash",
		title: "Cash",
		icon: "cash-outline",
		color: "#FFC107",
	},
	{
		id: "investment",
		title: "Investment",
		icon: "trending-up-outline",
		color: "#9C27B0",
	},
] as const;

type AccountType = typeof ACCOUNT_TYPES[number]['id'];

export default function NewAccountScreen() {
	const [accountName, setAccountName] = useState("");
	const [accountType, setAccountType] = useState<string | null>(null);
	const [balance, setBalance] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const db = useDB();
	const { user } = useAuth();

	const handleSubmit = async () => {
		try {
			setError(null);
			setIsLoading(true);

			if (!accountName.trim()) {
				throw new Error("Account name is required");
			}
			if (!accountType) {
				throw new Error("Please select an account type");
			}
			if (!balance.trim()) {
				throw new Error("Initial balance is required");
			}

			const balanceNum = Number.parseFloat(balance.replace(/[^0-9.-]+/g, ""));
			if (Number.isNaN(balanceNum)) {
				throw new Error("Invalid balance amount");
			}

			if (!accountType || !ACCOUNT_TYPES.some(t => t.id === accountType)) {
				throw new Error("Please select a valid account type");
			}

			await db.insert(accounts).values({
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				userId: Number(user!.userId),
				accountName: accountName.trim(),
				accountType: accountType as AccountType,
				balance: balanceNum,
				currency: "USD",
			});

			router.back();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create account");
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
					title: "New Account",
					headerShadowVisible: false,
				}}
			/>

			<ScrollView style={styles.scrollView}>
				<Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Account Name</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter account name"
							placeholderTextColor="#666"
							value={accountName}
							onChangeText={setAccountName}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Account Type</Text>
						<View style={styles.accountTypes}>
							{ACCOUNT_TYPES.map((type) => (
								<Pressable
									key={type.id}
									style={[
										styles.accountTypeButton,
										accountType === type.id && styles.accountTypeButtonActive,
									]}
									onPress={() => setAccountType(type.id)}
								>
									<Ionicons
										name={type.icon as keyof typeof Ionicons.glyphMap}
										size={24}
										color={accountType === type.id ? "#fff" : type.color}
									/>
									<Text
										style={[
											styles.accountTypeText,
											accountType === type.id && styles.accountTypeTextActive,
										]}
									>
										{type.title}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Initial Balance</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter initial balance"
							placeholderTextColor="#666"
							value={balance}
							onChangeText={setBalance}
							keyboardType="decimal-pad"
						/>
					</View>

					{error && <Text style={styles.errorText}>{error}</Text>}

					<Pressable
						style={[
							styles.submitButton,
							isLoading && styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.submitButtonText}>Create Account</Text>
						)}
					</Pressable>
				</Animated.View>
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
	accountTypes: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	accountTypeButton: {
		backgroundColor: "#1A1A1A",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		width: "30%",
	},
	accountTypeButtonActive: {
		backgroundColor: "#2EC654",
	},
	accountTypeText: {
		color: "#666",
		marginTop: 8,
		fontSize: 14,
		fontWeight: "500",
	},
	accountTypeTextActive: {
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
