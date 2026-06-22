import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, HelperText, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import PrioritySelector from '../../components/PrioritySelector';
import LocationPickerModal from '../../components/LocationPickerModal';

const SUPABASE_ERRORS = {
  'violates row-level security': 'Sem permissão para realizar esta ação',
};

function mapError(message) {
  for (const [key, value] of Object.entries(SUPABASE_ERRORS)) {
    if (message.includes(key)) return value;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export default function TaskFormScreen({ route, navigation }) {
  const theme = useTheme();
  const { user } = useAuth();
  const task = route.params?.task ?? null;
  const isEdit = !!task;

  const [titulo, setTitulo] = useState(task?.titulo ?? '');
  const [descricao, setDescricao] = useState(task?.descricao ?? '');
  const [prioridade, setPrioridade] = useState(task?.prioridade ?? 'baixa');
  const [concluida, setConcluida] = useState(task?.concluida ?? false);
  const [nomeLocal, setNomeLocal] = useState(task?.nome_local ?? '');
  const [latitude, setLatitude] = useState(task?.latitude ?? null);
  const [longitude, setLongitude] = useState(task?.longitude ?? null);
  const [mapVisible, setMapVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const hasCoords = latitude !== null && longitude !== null;

  function validate() {
    const errors = {};
    if (!titulo.trim()) errors.titulo = 'Título é obrigatório';
    else if (titulo.trim().length > 200) errors.titulo = 'Título deve ter no máximo 200 caracteres';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function clearFieldError(field) {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setSubmitError('');
  }

  function handleLocalChange(text) {
    setNomeLocal(text);
    if (!text.trim()) {
      setLatitude(null);
      setLongitude(null);
    } else if (hasCoords) {
      setLatitude(null);
      setLongitude(null);
    }
  }

  function handleLocationConfirm({ latitude: lat, longitude: lng, nome_local: nome }) {
    setLatitude(lat);
    setLongitude(lng);
    setNomeLocal(nome);
    setMapVisible(false);
  }

  function handleClearLocation() {
    setNomeLocal('');
    setLatitude(null);
    setLongitude(null);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      prioridade,
      nome_local: nomeLocal.trim() || null,
      latitude: nomeLocal.trim() ? (latitude ?? null) : null,
      longitude: nomeLocal.trim() ? (longitude ?? null) : null,
    };

    try {
      let error;
      if (isEdit) {
        ({ error } = await supabase
          .from('tarefas')
          .update({ ...payload, concluida })
          .eq('id', task.id)
          .eq('user_id', user.id));
      } else {
        ({ error } = await supabase
          .from('tarefas')
          .insert({ ...payload, user_id: user.id }));
      }

      if (error) {
        setSubmitError(mapError(error.message));
      } else {
        navigation.goBack();
      }
    } catch (err) {
      setSubmitError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <TextInput
              label="Título"
              value={titulo}
              onChangeText={text => { setTitulo(text); clearFieldError('titulo'); }}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.titulo}
              autoCapitalize="sentences"
              autoCorrect={false}
            />
            <HelperText type="error" visible={!!fieldErrors.titulo} style={styles.helperText}>
              {fieldErrors.titulo}
            </HelperText>

            <TextInput
              label="Descrição"
              value={descricao}
              onChangeText={text => { setDescricao(text); clearFieldError('descricao'); }}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
            />
            
            <PrioritySelector value={prioridade} onChange={setPrioridade} />

            <View style={styles.locationGroup}>
              <TextInput
                label="Local"
                value={nomeLocal}
                onChangeText={handleLocalChange}
                mode="outlined"
                style={[styles.input, styles.locationInput]}
                placeholder="Selecione no mapa ou digite"
                right={
                  nomeLocal
                    ? <TextInput.Icon icon="close-circle-outline" onPress={handleClearLocation} />
                    : <TextInput.Icon icon="map-marker-outline" onPress={() => setMapVisible(true)} />
                }
              />
              {hasCoords ? (
                <HelperText type="info" visible style={styles.helperText}>
                  {`Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
                </HelperText>
              ) : (
                <View style={styles.locationHint}>
                  <Text style={[styles.locationHintText, { color: theme.colors.onSurfaceVariant }]}>
                    Toque no ícone{' '}
                  </Text>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={[styles.locationHintText, { color: theme.colors.onSurfaceVariant }]}>
                    {' '}para selecionar um local
                  </Text>
                </View>
              )}
            </View>

            {isEdit && (
              <View
                style={[
                  styles.switchRow,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outline,
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[styles.switchLabel, { color: theme.colors.onSurface }]}
                >
                  Marcar como concluída
                </Text>
                <Switch
                  value={concluida}
                  onValueChange={setConcluida}
                  color={theme.colors.primary}
                />
              </View>
            )}

            {!!submitError && (
              <HelperText type="error" visible style={[styles.helperText, styles.submitError]}>
                {submitError}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {isEdit ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={mapVisible}
        initialCoords={hasCoords ? { latitude, longitude } : null}
        onConfirm={handleLocationConfirm}
        onDismiss={() => setMapVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  form: {
    gap: 0,
  },
  input: {
    fontFamily: 'Inter_400Regular',
  },
  helperText: {
    paddingHorizontal: 0,
  },
  locationGroup: {},
  locationInput: {
    marginTop: 16,
  },
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 0,
  },
  locationHintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  switchLabel: {
    fontFamily: 'Inter_400Regular',
  },
  submitError: {
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
