module.exports = {
  extends: [
    'expo',
    '@react-native-community',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'warn',
  },
};