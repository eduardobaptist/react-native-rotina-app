import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingTaskId = null;

export function navigateToTaskOnMap(taskId) {
  if (!navigationRef.isReady()) {
    pendingTaskId = taskId;
    return;
  }
  navigationRef.navigate('Drawer', {
    screen: 'MainTabs',
    params: { screen: 'Map', params: { taskId } },
  });
}

export function flushPendingTaskNavigation() {
  if (pendingTaskId == null) return;
  const taskId = pendingTaskId;
  pendingTaskId = null;
  navigateToTaskOnMap(taskId);
}
