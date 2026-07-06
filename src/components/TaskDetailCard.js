import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../context/AuthContext';

export default function TaskDetailCard({ task, hideOpenStatus }) {
  const theme = useTheme();
  const { isDark } = useAuth();

  return (
    <View style={styles.wrapper}>
      {(task.concluida || !hideOpenStatus) && (
        <View style={styles.statusRow}>
          <Ionicons
            name={task.concluida ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={task.concluida ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {task.concluida
              ? `Concluída em ${new Date(task.concluida_em).toLocaleDateString('pt-BR')}`
              : 'Aberta'}
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text
          variant="headlineSmall"
          style={[
            styles.title,
            { color: theme.colors.onSurface },
            task.concluida && styles.strikethrough,
          ]}
        >
          {task.titulo}
        </Text>
        <PriorityBadge prioridade={task.prioridade} isDark={isDark} />
      </View>

      {!!task.descricao && (
        <Text variant="bodyMedium" style={[styles.descricao, { color: theme.colors.onSurface }]}>
          {task.descricao}
        </Text>
      )}

      <Text variant="labelSmall" style={[styles.createdAt, { color: theme.colors.onSurfaceVariant }]}>
        Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
      </Text>

      {!!task.nome_local && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.onSurface} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {task.nome_local}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
    lineHeight: 20,
  },
  createdAt: {
    fontFamily: 'Inter_400Regular',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
