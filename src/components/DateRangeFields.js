import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

function formatDate(date) {
  return date ? date.toLocaleDateString('pt-BR') : '--/--/----';
}

export default function DateRangeFields({ from, to, onChangeFrom, onChangeTo }) {
  const theme = useTheme();
  const [iosPicker, setIosPicker] = useState(null);

  function openPicker(target) {
    const value = target === 'from' ? from : to;
    const handleChange = target === 'from' ? onChangeFrom : onChangeTo;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: 'date',
        display: 'default',
        onChange: (event, date) => {
          if (event.type === 'set' && date) handleChange(date);
        },
      });
    } else {
      setIosPicker(target);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TouchableRipple
          onPress={() => openPicker('from')}
          style={[styles.dateField, { borderColor: theme.colors.outline }]}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
            De {formatDate(from)}
          </Text>
        </TouchableRipple>
        <TouchableRipple
          onPress={() => openPicker('to')}
          style={[styles.dateField, { borderColor: theme.colors.outline }]}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
            Até {formatDate(to)}
          </Text>
        </TouchableRipple>
      </View>

      {Platform.OS === 'ios' && !!iosPicker && (
        <DateTimePicker
          value={iosPicker === 'from' ? from : to}
          mode="date"
          display="inline"
          onChange={(event, date) => {
            const handleChange = iosPicker === 'from' ? onChangeFrom : onChangeTo;
            setIosPicker(null);
            if (event.type === 'set' && date) handleChange(date);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
});
