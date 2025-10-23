import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      Alert.alert('错误', '请输入昵称');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('错误', '请输入邮箱地址');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('错误', '请输入密码');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码至少需要6位字符');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      Alert.alert('注册成功', '欢迎使用清晨梦想日记！');
      // 注册成功后会自动导航到主应用
    } catch (error: any) {
      Alert.alert('注册失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    registerButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    registerButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    registerButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    loginButton: {
      marginLeft: 5,
    },
    loginButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    passwordHint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 5,
    },
  });

  const isFormValid = displayName.trim() && email.trim() && password.trim() && 
                     confirmPassword.trim() && password === confirmPassword;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>创建账户</Text>
        <Text style={styles.subtitle}>开始您的梦想记录之旅</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>昵称</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="请输入昵称"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>邮箱地址</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱地址"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.passwordHint}>密码至少需要6位字符</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>确认密码</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="请再次输入密码"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            (!isFormValid || loading) && styles.registerButtonDisabled
          ]}
          onPress={handleRegister}
          disabled={!isFormValid || loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? '注册中...' : '注册'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>已有账户？</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}