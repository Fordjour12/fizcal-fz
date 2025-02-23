import { ErrorBoundary } from "@/components/ErrorBoundary";
import * as schema from "@/db/schema";
import { useAuth } from "@/hooks/useAuth";
import useDB from "@/hooks/useDB";
import { signInSchema } from "@/types/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Keyboard,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from "react-native";
import Animated, {
	FadeInDown,
	FadeInRight,
	SlideInRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// Types and constants
type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment";

const ACCOUNT_TYPES: Record<
	AccountType,
	{ name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }
> = {
	checking: { name: "Checking", icon: "bank", color: "#6366F1" },
	savings: { name: "Savings", icon: "piggy-bank", color: "#8B5CF6" },
	cash: { name: "Cash", icon: "wallet", color: "#EC4899" },
	credit_card: { name: "Credit Card", icon: "credit-card", color: "#F43F5E" },
	investment: { name: "Investment", icon: "chart-line", color: "#10B981" },
} as const;

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	accounts: Array<{
		name: string;
		type: AccountType;
		balance: string;
	}>;
}

const INITIAL_FORM_DATA: FormData = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	accounts: [
		{ name: "", type: "checking", balance: "" },
		{ name: "", type: "savings", balance: "" },
	],
};

// Validation schemas
const balanceSchema = z.string().refine((val) => {
	const num = Number.parseFloat(val);
	return !Number.isNaN(num) && num >= 0;
}, "Please enter a valid positive number");

// Reusable components
function Input({
	label,
	error,
	inputRef,
	...props
}: {
	label: string;
	error?: string;
	inputRef?: React.RefObject<TextInput>;
} & React.ComponentProps<typeof TextInput>) {
	return (
		<View style={styles.inputGroup}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				ref={inputRef}
				style={[styles.input, error && styles.inputError]}
				placeholderTextColor="#9CA3AF"
				{...props}
			/>
			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
}

function AccountTypeButton({
	type,
	isSelected,
	onPress,
}: {
	type: AccountType;
	isSelected: boolean;
	onPress: () => void;
}) {
	const { name, icon, color } = ACCOUNT_TYPES[type];
	return (
		<Pressable
			style={[styles.accountTypeButton, isSelected && { borderColor: color }]}
			onPress={onPress}
			accessibilityRole="radio"
			accessibilityState={{ checked: isSelected }}
			accessibilityLabel={`${name} account type`}
		>
			<MaterialCommunityIcons
				name={icon}
				size={20}
				color={isSelected ? color : "#9CA3AF"}
			/>
			<Text
				style={[
					styles.accountTypeText,
					isSelected && { color, fontWeight: "500" },
				]}
			>
				{name}
			</Text>
		</Pressable>
	);
}

// Main component
const SetupScreenContent: React.FC = () => {
	const { width } = useWindowDimensions();
	const isNarrowScreen = width < 380;
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const lastNameRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);
	const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const db = useDB();

	const validateStep = useCallback(
		(step: number): boolean => {
			const newErrors: Record<string, string> = {};

			if (step === 0) {
				if (!formData.firstName.trim())
					newErrors.firstName = "Please enter your first name";
				if (!formData.lastName.trim())
					newErrors.lastName = "Please enter your last name";
				if (!formData.email.trim()) {
					newErrors.email = "Please enter your email address";
				} else if (!formData.password.trim()) {
					newErrors.password = "Please enter your password";
				} else {
					const signInResult = signInSchema.safeParse({
						email: formData.email,
						password: formData.password,
					});
					if (!signInResult.success) {
						const emailError = signInResult.error.errors.find(e => e.path[0] === "email");
						if (emailError) {
							newErrors.email = emailError.message;
						}
						const passwordError = signInResult.error.errors.find(e => e.path[0] === "password");
						if (passwordError) {
							newErrors.password = passwordError.message;
						}
					}
				}
			} else if (step === 1) {
				formData.accounts.forEach((account, index) => {
					if (!account.name.trim()) {
						newErrors[`account${index}Name`] = "Please enter an account name";
					}
					if (!account.balance.trim()) {
						newErrors[`account${index}Balance`] =
							"Please enter your current balance";
					} else {
						const balanceResult = balanceSchema.safeParse(account.balance);
						if (!balanceResult.success) {
							newErrors[`account${index}Balance`] =
								balanceResult.error.errors[0].message;
						}
					}
				});
			}

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		},
		[formData],
	);

	const handleInputChange = useCallback(
		(field: keyof FormData | string, value: string, accountIndex?: number) => {
			setFormData((prev) => {
				if (typeof accountIndex === "number") {
					const newAccounts = [...prev.accounts];
					const [fieldName] = field.split(".");
					newAccounts[accountIndex] = {
						...newAccounts[accountIndex],
						[fieldName]: value,
					};
					return { ...prev, accounts: newAccounts };
				}
				return { ...prev, [field]: value };
			});

			// Clear error when user starts typing
			setErrors((prev) => {
				const newErrors = { ...prev };
				const errorKey =
					typeof accountIndex === "number"
						? `account${accountIndex}${field}`
						: field;
				delete newErrors[errorKey];
				return newErrors;
			});
		},
		[],
	);

	useEffect(() => {
		const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () =>
			setKeyboardVisible(true),
		);
		const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () =>
			setKeyboardVisible(false),
		);

		return () => {
			keyboardDidShow.remove();
			keyboardDidHide.remove();
		};
	}, []);

	const handleNext = useCallback(async () => {
		if (!validateStep(currentStep)) return;

		if (currentStep < 1) {
			setCurrentStep((prev) => prev + 1);
			return;
		}

		try {
			setLoading(true);

			// Start a transaction for all database operations
			await db.transaction(async (tx) => {
				// Create user first
				const userResult = await tx
					.insert(schema.users)
					.values({
						email: formData.email,
						password: formData.password, // TODO: Add password hashing
						firstName: formData.firstName,
						lastName: formData.lastName,
					})
					.returning();

				const userId = userResult[0].userId;

				// Create accounts
				for (const account of formData.accounts) {
					await tx.insert(schema.accounts).values({
						userId,
						accountName: account.name.trim(),
						accountType: account.type,
						balance: Number.parseFloat(account.balance),
					});
				}

				// Sign in the user
				const { signIn } = useAuth();
				await signIn({ 
					email: formData.email, 
					password: formData.password 
				});
			});

			router.replace("/(stack)");
		} catch (error) {
			console.error("Setup error:", error);
			Alert.alert(
				"Setup Failed",
				"There was an error setting up your account. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	}, [currentStep, formData, db, validateStep]);

	const renderPersonalInfo = () => (
		<View style={styles.form}>
			<Input
				label="First Name"
				placeholder="Enter your first name"
				value={formData.firstName}
				onChangeText={(value) => handleInputChange("firstName", value)}
				accessibilityLabel="First name input"
				accessibilityHint="Enter your first name"
				error={errors.firstName}
				returnKeyType="next"
				blurOnSubmit={false}
				onSubmitEditing={() => lastNameRef.current?.focus()}
			/>

			<Input
				label="Last Name"
				placeholder="Enter your last name"
				value={formData.lastName}
				onChangeText={(value) => handleInputChange("lastName", value)}
				accessibilityLabel="Last name input"
				accessibilityHint="Enter your last name"
				error={errors.lastName}
				returnKeyType="next"
				blurOnSubmit={false}
				onSubmitEditing={() => emailRef.current?.focus()}
			/>

			<Input
				label="Email"
				placeholder="Enter your email"
				value={formData.email}
				onChangeText={(value) => handleInputChange("email", value)}
				accessibilityLabel="Email input"
				accessibilityHint="Enter your email address"
				error={errors.email}
				keyboardType="email-address"
				autoCapitalize="none"
				autoComplete="email"
				returnKeyType="next"
				blurOnSubmit={false}
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>

			<Input
				label="Password"
				placeholder="Enter your password"
				value={formData.password}
				onChangeText={(value) => handleInputChange("password", value)}
				accessibilityLabel="Password input"
				accessibilityHint="Enter your password"
				error={errors.password}
				secureTextEntry
				autoCapitalize="none"
				autoComplete="password-new"
				returnKeyType="done"
				inputRef={passwordRef}
				blurOnSubmit={true}
			/>

			<Input
				label="Email Address"
				placeholder="Enter your email address"
				keyboardType="email-address"
				autoCapitalize="none"
				value={formData.email}
				onChangeText={(value) => handleInputChange("email", value)}
				accessibilityLabel="Email input"
				accessibilityHint="Enter your email address"
				error={errors.email}
				returnKeyType="done"
				inputRef={emailRef}
				onSubmitEditing={handleNext}
			/>
		</View>
	);

	const renderAccountSetup = () => (
		<View style={styles.form}>
			{formData.accounts.map((account, index) => (
				<Animated.View
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
					entering={SlideInRight.delay(index * 100)}
					style={styles.accountForm}
				>
					<View style={styles.accountHeader}>
						<MaterialCommunityIcons
							name={ACCOUNT_TYPES[account.type].icon}
							size={24}
							color={ACCOUNT_TYPES[account.type].color}
						/>
						<Text style={styles.accountLabel}>
							{ACCOUNT_TYPES[account.type].name}
						</Text>
					</View>

					<Input
						label="Account Name"
						placeholder="Enter account name"
						value={account.name}
						onChangeText={(value) => handleInputChange("name", value, index)}
						error={errors[`account${index}Name`]}
						returnKeyType="next"
					/>

					<View style={styles.accountTypeContainer}>
						{(Object.keys(ACCOUNT_TYPES) as AccountType[]).map((type) => (
							<AccountTypeButton
								key={type}
								type={type}
								isSelected={account.type === type}
								onPress={() => handleInputChange("type", type, index)}
							/>
						))}
					</View>

					<Input
						label="Current Balance"
						placeholder="Enter current balance"
						keyboardType="decimal-pad"
						value={account.balance}
						onChangeText={(value) => handleInputChange("balance", value, index)}
						error={errors[`account${index}Balance`]}
						returnKeyType="done"
					/>
				</Animated.View>
			))}
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.scrollContent}
			>
				<Animated.View
					entering={FadeInDown}
					style={[styles.content, isNarrowScreen && styles.contentNarrow]}
				>
					<View style={styles.header}>
						<Text
							style={styles.title}
							accessibilityRole="header"
							accessibilityLabel={
								currentStep === 0 ? "Welcome to Fizcal" : "Set Up Your Accounts"
							}
						>
							{currentStep === 0 ? "Welcome to Fizcal" : "Set Up Your Accounts"}
						</Text>
						<Text
							style={styles.subtitle}
							accessibilityRole="text"
							accessibilityLabel={
								currentStep === 0
									? "Let's get to know you better"
									: "Add your main accounts to get started"
							}
						>
							{currentStep === 0
								? "Let's get to know you better"
								: "Add your main accounts to get started"}
						</Text>
					</View>

					<Animated.View entering={FadeInRight} style={styles.formContainer}>
						{currentStep === 0 ? renderPersonalInfo() : renderAccountSetup()}
					</Animated.View>

					<View
						style={[
							styles.buttonContainer,
							keyboardVisible && styles.buttonContainerKeyboard,
						]}
					>
						<Pressable
							onPress={handleNext}
							disabled={loading}
							style={({ pressed }) => [
								styles.button,
								pressed && styles.buttonPressed,
								loading && styles.buttonDisabled,
							]}
							accessibilityRole="button"
							accessibilityState={{ disabled: loading }}
							accessibilityLabel={
								loading
									? "Setting up your account"
									: currentStep === 0
										? "Next step"
										: "Complete setup"
							}
						>
							<Text style={styles.buttonText}>
								{loading
									? "Setting up..."
									: currentStep === 0
										? "Next"
										: "Complete Setup"}
							</Text>
						</Pressable>
					</View>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

const SetupScreen: React.FC = () => {
	return (
		<ErrorBoundary>
			<SetupScreenContent />
		</ErrorBoundary>
	);
};

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "flex-end",
	},
	container: {
		flex: 1,
		backgroundColor: "#000000",
	},
	content: {
		flex: 1,
		padding: 24,
		paddingTop: 120, // Push content down for better reachability
	},
	contentNarrow: {
		padding: 16,
		paddingTop: 100,
	},
	header: {
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 12,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 16,
		color: "#9CA3AF",
		lineHeight: 24,
	},
	form: {
		gap: 24,
	},
	formContainer: {
		flex: 1,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#E5E7EB",
		letterSpacing: 0.1,
	},
	input: {
		height: 52,
		borderWidth: 1,
		borderColor: "#374151",
		borderRadius: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: "#FFFFFF",
		backgroundColor: "#1F2937",
	},
	inputError: {
		borderColor: "#EF4444",
		backgroundColor: "#991B1B",
	},
	errorText: {
		fontSize: 12,
		color: "#EF4444",
		marginTop: 4,
	},
	accountForm: {
		gap: 24,
		marginBottom: 32,
		backgroundColor: "#1A1A1A",
		padding: 24,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#333333",
	},
	accountLabel: {
		fontSize: 18,
		fontWeight: "600",
		color: "#FFFFFF",
		flex: 1,
	},
	accountTypeContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginTop: 8,
	},
	accountTypeButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#333333",
		backgroundColor: "#1A1A1A",
		gap: 10,
		flex: 1,
		minWidth: 150,
	},
	accountTypeText: {
		fontSize: 14,
		color: "#FFFFFF",
		flex: 1,
	},
	button: {
		overflow: "hidden",
		borderRadius: 16,
		paddingVertical: 18,
		paddingHorizontal: 28,
		alignItems: "center",
		backgroundColor: "#333333",
	},
	buttonPressed: {
		backgroundColor: "#404040",
	},
	buttonDisabled: {
		backgroundColor: "#262626",
		opacity: 0.5,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "500",
		letterSpacing: 0.5,
	},
	buttonContainer: {
		paddingTop: 32,
		paddingBottom: 24,
	},
	buttonContainerKeyboard: {
		paddingBottom: 16,
	},
	accountHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},
});

export default SetupScreen;
