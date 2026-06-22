import React from 'react';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

export default function DeleteConfirmDialog({ visible, onConfirm, onDismiss }) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title style={{ color: theme.colors.onSurface }}>
          Excluir tarefa
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor={theme.colors.onSurfaceVariant}>
            Cancelar
          </Button>
          <Button onPress={onConfirm} textColor={theme.colors.error}>
            Excluir
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
