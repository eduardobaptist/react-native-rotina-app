import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';

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
      {/* Adicione aqui as telas de criar/editar. Exemplo:
      <RootStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Nova tarefa' }}
      />
      <RootStack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ title: 'Editar tarefa' }}
      />
      */}
    </RootStack.Navigator>
  );
}
