import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import {
  testWebNotificationSupport,
  requestWebNotificationPermission,
  sendTestWebNotification,
  scheduleDelayedWebNotification,
} from '../utils/testWebNotifications';
import {
  runNotificationDiagnostics,
  printDiagnosticsReport,
  testNotificationWithDiagnostics,
} from '../utils/webNotificationDiagnostics';

export default function WebNotificationDemoScreen() {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [delayedNotificationId, setDelayedNotificationId] = useState<number | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      checkNotificationSupport();
    }
  }, []);

  const checkNotificationSupport = () => {
    const supported = testWebNotificationSupport();
    setNotificationSupported(supported);
    
    if (supported && typeof window !== 'undefined') {
      setPermissionGranted(Notification.permission === 'granted');
    }
    
    // 运行诊断
    const diagnosticResults = runNotificationDiagnostics();
    setDiagnostics(diagnosticResults);
  };

  const handleRequestPermission = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '此功能仅在Web端可用');
      return;
    }

    const granted = await requestWebNotificationPermission();
    setPermissionGranted(granted);
    
    if (granted) {
      Alert.alert('成功', '通知权限已授予！');
    } else {
      Alert.alert('失败', '通知权限被拒绝');
    }
  };

  const handleSendTestNotification = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '此功能仅在Web端可用');
      return;
    }

    // 先运行诊断测试
    const success = await testNotificationWithDiagnostics(
      '清晨梦想日记',
      '🌐 这是一个Web端测试通知！'
    );
    
    if (success) {
      Alert.alert('成功', '测试通知已发送！请查看浏览器控制台了解详细信息。');
    } else {
      Alert.alert('失败', '发送通知失败，请查看浏览器控制台了解详细信息。');
    }
  };

  const handleRunDiagnostics = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '此功能仅在Web端可用');
      return;
    }

    printDiagnosticsReport();
    const diagnosticResults = runNotificationDiagnostics();
    setDiagnostics(diagnosticResults);
    
    Alert.alert(
      '诊断完成', 
      `发现 ${diagnosticResults.issues.length} 个问题。请查看浏览器控制台了解详细信息。`
    );
  };

  const handleScheduleDelayedNotification = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '此功能仅在Web端可用');
      return;
    }

    const timeoutId = scheduleDelayedWebNotification(
      '延时通知测试',
      '⏰ 这是一个5秒后显示的通知！',
      5000
    );
    
    if (timeoutId) {
      setDelayedNotificationId(timeoutId);
      Alert.alert('成功', '延时通知已安排，将在5秒后显示');
    } else {
      Alert.alert('失败', '安排延时通知失败');
    }
  };

  const handleCancelDelayedNotification = () => {
    if (delayedNotificationId) {
      clearTimeout(delayedNotificationId);
      setDelayedNotificationId(null);
      Alert.alert('成功', '延时通知已取消');
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Web端通知演示</Text>
          <Text style={styles.errorText}>
            此功能仅在Web端可用。{'\n'}
            请在浏览器中打开应用来测试通知功能。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Web端通知演示</Text>
        
        {/* 支持状态 */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>浏览器支持状态</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Notification API:</Text>
            <Text style={[styles.statusValue, notificationSupported ? styles.success : styles.error]}>
              {notificationSupported ? '✅ 支持' : '❌ 不支持'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>通知权限:</Text>
            <Text style={[styles.statusValue, permissionGranted ? styles.success : styles.warning]}>
              {permissionGranted ? '✅ 已授予' : '⚠️ 未授予'}
            </Text>
          </View>
        </View>

        {/* 权限管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>权限管理</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRequestPermission}
            disabled={!notificationSupported || permissionGranted}
          >
            <Text style={styles.buttonText}>
              {permissionGranted ? '权限已授予' : '请求通知权限'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 通知测试 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知测试</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleSendTestNotification}
            disabled={!permissionGranted}
          >
            <Text style={styles.buttonText}>发送诊断测试通知</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.diagnosticButton]}
            onPress={handleRunDiagnostics}
          >
            <Text style={styles.buttonText}>运行通知诊断</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.delayButton]}
            onPress={handleScheduleDelayedNotification}
            disabled={!permissionGranted || delayedNotificationId !== null}
          >
            <Text style={styles.buttonText}>
              {delayedNotificationId ? '延时通知已安排' : '安排延时通知 (5秒)'}
            </Text>
          </TouchableOpacity>

          {delayedNotificationId && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelDelayedNotification}
            >
              <Text style={styles.buttonText}>取消延时通知</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 诊断结果 */}
        {diagnostics && (
          <View style={styles.diagnosticsSection}>
            <Text style={styles.sectionTitle}>诊断结果</Text>
            
            {diagnostics.issues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>⚠️ 发现的问题:</Text>
                {diagnostics.issues.map((issue: string, index: number) => (
                  <Text key={index} style={styles.issueText}>• {issue}</Text>
                ))}
              </View>
            )}
            
            {diagnostics.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>💡 建议:</Text>
                {diagnostics.recommendations.map((rec: string, index: number) => (
                  <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                ))}
              </View>
            )}
            
            {diagnostics.issues.length === 0 && (
              <Text style={styles.successText}>✅ 未发现明显问题，通知功能应该正常工作</Text>
            )}
          </View>
        )}

        {/* 说明信息 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Web端通知说明</Text>
          <Text style={styles.infoText}>
            • 需要用户手动授权通知权限{'\n'}
            • 支持即时通知和延时通知{'\n'}
            • 不支持重复通知（每日提醒）{'\n'}
            • 浏览器标签页需要保持活跃状态{'\n'}
            • 通知会在8秒后自动关闭{'\n'}
            • 如果通知未显示，请运行诊断工具{'\n'}
            • 生产环境需要HTTPS协议{'\n'}
            • 移动浏览器支持有限
          </Text>
        </View>

        {/* 故障排除 */}
        <View style={styles.troubleshootSection}>
          <Text style={styles.troubleshootTitle}>🔧 故障排除</Text>
          <Text style={styles.troubleshootText}>
            如果通知未显示，请检查：{'\n'}
            1. 浏览器是否支持通知API{'\n'}
            2. 通知权限是否已授予{'\n'}
            3. 页面是否在前台且有焦点{'\n'}
            4. 系统和浏览器通知设置{'\n'}
            5. 是否使用HTTPS或localhost{'\n'}
            {'\n'}
            详细排查指南请查看开发者文档。
          </Text>
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
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statusSection: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  statusValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  success: {
    color: '#28a745',
  },
  warning: {
    color: '#ffc107',
  },
  error: {
    color: '#dc3545',
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  diagnosticButton: {
    backgroundColor: '#6f42c1',
  },
  delayButton: {
    backgroundColor: '#17a2b8',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
  infoSection: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: '#E7F3FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: '#1565C0',
    lineHeight: 20,
  },
  diagnosticsSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  issuesContainer: {
    marginBottom: SPACING.md,
  },
  issuesTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: SPACING.xs,
  },
  issueText: {
    fontSize: FONT_SIZES.sm,
    color: '#E65100',
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
  recommendationsContainer: {
    marginBottom: SPACING.md,
  },
  recommendationsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    fontSize: FONT_SIZES.sm,
    color: '#F57C00',
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: '#2E7D32',
    fontWeight: '600',
  },
  troubleshootSection: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  troubleshootTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: SPACING.sm,
  },
  troubleshootText: {
    fontSize: FONT_SIZES.sm,
    color: '#E65100',
    lineHeight: 20,
  },
});