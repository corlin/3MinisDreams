import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface StoredUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'mock_auth_users';
const CURRENT_USER_KEY = 'mock_auth_current_user';

export class MockAuthService {
  private static authStateListeners: ((user: AuthUser | null) => void)[] = [];
  private static currentUser: AuthUser | null = null;

  /**
   * 初始化认证服务
   */
  static async initialize(): Promise<void> {
    try {
      const currentUserData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserData) {
        this.currentUser = JSON.parse(currentUserData);
        this.notifyAuthStateChange(this.currentUser);
      }
    } catch (error) {
      console.error('初始化认证服务失败:', error);
    }
  }

  /**
   * 用户登录
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser }> {
    try {
      const users = await this.getStoredUsers();
      const user = users.find(u => u.email === credentials.email);

      if (!user) {
        throw new Error('用户不存在，请检查邮箱地址');
      }

      if (user.password !== credentials.password) {
        throw new Error('密码错误，请重试');
      }

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: null
      };

      this.currentUser = authUser;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      this.notifyAuthStateChange(authUser);

      return { user: authUser };
    } catch (error: any) {
      throw new Error(error.message || '登录失败，请重试');
    }
  }

  /**
   * 用户注册
   */
  static async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser }> {
    try {
      const users = await this.getStoredUsers();
      
      // 检查邮箱是否已存在
      if (users.find(u => u.email === credentials.email)) {
        throw new Error('该邮箱已被注册，请使用其他邮箱');
      }

      const newUser: StoredUser = {
        uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.displayName || '用户',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      const authUser: AuthUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: null
      };

      this.currentUser = authUser;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      this.notifyAuthStateChange(authUser);

      return { user: authUser };
    } catch (error: any) {
      throw new Error(error.message || '注册失败，请重试');
    }
  }

  /**
   * 用户登出
   */
  static async signOut(): Promise<void> {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      this.notifyAuthStateChange(null);
    } catch (error: any) {
      throw new Error('登出失败，请重试');
    }
  }

  /**
   * 发送密码重置邮件（模拟）
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      const users = await this.getStoredUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('用户不存在，请检查邮箱地址');
      }

      // 模拟发送邮件
      console.log(`模拟发送密码重置邮件到: ${email}`);
    } catch (error: any) {
      throw new Error(error.message || '发送密码重置邮件失败');
    }
  }

  /**
   * 获取当前用户
   */
  static getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // 立即调用一次回调
    callback(this.currentUser);

    // 返回取消监听的函数
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * 转换为AuthUser格式
   */
  static toAuthUser(user: AuthUser): AuthUser {
    return user;
  }

  /**
   * 获取存储的用户列表
   */
  private static async getStoredUsers(): Promise<StoredUser[]> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return [];
    }
  }

  /**
   * 通知认证状态变化
   */
  private static notifyAuthStateChange(user: AuthUser | null): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('认证状态监听器错误:', error);
      }
    });
  }
}