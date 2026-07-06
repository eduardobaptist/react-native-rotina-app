import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export async function ensureProximityPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return false;

  await Location.requestBackgroundPermissionsAsync();
  await Notifications.requestPermissionsAsync();

  return true;
}
