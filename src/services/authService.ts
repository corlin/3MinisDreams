import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { MockAuthService } from './mockAuthService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// 配置是否使用模拟认证服务（用于开发和测试）
const USE_MOCK_AUTH = false; // 设置为 false 来使用真实的Firebase

export class AuthenticationService {
  /**
   * 用户登录
   */
  static async signIn(credentials: LoginCredentials): Promise<UserCredential> {
    if (USE_MOCK_AUTH) {
      const result = await MockAuthService.signIn(credentials);
      return result as any; // 类型转换以兼容接口
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      return userCredential;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * 用户注册
   */
  static async signUp(credentials: RegisterCredentials): Promise<UserCredential> {
    if (USE_MOCK_AUTH) {
      const result = await MockAuthService.signUp(credentials);
      return result as any; // 类型转换以兼容接口
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // 如果提供了显示名称，更新用户资料
      if (credentials.displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName
        });
      }

      return userCredential;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * 用户登出
   */
  static async signOut(): Promise<void> {
    if (USE_MOCK_AUTH) {
      await MockAuthService.signOut();
      return;
    }

    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('登出失败，请重试');
    }
  }

  /**
   * 发送密码重置邮件
   */
  static async resetPassword(email: string): Promise<void> {
    if (USE_MOCK_AUTH) {
      await MockAuthService.resetPassword(email);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * 获取当前用户
   */
  static getCurrentUser(): User | null {
    if (USE_MOCK_AUTH) {
      return MockAuthService.getCurrentUser() as any;
    }
    return auth.currentUser;
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (USE_MOCK_AUTH) {
      return MockAuthService.onAuthStateChanged(callback as any);
    }
    return onAuthStateChanged(auth, callback);
  }

  /**
   * 转换Firebase用户为应用用户格式
   */
  static toAuthUser(user: User): AuthUser {
    if (USE_MOCK_AUTH) {
      return MockAuthService.toAuthUser(user as any);
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  /**
   * 获取友好的错误消息
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '用户不存在，请检查邮箱地址';
      case 'auth/wrong-password':
        return '密码错误，请重试';
      case 'auth/email-already-in-use':
        return '该邮箱已被注册，请使用其他邮箱';
      case 'auth/weak-password':
        return '密码强度不够，请使用至少6位字符';
      case 'auth/invalid-email':
        return '邮箱格式不正确';
      case 'auth/user-disabled':
        return '该账户已被禁用';
      case 'auth/too-many-requests':
        return '请求过于频繁，请稍后再试';
      case 'auth/network-request-failed':
        return '网络连接失败，请检查网络设置';
      default:
        return '认证失败，请重试';
    }
  }
}