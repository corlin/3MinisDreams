import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIrhOulBUAJmRt7EBw0fe3OnqjDrp3dV4",
  authDomain: "morning-dream-diary.firebaseapp.com",
  projectId: "threeeminisdreams",
  storageBucket: "morning-dream-diary.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with platform-specific persistence
let auth: Auth;

if (Platform.OS === 'web') {
  // Web environment - use default getAuth
  auth = getAuth(app);
} else {
  // React Native environment - use AsyncStorage persistence
  try {
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Fallback to web auth if React Native auth fails
    console.warn('React Native auth initialization failed, falling back to web auth:', error);
    auth = getAuth(app);
  }
}

export { auth };
export default app;