import React from 'react';
import { Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          headerShown: false,
        }}
      />
      <Stack.Screen name='categories' options={{
        title: 'Category',
        headerShown:false
      }}/>
      <Stack.Screen
        name="transactions"
        options={{
          title: 'Transactions',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
}
