import React, { type ErrorInfo, type ReactNode, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ErrorBoundaryClass } from "./ErrorBoundaryClass";

interface ErrorBoundaryProps {
	children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
	const [error, setError] = useState<Error | null>(null);

	const handleError = (error: Error, errorInfo: ErrorInfo) => {
		setError(error);
		// Log error to error reporting service (e.g., Sentry)
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	};

	if (error) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Something went wrong</Text>
				<Text style={styles.message}>
					{error.message || "An unexpected error occurred"}
				</Text>
			</View>
		);
	}

	return (
		<ErrorBoundaryClass onError={handleError}>{children}</ErrorBoundaryClass>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	message: {
		fontSize: 16,
		textAlign: "center",
		color: "#666",
	},
});
