import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

function DrawerItem({ icon, label, onPress, active, theme, disabled, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.item,
        active && { backgroundColor: theme.colors.primary + '18' },
        disabled && { opacity: 0.5 },
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size={22}
          color={theme.colors.onSurfaceVariant}
          style={styles.itemIcon}
        />
      ) : (
        <Ionicons
          name={icon}
          size={22}
          color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
          style={styles.itemIcon}
        />
      )}
      <Text
        variant="bodyLarge"
        style={[
          styles.itemLabel,
          { color: active ? theme.colors.primary : theme.colors.onSurface },
          active && { fontFamily: 'Inter_600SemiBold' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function DrawerContent({ navigation, state }) {
  const { user, signOut, toggleTheme, isDark } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);

  const activeRouteName = state?.routes[state.index]?.name;

  const fullName = user?.user_metadata?.full_name ?? '';
  const firstName = fullName.split(' ')[0] || '';
  const avatarLetter = firstName.charAt(0).toUpperCase();

  function navigateToTab(screen) {
    navigation.navigate('MainTabs', { screen });
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch (_) {
      setSigningOut(false);
    }
  }

  return (
    <DrawerContentScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
    >
      <View style={[styles.profile, { borderBottomColor: theme.colors.outline }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '22' }]}>
            {avatarLetter ? (
              <Text style={[styles.avatarLetter, { color: theme.colors.primary }]}>
                {avatarLetter}
              </Text>
            ) : (
              <Ionicons name="person" size={28} color={theme.colors.primary} />
            )}
          </View>
          <View style={styles.profileInfo}>
            {firstName ? (
              <Text
                variant="titleSmall"
                style={[styles.name, { color: theme.colors.onSurface }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {firstName}
              </Text>
            ) : null}
            <Text
              variant="bodySmall"
              style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.nav}>
        <DrawerItem
          icon="checkmark-circle-outline"
          label="Tarefas"
          active={activeRouteName === 'MainTabs'}
          onPress={() => navigateToTab('Tasks')}
          theme={theme}
        />
        <DrawerItem
          icon="time-outline"
          label="Histórico"
          active={false}
          onPress={() => navigateToTab('History')}
          theme={theme}
        />
      </View>

      <View style={styles.footer}>
        <Divider style={{ backgroundColor: theme.colors.outline, marginBottom: 8 }} />

        <DrawerItem
          icon={isDark ? 'sunny-outline' : 'moon-outline'}
          label={isDark ? 'Modo claro' : 'Modo escuro'}
          active={false}
          onPress={toggleTheme}
          theme={theme}
        />

        <DrawerItem
          icon="log-out-outline"
          label="Sair"
          active={false}
          onPress={handleSignOut}
          theme={theme}
          disabled={signingOut}
          loading={signingOut}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profile: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
  },
  email: {
    fontFamily: 'Inter_400Regular',
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 2,
  },
  footer: {
    paddingHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  itemIcon: {
    marginRight: 14,
  },
  itemLabel: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
});
