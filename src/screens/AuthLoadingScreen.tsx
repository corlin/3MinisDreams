import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants';

export default function AuthLoadingScreen() {
  const { theme } = useTheme();
  const colors = getColors(theme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 30,
    },
    loader: {
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>清晨梦想日记</Text>
      <Text style={styles.subtitle}>正在加载...</Text>
      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={styles.loader}
      />
    </View>
  );
}