import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import TasksScreen from '../screens/app/TasksScreen';
import HistoryScreen from '../screens/app/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Tasks: 'checkmark-circle-outline',
            History: 'time-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tarefas' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico' }} />
    </Tab.Navigator>
  );
}
