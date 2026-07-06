import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const GEOFENCE_TASK_NAME = 'proximity-geofence-task';
export const DEFAULT_RADIUS_METERS = 200;

const TASKS_CACHE_KEY = 'geofence-tasks-cache-v1';

TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.warn('[geofencing] task error', error);
    return;
  }

  const { eventType, region } = data ?? {};
  if (eventType !== Location.GeofencingEventType.Enter) return;

  try {
    const cacheRaw = await AsyncStorage.getItem(TASKS_CACHE_KEY);
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
    const task = cache[region.identifier];
    if (!task) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Você está perto de uma tarefa',
        body: task.nome_local ? `${task.titulo} · ${task.nome_local}` : task.titulo,
        data: { taskId: task.id },
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[geofencing] failed to handle enter event', err);
  }
});

export async function fetchPendingTasksWithLocation(userId) {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId)
    .eq('concluida', false)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) throw error;
  return data ?? [];
}

export async function syncGeofences(tasks) {
  const hasStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
  if (hasStarted) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
  }

  const cache = {};
  const regions = tasks.map(task => {
    cache[String(task.id)] = {
      id: task.id,
      titulo: task.titulo,
      nome_local: task.nome_local,
    };
    return {
      identifier: String(task.id),
      latitude: task.latitude,
      longitude: task.longitude,
      radius: task.raio_notificacao_metros ?? DEFAULT_RADIUS_METERS,
      notifyOnEnter: true,
      notifyOnExit: false,
    };
  });

  await AsyncStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(cache));

  if (regions.length === 0) return;

  await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
}

export async function refreshGeofences(userId) {
  try {
    const tasks = await fetchPendingTasksWithLocation(userId);
    await syncGeofences(tasks);
  } catch (err) {
    console.warn('[geofencing] failed to refresh', err);
  }
}
