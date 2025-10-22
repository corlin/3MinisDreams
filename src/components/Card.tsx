import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    // Use boxShadow for web compatibility instead of shadow* props
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    // Keep elevation for Android
    elevation: 5,
  },
});