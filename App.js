import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { lightTheme, darkTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef, navigateToTaskOnMap, flushPendingTaskNavigation } from './src/navigation/navigationRef';
import { useGeofenceSync } from './src/hooks/useGeofenceSync';
// Imported for its defineTask side effect so the handler is registered on every JS load,
// including headless background launches triggered by a geofence event.
import './src/services/geofencing';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function ThemedApp() {
  const { user, isDark } = useAuth();
  const theme = isDark ? darkTheme : lightTheme;

  useGeofenceSync(user?.id);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then(response => {
      const taskId = response?.notification.request.content.data?.taskId;
      if (taskId) navigateToTaskOnMap(taskId);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const taskId = response.notification.request.content.data?.taskId;
      if (taskId) navigateToTaskOnMap(taskId);
    });

    return () => subscription.remove();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer ref={navigationRef} onReady={flushPendingTaskNavigation}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
