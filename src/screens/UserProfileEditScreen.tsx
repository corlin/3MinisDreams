import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { User } from '../types';
import { UserService } from '../services/userService';

export default function UserProfileEditScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
      setNickname(currentUser.nickname);
      setDescription(currentUser.description);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('错误', '加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '请输入昵称');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await UserService.updateUser({
        nickname: nickname.trim(),
        description: description.trim(),
      });
      
      setUser(updatedUser);
      Alert.alert('成功', '个人信息已更新', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setNickname(user.nickname);
      setDescription(user.description);
    }
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>编辑个人信息</Text>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>昵称 *</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入您的昵称"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={20}
            />
            <Text style={styles.helperText}>
              {nickname.length}/20 字符
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>个人描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="介绍一下自己，分享您的愿望和目标..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              {description.length}/200 字符
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  formSection: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
});