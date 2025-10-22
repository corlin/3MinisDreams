import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const navigateToWebNotificationDemo = () => {
    navigation.navigate('WebNotificationDemo' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>个人资料</Text>
      <Text style={styles.subtitle}>管理你的个人信息和设置</Text>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
          <Text style={styles.menuItemText}>🔔 通知设置</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        {Platform.OS === 'web' && (
          <TouchableOpacity style={styles.menuItem} onPress={navigateToWebNotificationDemo}>
            <Text style={styles.menuItemText}>🌐 Web通知演示</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.menuItem}>
          <Text style={[styles.menuItemText, styles.disabledText]}>👤 个人信息</Text>
          <Text style={[styles.menuItemArrow, styles.disabledText]}>›</Text>
        </View>
        
        <View style={styles.menuItem}>
          <Text style={[styles.menuItemText, styles.disabledText]}>🎨 主题设置</Text>
          <Text style={[styles.menuItemArrow, styles.disabledText]}>›</Text>
        </View>
      </View>
      
      <Text style={styles.description}>
        其他功能即将上线，敬请期待！
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  disabledText: {
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});