import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Star, Lightbulb, Rocket } from 'lucide-react-native';
import { supabase, isSupabaseConfigured } from '../db/supabase';
import { setDemoModeActive, saveStoreSettings, getStoreSettings } from '../db/operations';
import { useTheme, ThemeColors } from '../theme/ThemeContext';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export default function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase ej konfigurerat än',
        'Lägg in EXPO_PUBLIC_SUPABASE_URL och EXPO_PUBLIC_SUPABASE_ANON_KEY i apps/mobile/.env, eller klicka på "Kör i Demo-läge" nedan för att testa appen direkt!'
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Uppgifter saknas', 'Ange både e-postadress och lösenord.');
      return;
    }

    if (isRegistering && !storeName.trim()) {
      Alert.alert('Butiksnamn saknas', 'Ange namnet på din butik.');
      return;
    }

    setLoading(true);
    try {
      await setDemoModeActive(false);

      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              store_name: storeName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          const current = await getStoreSettings();
          await saveStoreSettings({
            ...current,
            storeName: storeName.trim(),
          });
          onAuthenticated();
        } else {
          Alert.alert(
            'Konto skapat!',
            'Om e-postbekräftelse är påslaget i Supabase, klicka på länken i ditt mejl och logga sedan in.'
          );
          setIsRegistering(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;
        onAuthenticated();
      }
    } catch (err: any) {
      Alert.alert('Inloggningsfel', err.message || 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDemo = async () => {
    await setDemoModeActive(true);
    onAuthenticated();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBox}>
          <View style={styles.logoBadge}>
            <Star size={34} color="#ffffff" fill="#ffffff" />
          </View>
          <Text style={styles.appTitle}>BonusStamp</Text>
          <Text style={styles.appSubtitle}>
            Digitalt stämpelkort & bonussystem för din butik
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegistering ? 'Skapa nytt butikskonto' : 'Logga in i kassan'}
          </Text>

          {isRegistering && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Butikens namn</Text>
              <TextInput
                style={styles.input}
                placeholder="t.ex. Café Hörnan eller Salong Klipp"
                value={storeName}
                onChangeText={setStoreName}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-postadress</Text>
            <TextInput
              style={styles.input}
              placeholder="butik@exempel.se"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lösenord</Text>
            <TextInput
              style={styles.input}
              placeholder="Minst 6 tecken"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegistering ? 'Skapa butik & Logga in' : 'Logga in'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.switchModeText}>
              {isRegistering
                ? 'Har du redan ett konto? Logga in här'
                : 'Ny butik? Skapa ett butikskonto här'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isSupabaseConfigured && (
          <View style={styles.infoBanner}>
            <View style={styles.infoTitleRow}>
              <Lightbulb size={16} color={colors.primaryStrongText} />
              <Text style={styles.infoTitle}>Supabase är inte kopplat än</Text>
            </View>
            <Text style={styles.infoText}>
              Skapa en <Text style={styles.codeText}>.env</Text>-fil i{' '}
              <Text style={styles.codeText}>apps/mobile/</Text> med dina nycklar från
              Supabase och kör <Text style={styles.codeText}>supabase/schema.sql</Text>.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.demoButton} onPress={handleStartDemo}>
          <Rocket size={18} color={colors.textSecondary} />
          <Text style={styles.demoButtonText}>
            Testa i Demo-läge (sparas lokalt på enheten)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      maxWidth: 480,
      width: '100%',
      alignSelf: 'center',
    },
    headerBox: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logoBadge: {
      width: 68,
      height: 68,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    appTitle: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
    },
    appSubtitle: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 6,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: colors.surfaceInput,
      color: colors.text,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 6,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    switchModeButton: {
      marginTop: 18,
      alignItems: 'center',
      paddingVertical: 6,
    },
    switchModeText: {
      color: colors.primaryText,
      fontSize: 14,
      fontWeight: '600',
    },
    infoBanner: {
      marginTop: 20,
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
    },
    infoTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    infoText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 19,
    },
    codeText: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontWeight: '700',
    },
    demoButton: {
      marginTop: 16,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.borderInput,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    demoButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
    },
  });
