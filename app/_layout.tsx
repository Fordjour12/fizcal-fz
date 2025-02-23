import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Suspense, useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { ActivityIndicator } from "react-native";

import migrations from "@/drizzle/migrations";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { StatusBar } from "expo-status-bar";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(stack)/",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

const DBNAME = "fizcal.db";
const expoDB = openDatabaseSync(DBNAME);

function RootLayoutNav() {
	const colorScheme = useColorScheme();

	const db = drizzle(expoDB);

	useDrizzleStudio(expoDB);

	const { success, error } = useMigrations(db, migrations);

	if (error) {
		console.error("Migrations error:", error);
	}

	useEffect(() => {
		if (success) {
			// you can add some dummy data here for development purposes
			console.log("Migrations completed");
		}
	}, [success]);

	return (
		<Suspense fallback={<ActivityIndicator />}>
			<SQLiteProvider
				databaseName={DBNAME}
				options={{ enableChangeListener: true }}
				useSuspense={true}
			>
				<ThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					<Stack>
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="(stack)" options={{ headerShown: false }} />
						<Stack.Screen name="modal" options={{ presentation: "modal" }} />
					</Stack>
				</ThemeProvider>
				<StatusBar style={colorScheme === "dark" ? "light" : "auto"} />
			</SQLiteProvider>
		</Suspense>
	);
}
