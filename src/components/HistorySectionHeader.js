import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function HistorySectionHeader({ label }) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <Text
        variant="labelLarge"
        style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
  },
  line: {
    height: 1,
  },
});
