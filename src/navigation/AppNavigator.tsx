import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import WishEntryScreen from '../screens/WishEntryScreen';
import ReviewScreen from '../screens/ReviewScreen';
import WishListScreen from '../screens/WishListScreen';
import WishDetailScreen from '../screens/WishDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WebNotificationDemoScreen from '../screens/WebNotificationDemoScreen';
import UserProfileEditScreen from '../screens/UserProfileEditScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

export type TabParamList = {
  WishEntry: undefined;
  WishStack: undefined;
  Review: undefined;
  ProfileStack: undefined;
};

export type WishStackParamList = {
  WishList: undefined;
  WishDetail: { wishId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  WebNotificationDemo: undefined;
  UserProfileEdit: undefined;
  ThemeSettings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const WishStack = createStackNavigator<WishStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function WishStackNavigator() {
  return (
    <WishStack.Navigator
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
      <WishStack.Screen 
        name="WishList" 
        component={WishListScreen}
        options={{ title: '愿望列表' }}
      />
      <WishStack.Screen 
        name="WishDetail" 
        component={WishDetailScreen}
        options={{ title: '愿望详情' }}
      />
    </WishStack.Navigator>
  );
}

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
      <ProfileStack.Screen 
        name="UserProfileEdit" 
        component={UserProfileEditScreen}
        options={{ title: '编辑个人信息' }}
      />
      <ProfileStack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen}
        options={{ title: '主题设置' }}
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
        name="WishStack" 
        component={WishStackNavigator}
        options={{ 
          title: '愿望列表',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
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

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}