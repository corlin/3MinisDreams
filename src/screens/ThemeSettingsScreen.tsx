import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, getColors } from '../constants';
import { AppTheme } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeOption {
  key: AppTheme;
  title: string;
  description: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'light',
    title: '浅色主题',
    description: '明亮清新的界面风格，适合白天使用',
    icon: '☀️',
  },
  {
    key: 'dark',
    title: '深色主题',
    description: '深色护眼的界面风格，适合夜晚使用',
    icon: '🌙',
  },
];

export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [saving, setSaving] = useState(false);

  const colors = getColors(theme);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleThemeSelect = (themeKey: AppTheme) => {
    setSelectedTheme(themeKey);
  };

  const handleSave = async () => {
    if (selectedTheme === theme) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      await setTheme(selectedTheme);
      Alert.alert('成功', '主题设置已更新', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('错误', '保存主题设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedTheme(theme);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>主题设置</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            选择您喜欢的界面主题
          </Text>
          
          <View style={styles.optionsContainer}>
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: selectedTheme === option.key ? colors.primary : colors.border,
                    borderWidth: selectedTheme === option.key ? 2 : 1,
                  }
                ]}
                onPress={() => handleThemeSelect(option.key)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>
                        {option.title}
                      </Text>
                      <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedTheme === option.key && (
                    <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                      <Text style={styles.selectedIcon}>✓</Text>
                    </View>
                  )}
                </View>
                
                {/* Theme Preview */}
                <View style={styles.previewContainer}>
                  <View style={[
                    styles.preview,
                    { backgroundColor: option.key === 'light' ? '#f8fafc' : '#0f172a' }
                  ]}>
                    <View style={[
                      styles.previewHeader,
                      { backgroundColor: option.key === 'light' ? '#6366f1' : '#818cf8' }
                    ]} />
                    <View style={[
                      styles.previewContent,
                      { backgroundColor: option.key === 'light' ? '#ffffff' : '#1e293b' }
                    ]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.primary },
                saving && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  optionItem: {
    borderRadius: 16,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewHeader: {
    height: 20,
    width: '100%',
  },
  previewContent: {
    flex: 1,
    margin: 4,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#ffffff',
  },
});