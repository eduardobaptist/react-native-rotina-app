import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import TaskDetailCard from '../../components/TaskDetailCard';

export default function TaskDetailScreen({ route }) {
  const theme = useTheme();
  const task = route.params.task;
  const hasLocation = task.latitude != null && task.longitude != null;

  function handleOpenInMaps() {
    const label = encodeURIComponent(task.nome_local || task.titulo);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${task.latitude},${task.longitude}`,
      android: `geo:${task.latitude},${task.longitude}?q=${task.latitude},${task.longitude}(${label})`,
    });
    Linking.openURL(url);
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <TaskDetailCard task={task} />

      {hasLocation && (
        <Pressable onPress={handleOpenInMaps} style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: task.latitude,
              longitude: task.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            pointerEvents="none"
          >
            <Marker coordinate={{ latitude: task.latitude, longitude: task.longitude }} />
          </MapView>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: 180,
  },
});
