import React from 'react';
import { Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';



export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 20,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 10,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#007AFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="budgets/[id]"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
        }}
      />
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
