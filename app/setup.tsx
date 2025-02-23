import * as schema from "@/db/schema";
import useDB from "@/hooks/useDB";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface SetupStep {
  title: string;
  subtitle: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: "text" | "currency";
    keyboardType?: "default" | "numeric" | "email-address";
  }>;
}

const SETUP_STEPS: SetupStep[] = [
  {
    title: "Let's get started",
    subtitle: "First, tell us about yourself",
    fields: [
      { key: "firstName", label: "First Name", placeholder: "John" },
      { key: "lastName", label: "Last Name", placeholder: "Doe" },
      { key: "email", label: "Email", placeholder: "john@example.com", keyboardType: "email-address" },
    ],
  },
  {
    title: "Set up your accounts",
    subtitle: "Add your main accounts to get started",
    fields: [
      { key: "checkingName", label: "Checking Account Name", placeholder: "Main Checking" },
      { key: "checkingBalance", label: "Current Balance", placeholder: "0.00", type: "currency", keyboardType: "numeric" },
      { key: "savingsName", label: "Savings Account Name", placeholder: "Emergency Fund" },
      { key: "savingsBalance", label: "Current Balance", placeholder: "0.00", type: "currency", keyboardType: "numeric" },
    ],
  },
];

export default function SetupAccountScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
    checkingName: "",
    checkingBalance: "",
    savingsName: "",
    savingsBalance: "",
  });
	const [accountName, setAccountName] = useState<string>("");
	const [initialBalance, setInitialBalance] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const db = useDB();

	const { user } = useAuth();

	const router = useRouter();

	const handleNext = async () => {
		const UUID = Crypto.randomUUID();
		try {
			setLoading(true);
			// Save the account data (e.g., call to local DB or state management)
			const accountData = {
				id: UUID,
				type: accountType,
				name: accountName,
				balance: Number.parseFloat(initialBalance),
			};

			// drizzleDB.insert(accounts).
			const insertAccount = await drizzleDB.insert(schema.accounts).values({
				userId: String(user?.id),
				...accountData,
			});

			// Here you would typically save to your storage solution
			console.log("Saving account:", insertAccount.lastInsertRowId);

			// Navigate to dashboard with initial state
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error creating account:", error);
			// Here you might want to show an error message to the user
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Let's Get Started!</Text>
				<Text style={styles.subtitle}>
					Tell us about your first account. This will help you track your
					finances effortlessly.
				</Text>
				<TextInput
					style={styles.input}
					placeholder="e.g., My Savings Account, Mobile Wallet"
					placeholderTextColor="#94A3B8"
					value={accountName}
					onChangeText={setAccountName}
				/>
				<TextInput
					style={styles.input}
					placeholder="Bank, Mobile Money, or Other"
					placeholderTextColor="#94A3B8"
					value={accountType}
					onChangeText={setAccountType}
				/>
				<TextInput
					style={styles.input}
					placeholder="e.g., 500.00"
					placeholderTextColor="#94A3B8"
					keyboardType="numeric"
					value={initialBalance}
					onChangeText={setInitialBalance}
				/>
				<Text style={styles.helperText}>
					Don't worry; you can always add more accounts later.
				</Text>
				<Pressable
					onPress={handleNext}
					disabled={!accountName || !initialBalance || loading}
					style={({ pressed }) => [
						{
							opacity:
								!accountName || !initialBalance || loading
									? 0.5
									: pressed
										? 0.8
										: 1,
						},
					]}
				>
					<LinearGradient
						colors={["#8B5CF6", "#6366F1"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.button}
					>
						<Text style={styles.buttonText}>
							{loading ? "Loading..." : "Start Tracking"}
						</Text>
					</LinearGradient>
				</Pressable>
			</View>
		</View>
	);
}

  const db = useDB();

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Create user
      const userId = Crypto.randomUUID();
      await db.insert(schema.users).values({
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      // Create checking account
      const checkingId = Crypto.randomUUID();
      await db.insert(schema.accounts).values({
        accountId: checkingId,
        userId,
        accountName: formData.checkingName,
        accountType: "checking",
        balance: parseFloat(formData.checkingBalance),
      });

      // Create savings account
      const savingsId = Crypto.randomUUID();
      await db.insert(schema.accounts).values({
        accountId: savingsId,
        userId,
        accountName: formData.savingsName,
        accountType: "savings",
        balance: parseFloat(formData.savingsBalance),
      });

      router.replace("/");
    }
  };

  const currentStepData = SETUP_STEPS[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        </View>

        <View style={styles.form}>
          {currentStepData.fields.map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#666"
                value={formData[field.key]}
                onChangeText={(value) => handleInputChange(field.key, value)}
                keyboardType={field.keyboardType || "default"}
              />
            </View>
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === SETUP_STEPS.length - 1 ? "Finish" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
	container: {
    flex: 1,
    backgroundColor: "#000",
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 16,
		color: "#94A3B8",
		marginBottom: 32,
		lineHeight: 24,
	},
	input: {
		backgroundColor: "rgba(148, 163, 184, 0.1)",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		color: "#FFFFFF",
		fontSize: 16,
	},
	helperText: {
		color: "#64748B",
		fontSize: 14,
		textAlign: "center",
		marginTop: 8,
		marginBottom: 24,
	},
	button: {
		paddingVertical: 16,
		borderRadius: 12,
		elevation: 2,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
	},
});
