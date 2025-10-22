import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, getColors } from '../constants';
import { User } from '../types';
import { UserService } from '../services/userService';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = getColors(theme);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const navigateToWebNotificationDemo = () => {
    navigation.navigate('WebNotificationDemo' as never);
  };

  const navigateToUserProfileEdit = () => {
    navigation.navigate('UserProfileEdit' as never);
  };

  const navigateToThemeSettings = () => {
    navigation.navigate('ThemeSettings' as never);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* User Info Section */}
        <View style={[styles.userInfoSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.nickname?.charAt(0) || '用'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.nickname || '愿望追梦人'}
            </Text>
            <Text style={[styles.userDescription, { color: colors.textSecondary }]}>
              {user?.description || '每天记录愿望，追求更好的自己'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>设置</Text>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={navigateToUserProfileEdit}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>👤 个人信息</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={navigateToThemeSettings}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>🎨 主题设置</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={navigateToSettings}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>🔔 通知设置</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          
          {Platform.OS === 'web' && (
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: colors.surface }]} 
              onPress={navigateToWebNotificationDemo}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>🌐 Web通知演示</Text>
              <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>关于应用</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            清晨梦想日记帮助您建立每日愿望记录和实现习惯，通过正向激励促进个人成长。
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            版本 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  userDescription: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  menuContainer: {
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});