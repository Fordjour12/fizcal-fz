import { Stack } from "expo-router";

export default function AccountsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Accounts",
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "New Account",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Account Details",
        }}
      />
    </Stack>
  );
}
