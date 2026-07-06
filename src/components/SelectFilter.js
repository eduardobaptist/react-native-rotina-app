import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SelectFilter({ label, value, onChange, options, icon }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const selected = options.find(option => option.value === value) ?? options[0];
  const selectedColor = selected.color ?? theme.colors.onSurface;

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text variant="labelSmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => setVisible(true)}
            style={[styles.trigger, { borderColor: theme.colors.outline }]}
            borderless
          >
            <View style={styles.triggerContent}>
              {!!selected.color && <View style={[styles.dot, { backgroundColor: selected.color }]} />}
              {!!icon && !selected.color && (
                <Ionicons name={icon} size={14} color={theme.colors.onSurfaceVariant} />
              )}
              <Text variant="labelMedium" numberOfLines={1} style={[styles.triggerLabel, { color: selectedColor }]}>
                {selected.label}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }
      >
        {options.map(option => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setVisible(false);
            }}
            title={option.label}
            titleStyle={option.color ? { color: option.color } : undefined}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    marginLeft: 2,
  },
  trigger: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  triggerLabel: {
    flexShrink: 1,
    fontFamily: 'Inter_500Medium',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
