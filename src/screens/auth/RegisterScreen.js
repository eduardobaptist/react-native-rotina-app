import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const SUPABASE_ERRORS = {
  'User already registered': 'Este e-mail já está cadastrado',
  'Password should be at least 6 characters': 'Senha deve ter ao menos 6 caracteres',
  'Unable to validate email address': 'E-mail inválido',
  'signup_disabled': 'Cadastro desabilitado no momento',
};

function mapError(message) {
  for (const [key, value] of Object.entries(SUPABASE_ERRORS)) {
    if (message.includes(key)) return value;
  }
  return message;
}

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = 'Nome é obrigatório';
    if (!email.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'E-mail inválido';
    if (!password) errors.password = 'Senha é obrigatória';
    else if (password.length < 6) errors.password = 'Senha deve ter ao menos 6 caracteres';
    if (!confirmPassword) errors.confirmPassword = 'Confirme sua senha';
    else if (password !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    setAuthError('');
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (err) {
      setAuthError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  }

  function clearFieldError(field) {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setAuthError('');
    setSuccessMessage('');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Criar conta
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Preencha os dados para se cadastrar
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={text => { setName(text); clearFieldError('name'); }}
            autoCapitalize="words"
            autoCorrect={false}
            mode="outlined"
            style={styles.input}
            error={!!fieldErrors.name}
          />
          <HelperText type="error" visible={!!fieldErrors.name} style={styles.helperText}>
            {fieldErrors.name}
          </HelperText>

          <TextInput
            label="E-mail"
            value={email}
            onChangeText={text => { setEmail(text); clearFieldError('email'); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.input}
            error={!!fieldErrors.email}
          />
          <HelperText type="error" visible={!!fieldErrors.email} style={styles.helperText}>
            {fieldErrors.email}
          </HelperText>

          <TextInput
            label="Senha"
            value={password}
            onChangeText={text => { setPassword(text); clearFieldError('password'); }}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            error={!!fieldErrors.password}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(v => !v)}
              />
            }
          />
          <HelperText type="error" visible={!!fieldErrors.password} style={styles.helperText}>
            {fieldErrors.password}
          </HelperText>

          <TextInput
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={text => { setConfirmPassword(text); clearFieldError('confirmPassword'); }}
            secureTextEntry={!showConfirm}
            mode="outlined"
            style={styles.input}
            error={!!fieldErrors.confirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirm ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirm(v => !v)}
              />
            }
          />
          <HelperText type="error" visible={!!fieldErrors.confirmPassword} style={styles.helperText}>
            {fieldErrors.confirmPassword}
          </HelperText>

          {authError ? (
            <HelperText type="error" visible style={[styles.helperText, styles.feedback]}>
              {authError}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Cadastrar
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Já tem uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text
              variant="bodyMedium"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
  },
  form: {},
  helperText: {
    paddingHorizontal: 0,
  },
  input: {
    fontFamily: 'Inter_400Regular',
  },
  feedback: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  link: {
    fontFamily: 'Inter_600SemiBold',
  },
});
