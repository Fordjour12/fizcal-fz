import { Stack } from "expo-router";
import React from "react";

export default function BudgetsLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: 'All Budgets',
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					title: 'New Budget',
					presentation: 'modal',
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: false,
				}}
			/>	
		</Stack>
	);
} 