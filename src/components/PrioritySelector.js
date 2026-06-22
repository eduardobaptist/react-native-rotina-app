import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Text, useTheme } from 'react-native-paper';

const BUTTONS = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta',  label: 'Alta'  },
];

export default function PrioritySelector({ value, onChange }) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        Prioridade
      </Text>
      <SegmentedButtons
        value={value}
        onValueChange={onChange}
        buttons={BUTTONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    marginLeft: 4,
  },
});
