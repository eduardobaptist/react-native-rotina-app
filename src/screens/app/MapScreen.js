import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import TaskDetailCard from '../../components/TaskDetailCard';
import { PRIORITY_COLORS } from '../../constants/priority';

const DEFAULT_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const theme = useTheme();
  const { user, isDark } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completing, setCompleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', user.id)
      .eq('concluida', false)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (!error) setTasks(data ?? []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  async function handleCompleteTask(taskId) {
    setCompleting(true);
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ concluida: true, concluida_em: new Date().toISOString() })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (!error) {
        setSelectedTask(null);
        fetchTasks();
      }
    } finally {
      setCompleting(false);
    }
  }

  useEffect(() => {
    if (tasks.length > 0) {
      mapRef.current?.fitToCoordinates(
        tasks.map(t => ({ latitude: t.latitude, longitude: t.longitude })),
        { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
      );
    }
  }, [tasks]);

  const palette = isDark ? PRIORITY_COLORS.dark : PRIORITY_COLORS.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MapView ref={mapRef} style={styles.map} initialRegion={DEFAULT_REGION}>
        {tasks.map(task => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            pinColor={palette[task.prioridade] ?? palette.baixa}
            onPress={() => setSelectedTask(task)}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!!selectedTask && (
        <View
          style={[
            styles.popup,
            { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <IconButton
            icon="close"
            size={20}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={() => setSelectedTask(null)}
            style={styles.popupClose}
          />
          <TaskDetailCard task={selectedTask} hideOpenStatus />

          <Button
            mode="contained"
            icon="check-circle-outline"
            onPress={() => handleCompleteTask(selectedTask.id)}
            loading={completing}
            disabled={completing}
            style={styles.completeButton}
          >
            Finalizar tarefa
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 52,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  popupClose: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  completeButton: {
    borderRadius: 10,
    marginTop: 16,
  },
});
