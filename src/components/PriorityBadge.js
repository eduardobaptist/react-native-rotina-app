import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants/priority';

export default function PriorityBadge({ prioridade, isDark }) {
  const palette = isDark ? PRIORITY_COLORS.dark : PRIORITY_COLORS.light;
  const color = palette[prioridade] ?? palette.baixa;

  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>
        {PRIORITY_LABELS[prioridade] ?? prioridade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    fontWeight: '600',
  },
});
