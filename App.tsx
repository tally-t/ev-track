import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import MapScreen from './src/screens/MapScreen';
import LogScreen from './src/screens/LogScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            headerStyle: { backgroundColor: '#fff' },
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
            tabBarActiveTintColor: '#6366f1',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#f0f0f0',
              paddingTop: 4,
            },
            tabBarIcon: ({ focused, color, size }) => {
              const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                Map: focused ? 'map' : 'map-outline',
                Log: focused ? 'add-circle' : 'add-circle-outline',
                History: focused ? 'receipt' : 'receipt-outline',
              };
              return <Ionicons name={icons[route.name]} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{ title: 'EV Stations' }}
          />
          <Tab.Screen
            name="Log"
            component={LogScreen}
            options={{ title: 'Log Session' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'History' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
