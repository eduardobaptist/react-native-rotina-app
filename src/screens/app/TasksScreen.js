import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import TaskItem from '../../components/TaskItem';

export default function TasksScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTarefas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', user.id)
      .order('concluida')
      .order('created_at', { ascending: false });

    if (!error) setTarefas(data ?? []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTarefas();
    }, [fetchTarefas])
  );

  const handleToggle = async (id, concluida) => {
    const { error } = await supabase
      .from('tarefas')
      .update({ concluida })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setTarefas(prev => prev.map(t => (t.id === id ? { ...t, concluida } : t)));
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setTarefas(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEdit = (task) => {
    navigation.navigate('TaskForm', { task });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : tarefas.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Suas tarefas aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 96 + insets.bottom }]}
          renderItem={({ item }) => (
            <TaskItem
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary ?? '#FFFFFF'}
        onPress={() => navigation.navigate('TaskForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
});
