import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HistoryScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="time-outline" size={48} color={theme.colors.onSurfaceVariant} />
      <Text
        variant="titleMedium"
        style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
      >
        Seu histórico aparecerá aqui
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontFamily: 'Inter_400Regular',
  },
});
