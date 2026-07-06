import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { distanceInMeters } from '../utils/geo';

const DEFAULT_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const NEARBY_PLACE_MAX_DISTANCE_METERS = 150;

const ANDROID_PACKAGE_NAME = 'com.eduardobaptista.rotinaapp';
// Places API is called via plain fetch, which doesn't go through the Maps SDK's native
// attestation, so a key restricted to "Android apps" rejects it unless these two headers
// are sent manually (Google's documented workaround for REST calls from a restricted app key).
// This SHA-1 is the local debug.keystore's fingerprint — it must be registered on the API
// key's Android restriction, and every other keystore (teammates, CI, release signing) needs
// its own SHA-1 added there too, or Places requests from that keystore will keep failing.
// Get it via: keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
const ANDROID_CERT_SHA1 = '5E8F16062EA3CD2C4A0D547876BAA6F38CABF625';

function buildAddressName(r) {
  if (!r) return '';
  const parts = [r.name, r.district, r.city].filter(Boolean);
  const unique = parts.filter((v, i, arr) => arr.indexOf(v) === i);
  return unique.join(', ');
}

async function resolvePlaceName(coords) {
  try {
    const url =
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json' +
      `?location=${coords.latitude},${coords.longitude}&rankby=distance&type=establishment` +
      `&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url, {
      headers:
        Platform.OS === 'android'
          ? { 'X-Android-Package': ANDROID_PACKAGE_NAME, 'X-Android-Cert': ANDROID_CERT_SHA1 }
          : undefined,
    });
    const json = await response.json();
    const nearest = json.results?.[0];

    if (nearest?.name && nearest.geometry?.location) {
      const distance = distanceInMeters(
        coords.latitude,
        coords.longitude,
        nearest.geometry.location.lat,
        nearest.geometry.location.lng
      );
      if (distance <= NEARBY_PLACE_MAX_DISTANCE_METERS) {
        return nearest.name;
      }
    }
  } catch (_) {
    // falls back to street address below
  }

  const results = await Location.reverseGeocodeAsync(coords);
  return buildAddressName(results[0]);
}

export default function LocationPickerModal({ visible, initialCoords, onConfirm, onDismiss }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initialCoords) {
      setSelected(initialCoords);
    } else {
      setSelected(null);
      handleCurrentLocation();
    }
  }, [visible]);

  function handleMapPress(e) {
    setSelected(e.nativeEvent.coordinate);
  }

  async function handleCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setSelected(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } finally {
      setLocating(false);
    }
  }

  async function handleConfirm() {
    if (!selected) return;
    setResolving(true);
    try {
      const nome_local = await resolvePlaceName(selected);
      onConfirm({ latitude: selected.latitude, longitude: selected.longitude, nome_local });
    } finally {
      setResolving(false);
    }
  }

  const region = selected
    ? { ...selected, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.outline,
              paddingTop: insets.top,
            },
          ]}
        >
          <IconButton
            icon="close"
            size={22}
            iconColor={theme.colors.onSurface}
            onPress={onDismiss}
          />
          <Text
            variant="titleMedium"
            style={[styles.headerTitle, { color: theme.colors.onSurface }]}
          >
            Selecionar local
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.hint, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {selected
              ? `Ponto selecionado · ${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`
              : 'Toque no mapa para selecionar um ponto'}
          </Text>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
        >
          {selected && <Marker coordinate={selected} />}
        </MapView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <Button
            mode="outlined"
            icon={locating ? undefined : 'crosshairs-gps'}
            onPress={handleCurrentLocation}
            loading={locating}
            disabled={locating || resolving}
            style={styles.footerBtn}
          >
            Minha localização
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            loading={resolving}
            disabled={!selected || resolving || locating}
            style={styles.footerBtn}
            labelStyle={styles.confirmLabel}
          >
            Confirmar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
  },
  headerSpacer: {
    width: 44,
  },
  hint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBtn: {
    borderRadius: 10,
  },
  confirmLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
});
