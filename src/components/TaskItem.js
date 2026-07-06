import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Checkbox, IconButton, Text, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import PriorityBadge from './PriorityBadge';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function TaskItem({ item, onToggle, onDelete, onEdit, onView }) {
  const theme = useTheme();
  const { isDark } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    setUpdating(true);
    await onToggle(item.id, !item.concluida);
    setUpdating(false);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    await onDelete(item.id);
  };

  return (
    <>
      <Pressable
        onPress={() => onView(item)}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            opacity: item.concluida ? 0.55 : 1,
          },
        ]}
      >
        <View style={styles.checkboxCol}>
          {updating ? (
            <ActivityIndicator size={20} color={theme.colors.primary} />
          ) : (
            <Checkbox
              status={item.concluida ? 'checked' : 'unchecked'}
              onPress={handleToggle}
              color={theme.colors.primary}
            />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text
              variant="titleSmall"
              numberOfLines={2}
              style={[
                styles.title,
                { color: theme.colors.onSurface },
                item.concluida && styles.strikethrough,
              ]}
            >
              {item.titulo}
            </Text>
            <PriorityBadge prioridade={item.prioridade} isDark={isDark} />
          </View>

          {!!item.descricao && (
            <Text
              variant="bodySmall"
              numberOfLines={3}
              style={[styles.descricao, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.descricao}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.metaCol}>
              {!!item.nome_local && (
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={theme.colors.onSurface}
                  />
                  <Text
                    variant="labelSmall"
                    numberOfLines={1}
                    style={[styles.locationText, { color: theme.colors.onSurface }]}
                  >
                    {item.nome_local}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionsRow}>
              <IconButton
                icon="pencil-outline"
                size={18}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={() => onEdit(item)}
                style={styles.actionBtn}
              />
              <IconButton
                icon="trash-can-outline"
                size={18}
                iconColor={theme.colors.error}
                onPress={() => setConfirmDelete(true)}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </View>
      </Pressable>

      <DeleteConfirmDialog
        visible={confirmDelete}
        onConfirm={handleDelete}
        onDismiss={() => setConfirmDelete(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 4,
    paddingRight: 12,
  },
  checkboxCol: {
    alignItems: 'center',
    marginTop: 1,
    marginRight: 4,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  descricao: {
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaCol: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
    marginBottom: -8,
  },
  actionBtn: {
    margin: 0,
  },
});
