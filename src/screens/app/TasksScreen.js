import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import TaskItem from '../../components/TaskItem';
import SelectFilter from '../../components/SelectFilter';
import { getPriorityFilterOptions } from '../../constants/priority';
import { startOfDay } from '../../utils/date';

const STATUS_OPTIONS = [
  { value: 'todas', label: 'Todos' },
  { value: 'abertas', label: 'Abertas' },
  { value: 'concluidas', label: 'Concluídas hoje' },
];

export default function TasksScreen({ navigation }) {
  const theme = useTheme();
  const { user, isDark } = useAuth();
  const insets = useSafeAreaInsets();
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [priorityFilter, setPriorityFilter] = useState('todas');

  const fetchTarefas = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const todayStart = startOfDay().toISOString();

    let query = supabase.from('tarefas').select('*').eq('user_id', user.id);

    if (statusFilter === 'abertas') {
      query = query.eq('concluida', false);
    } else if (statusFilter === 'concluidas') {
      query = query.eq('concluida', true).gte('concluida_em', todayStart);
    } else {
      query = query.or(
        `concluida.eq.false,and(concluida.eq.true,concluida_em.gte.${todayStart})`
      );
    }

    if (priorityFilter !== 'todas') {
      query = query.eq('prioridade', priorityFilter);
    }

    const { data, error } = await query
      .order('concluida')
      .order('created_at', { ascending: false });

    if (!error) setTarefas(data ?? []);
    if (!silent) setLoading(false);
  }, [user, statusFilter, priorityFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchTarefas();
    }, [fetchTarefas])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTarefas({ silent: true });
    setRefreshing(false);
  }, [fetchTarefas]);

  const handleToggle = async (id, concluida) => {
    const { error } = await supabase
      .from('tarefas')
      .update({ concluida, concluida_em: concluida ? new Date().toISOString() : null })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchTarefas();
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

  const handleView = (task) => {
    navigation.navigate('TaskDetail', { task });
  };

  const isFiltered = statusFilter !== 'todas' || priorityFilter !== 'todas';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        </View>
        <View style={styles.filterItem}>
          <SelectFilter
            label="Prioridade"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={getPriorityFilterOptions(isDark)}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            tarefas.length === 0 && styles.listEmpty,
            { paddingBottom: 96 + insets.bottom },
          ]}
          renderItem={({ item }) => (
            <TaskItem
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {isFiltered ? 'Nenhuma tarefa encontrada com esses filtros' : 'Suas tarefas aparecerão aqui'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  filterItem: {
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
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
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
