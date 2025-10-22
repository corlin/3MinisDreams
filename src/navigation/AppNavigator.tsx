import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WishEntryScreen from '../screens/WishEntryScreen';
import ReviewScreen from '../screens/ReviewScreen';

import WishListScreen from '../screens/WishListScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  WishEntry: undefined;
  WishList: undefined;
  Review: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
        },
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="WishEntry" 
        component={WishEntryScreen}
        options={{ 
          title: '记录愿望',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text>
        }}
      />
      <Tab.Screen 
        name="WishList" 
        component={WishListScreen}
        options={{ 
          title: '愿望列表',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>
        }}
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{ 
          title: '成就回顾',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: '个人资料',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}