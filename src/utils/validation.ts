export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationUtils {
  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, error: '请输入邮箱地址' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: '请输入有效的邮箱地址' };
    }

    return { isValid: true };
  }

  /**
   * 验证密码强度
   */
  static validatePassword(password: string): ValidationResult {
    if (!password.trim()) {
      return { isValid: false, error: '请输入密码' };
    }

    if (password.length < 6) {
      return { isValid: false, error: '密码至少需要6位字符' };
    }

    return { isValid: true };
  }

  /**
   * 验证昵称
   */
  static validateDisplayName(displayName: string): ValidationResult {
    if (!displayName.trim()) {
      return { isValid: false, error: '请输入昵称' };
    }

    if (displayName.trim().length < 2) {
      return { isValid: false, error: '昵称至少需要2个字符' };
    }

    return { isValid: true };
  }

  /**
   * 验证密码确认
   */
  static validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (password !== confirmPassword) {
      return { isValid: false, error: '两次输入的密码不一致' };
    }

    return { isValid: true };
  }
}