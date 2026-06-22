import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const SUPABASE_ERRORS = {
  'Invalid login credentials': 'E-mail ou senha inválidos',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar',
  'Too many requests': 'Muitas tentativas. Aguarde e tente novamente',
  'User not found': 'Usuário não encontrado',
};

function mapError(message) {
  for (const [key, value] of Object.entries(SUPABASE_ERRORS)) {
    if (message.includes(key)) return value;
  }
  return message;
}

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'E-mail inválido';
    if (!password) errors.password = 'Senha é obrigatória';
    else if (password.length < 6) errors.password = 'Senha deve ter ao menos 6 caracteres';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setAuthError('');
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setAuthError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  }

  function clearFieldError(field) {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setAuthError('');
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
            Entrar
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Acesse sua conta para continuar
          </Text>
        </View>

        <View style={styles.form}>
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
            autoCapitalize="none"
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

          <HelperText type="error" visible={!!authError} style={[styles.helperText, styles.authError]}>
            {authError}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Entrar
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Não tem uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text
              variant="bodyMedium"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Cadastre-se
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
  form: {
    gap: 0,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    marginBottom: 0,
  },
  helperText: {
    paddingHorizontal: 0,
  },
  authError: {
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
