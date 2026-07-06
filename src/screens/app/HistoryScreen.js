import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import TaskItem from '../../components/TaskItem';
import SelectFilter from '../../components/SelectFilter';
import DateRangeFields from '../../components/DateRangeFields';
import HistorySectionHeader from '../../components/HistorySectionHeader';
import { getPriorityFilterOptions } from '../../constants/priority';
import { endOfDay, groupByDate, startOfDay, startOfMonth, startOfWeek } from '../../utils/date';

const PERIOD_OPTIONS = [
  { value: 'semana', label: 'Essa semana' },
  { value: 'mes', label: 'Esse mês' },
  { value: 'personalizado', label: 'Personalizado' },
];

export default function HistoryScreen({ navigation }) {
  const theme = useTheme();
  const { user, isDark } = useAuth();
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [period, setPeriod] = useState('semana');
  const [customFrom, setCustomFrom] = useState(startOfWeek());
  const [customTo, setCustomTo] = useState(endOfDay());

  const dateRange = useMemo(() => {
    if (period === 'semana') return { from: startOfWeek(), to: endOfDay() };
    if (period === 'mes') return { from: startOfMonth(), to: endOfDay() };
    return { from: customFrom, to: customTo };
  }, [period, customFrom, customTo]);

  const fetchHistorico = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const todayStart = startOfDay().toISOString();

    let query = supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', user.id)
      .eq('concluida', true)
      .lt('concluida_em', todayStart);

    if (priorityFilter !== 'todas') {
      query = query.eq('prioridade', priorityFilter);
    }
    if (dateRange.from) {
      query = query.gte('concluida_em', startOfDay(dateRange.from).toISOString());
    }
    if (dateRange.to) {
      query = query.lte('concluida_em', endOfDay(dateRange.to).toISOString());
    }

    const { data, error } = await query.order('concluida_em', { ascending: false });

    if (!error) setSections(groupByDate(data ?? [], 'concluida_em'));
    if (!silent) setLoading(false);
  }, [user, priorityFilter, dateRange]);

  useFocusEffect(
    useCallback(() => {
      fetchHistorico();
    }, [fetchHistorico])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistorico({ silent: true });
    setRefreshing(false);
  }, [fetchHistorico]);

  const handleToggle = async (id, concluida) => {
    const { error } = await supabase
      .from('tarefas')
      .update({ concluida, concluida_em: concluida ? new Date().toISOString() : null })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchHistorico();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchHistorico();
    }
  };

  const handleEdit = (task) => {
    navigation.navigate('TaskForm', { task });
  };

  const handleView = (task) => {
    navigation.navigate('TaskDetail', { task });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <SelectFilter
              label="Prioridade"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={getPriorityFilterOptions(isDark)}
            />
          </View>
          <View style={styles.filterItem}>
            <SelectFilter label="Período" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
          </View>
        </View>

        {period === 'personalizado' && (
          <DateRangeFields
            from={customFrom}
            to={customTo}
            onChangeFrom={setCustomFrom}
            onChangeTo={date => setCustomTo(endOfDay(date))}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
            { paddingBottom: 24 + insets.bottom },
          ]}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <HistorySectionHeader label={section.title} />}
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
              <Ionicons name="time-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {priorityFilter !== 'todas'
                  ? 'Nenhuma tarefa encontrada com esses filtros'
                  : 'Nenhuma tarefa concluída nesse período'}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  filtersRow: {
    flexDirection: 'row',
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
    paddingHorizontal: 16,
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
