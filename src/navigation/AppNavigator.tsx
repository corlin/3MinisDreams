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
import SettingsScreen from '../screens/SettingsScreen';
import WebNotificationDemoScreen from '../screens/WebNotificationDemoScreen';

export type TabParamList = {
  WishEntry: undefined;
  WishList: undefined;
  Review: undefined;
  ProfileStack: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  WebNotificationDemo: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '个人资料' }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '通知设置' }}
      />
      <ProfileStack.Screen 
        name="WebNotificationDemo" 
        component={WebNotificationDemoScreen}
        options={{ title: 'Web通知演示' }}
      />
    </ProfileStack.Navigator>
  );
}

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
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="WishEntry" 
        component={WishEntryScreen}
        options={{ 
          title: '记录愿望',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen 
        name="WishList" 
        component={WishListScreen}
        options={{ 
          title: '愿望列表',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{ 
          title: '成就回顾',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen 
        name="ProfileStack" 
        component={ProfileStackNavigator}
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