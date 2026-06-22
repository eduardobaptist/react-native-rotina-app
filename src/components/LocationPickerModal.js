import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ActivityIndicator, Button, IconButton, Text, useTheme } from 'react-native-paper';

const DEFAULT_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

function buildLocalName(r) {
  if (!r) return '';
  const parts = [r.name, r.district, r.city].filter(Boolean);
  const unique = parts.filter((v, i, arr) => arr.indexOf(v) === i);
  return unique.join(', ');
}

export default function LocationPickerModal({ visible, initialCoords, onConfirm, onDismiss }) {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSelected(initialCoords ?? null);
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
      const results = await Location.reverseGeocodeAsync(selected);
      const nome_local = buildLocalName(results[0]);
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
            { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline },
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
            { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline },
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
