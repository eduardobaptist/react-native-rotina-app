import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import TaskFormScreen from '../screens/app/TaskFormScreen';
import TaskDetailScreen from '../screens/app/TaskDetailScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) return <AuthStack />;

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontFamily: 'Inter_500Medium' },
      }}
    >
      <RootStack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({
          title: route.params?.task ? 'Editar tarefa' : 'Nova tarefa',
        })}
      />
      <RootStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={({ navigation, route }) => ({
          title: 'Detalhes da tarefa',
          headerRight: () => (
            <IconButton
              icon="pencil-outline"
              iconColor={theme.colors.onSurface}
              onPress={() => navigation.navigate('TaskForm', { task: route.params.task })}
            />
          ),
        })}
      />
    </RootStack.Navigator>
  );
}
