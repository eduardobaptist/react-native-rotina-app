import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TasksScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.onSurfaceVariant} />
      <Text
        variant="titleMedium"
        style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
      >
        Suas tarefas aparecerão aqui
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
