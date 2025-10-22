import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { NotificationService, NotificationSettings } from '../services/notificationService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyReminderTime: '08:00',
    reviewReminderEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await NotificationService.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await NotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      Alert.alert('成功', '设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存设置失败，请重试');
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    saveSettings(newSettings);
  };

  const handleToggleReviewReminder = (reviewReminderEnabled: boolean) => {
    const newSettings = { ...settings, reviewReminderEnabled };
    saveSettings(newSettings);
  };

  const showTimePickerAlert = () => {
    Alert.prompt(
      '设置提醒时间',
      '请输入提醒时间 (格式: HH:MM，如 08:30)',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: (time?: string) => {
            if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
              const newSettings = { ...settings, dailyReminderTime: time };
              saveSettings(newSettings);
            } else {
              Alert.alert('错误', '请输入正确的时间格式 (HH:MM)');
            }
          },
        },
      ],
      'plain-text',
      settings.dailyReminderTime
    );
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification('daily_reminder');
      Alert.alert('测试通知已发送', '请检查通知是否正常显示');
    } catch (error) {
      console.error('发送测试通知失败:', error);
      const errorMessage = error instanceof Error ? error.message : '发送测试通知失败';
      Alert.alert('错误', errorMessage);
    }
  };

  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  const viewScheduledNotifications = async () => {
    try {
      const notifications = await NotificationService.getAllScheduledNotifications();
      const count = notifications.length;
      Alert.alert(
        '已安排的通知',
        `当前有 ${count} 个通知已安排\n\n${notifications
          .map((n, i) => `${i + 1}. ${n.content.title}`)
          .join('\n')}`
      );
    } catch (error) {
      console.error('获取通知列表失败:', error);
      Alert.alert('错误', '获取通知列表失败');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>通知设置</Text>
        
        {/* 通知总开关 */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>启用通知</Text>
            <Text style={styles.settingDescription}>
              开启后将收到每日愿望记录和回顾提醒
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={settings.enabled ? COLORS.background : COLORS.textSecondary}
          />
        </View>

        {/* 每日提醒时间 */}
        <TouchableOpacity
          style={[styles.settingItem, !settings.enabled && styles.disabledItem]}
          onPress={settings.enabled ? showTimePickerAlert : undefined}
          disabled={!settings.enabled}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, !settings.enabled && styles.disabledText]}>
              每日提醒时间
            </Text>
            <Text style={[styles.settingDescription, !settings.enabled && styles.disabledText]}>
              当前设置: {settings.dailyReminderTime}
            </Text>
          </View>
          <Text style={[styles.settingValue, !settings.enabled && styles.disabledText]}>
            {settings.dailyReminderTime}
          </Text>
        </TouchableOpacity>

        {/* 回顾提醒开关 */}
        <View style={[styles.settingItem, !settings.enabled && styles.disabledItem]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, !settings.enabled && styles.disabledText]}>
              回顾提醒
            </Text>
            <Text style={[styles.settingDescription, !settings.enabled && styles.disabledText]}>
              一周后自动提醒回顾愿望实现情况
            </Text>
          </View>
          <Switch
            value={settings.reviewReminderEnabled && settings.enabled}
            onValueChange={handleToggleReviewReminder}
            disabled={!settings.enabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={settings.reviewReminderEnabled && settings.enabled ? COLORS.background : COLORS.textSecondary}
          />
        </View>

        {/* 测试功能 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>测试功能</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={sendTestNotification}
          >
            <Text style={styles.buttonText}>发送测试通知</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={viewScheduledNotifications}
          >
            <Text style={styles.buttonText}>查看已安排通知</Text>
          </TouchableOpacity>
        </View>

        {/* 说明信息 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>关于通知</Text>
          <Text style={styles.infoText}>
            • 每日提醒：在设定时间提醒您记录新的愿望{'\n'}
            • 回顾提醒：在愿望目标日期提醒您回顾实现情况{'\n'}
            • 个性化消息：每次通知都会显示不同的激励消息{'\n'}
            • 隐私保护：所有通知都在本地设备上处理
          </Text>
          
          {isExpoGo && Platform.OS === 'android' && (
            <View style={styles.warningSection}>
              <Text style={styles.warningTitle}>⚠️ 功能限制</Text>
              <Text style={styles.warningText}>
                当前在 Android Expo Go 中运行，通知功能不可用。{'\n'}
                要获得完整的通知功能，请使用：{'\n'}
                • iOS 设备或模拟器{'\n'}
                • Expo 开发构建版本{'\n'}
                • 独立应用（APK/AAB）
              </Text>
            </View>
          )}
          
          {isExpoGo && Platform.OS === 'ios' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                ℹ️ 在 iOS Expo Go 中，通知功能正常工作
              </Text>
            </View>
          )}
          
          {Platform.OS === 'web' && (
            <View style={styles.webInfoBox}>
              <Text style={styles.webInfoTitle}>🌐 Web端通知说明</Text>
              <Text style={styles.webInfoText}>
                • 支持即时通知显示{'\n'}
                • 支持延时通知（一次性）{'\n'}
                • 不支持重复通知{'\n'}
                • 需要用户授权通知权限{'\n'}
                • 浏览器标签页需要保持活跃状态
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    minHeight: 70,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: COLORS.primary,
  },
  infoButton: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
  infoSection: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  warningSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#856404',
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: '#856404',
    lineHeight: 18,
  },
  infoBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#D1ECF1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17A2B8',
  },
  infoBoxText: {
    fontSize: FONT_SIZES.sm,
    color: '#0C5460',
    lineHeight: 18,
  },
  webInfoBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#E7F3FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  webInfoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: SPACING.xs,
  },
  webInfoText: {
    fontSize: FONT_SIZES.sm,
    color: '#1565C0',
    lineHeight: 18,
  },
});