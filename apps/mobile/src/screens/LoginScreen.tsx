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
import {
  Star,
  Lightbulb,
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react-native';
import { supabase, isSupabaseConfigured } from '../db/supabase';
import { setDemoModeActive, saveStoreSettings, getStoreSettings } from '../db/operations';
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAuthRedirectUrl } from '../services/authDeepLink';
import {
  validateLogin,
  validateRegister,
  validateOtp,
} from '../services/authValidation';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

type ScreenView = 'login' | 'verify';

export default function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [view, setView] = useState<ScreenView>('login');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Verification state
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationType, setVerificationType] = useState<'signup' | 'magiclink'>('signup');

  const [loading, setLoading] = useState(false);

  // Field change handlers that clear specific errors
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (errors.storeName) {
      setErrors((prev) => ({ ...prev, storeName: undefined }));
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleOtpChange = (val: string) => {
    setOtpCode(val);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }
  };

  const handleToggleRegister = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
  };

  // Handle password login or registration
  const handlePasswordAuth = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        t.login.supabaseNotConfiguredTitle,
        t.login.supabaseNotConfiguredMsg
      );
      return;
    }

    // Zod validation
    if (isRegistering) {
      const val = validateRegister({ storeName, email, password }, t);
      if (!val.success) {
        setErrors(val.errors);
        return;
      }
    } else {
      const val = validateLogin({ email, password }, t);
      if (!val.success) {
        setErrors(val.errors);
        return;
      }
    }

    setErrors({});
    setLoading(true);
    try {
      await setDemoModeActive(false);

      if (isRegistering) {
        const redirectUrl = getAuthRedirectUrl();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: redirectUrl,
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
          // Email confirmation is required by Supabase
          setVerificationEmail(email.trim());
          setVerificationType('signup');
          setView('verify');
          Alert.alert(t.login.accountCreatedTitle, t.login.accountCreatedMsg);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          const errMsg = error.message || '';
          if (
            errMsg.toLowerCase().includes('email not confirmed') ||
            errMsg.toLowerCase().includes('not confirmed')
          ) {
            setVerificationEmail(email.trim());
            setVerificationType('signup');
            setView('verify');
            Alert.alert(
              t.login.emailNotConfirmedTitle,
              t.login.emailNotConfirmedMsg
            );
            return;
          }
          throw error;
        }

        onAuthenticated();
      }
    } catch (err: any) {
      Alert.alert(
        t.login.authErrorTitle,
        err.message || t.login.authErrorDefault
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP code
  const handleVerifyOtp = async () => {
    const targetEmail = (verificationEmail || email).trim();

    // Zod validation for OTP
    const val = validateOtp({ email: targetEmail, otp: otpCode }, t);
    if (!val.success) {
      setErrors(val.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await setDemoModeActive(false);

      const code = otpCode.trim();
      const primaryType = verificationType === 'signup' ? 'signup' : 'email';

      let result = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: code,
        type: primaryType as any,
      });

      // Fallback in case type differs
      if (result.error) {
        const fallbackType = primaryType === 'signup' ? 'email' : 'signup';
        const fallbackResult = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: code,
          type: fallbackType as any,
        });

        if (!fallbackResult.error) {
          result = fallbackResult;
        }
      }

      if (result.error) throw result.error;

      if (result.data.session) {
        if (storeName.trim()) {
          const current = await getStoreSettings();
          await saveStoreSettings({
            ...current,
            storeName: storeName.trim(),
          });
        }
        onAuthenticated();
      } else {
        Alert.alert(t.login.accountCreatedTitle, t.login.accountCreatedMsg);
        setView('login');
      }
    } catch (err: any) {
      Alert.alert(
        t.login.authErrorTitle,
        err.message || t.login.authErrorDefault
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resending verification code
  const handleResend = async () => {
    const targetEmail = (verificationEmail || email).trim();
    if (!targetEmail) return;

    setLoading(true);
    try {
      const redirectUrl = getAuthRedirectUrl();

      if (verificationType === 'signup') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: targetEmail,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
      }

      Alert.alert(t.login.magicLinkSentTitle, t.login.codeResentMsg);
    } catch (err: any) {
      Alert.alert(
        t.login.authErrorTitle,
        err.message || t.login.authErrorDefault
      );
    } finally {
      setLoading(false);
    }
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
            <Star size={34} color="#fff" fill="#fff" />
          </View>
          <Text style={styles.appTitle}>BonusStamp</Text>
          <Text style={styles.appSubtitle}>{t.login.subtitle}</Text>
        </View>

        <View style={styles.card}>
          {view === 'login' ? (
            <>
              <Text style={styles.cardTitle}>
                {isRegistering ? t.login.registerTitle : t.login.loginTitle}
              </Text>

              {isRegistering && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.login.storeNameLabel}</Text>
                  <TextInput
                    style={[styles.input, errors.storeName && styles.inputError]}
                    placeholder={t.login.storeNamePlaceholder}
                    value={storeName}
                    onChangeText={handleStoreNameChange}
                    placeholderTextColor={colors.placeholder}
                  />
                  {errors.storeName && (
                    <Text style={styles.fieldErrorText}>{errors.storeName}</Text>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.login.emailLabel}</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={t.login.emailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholderTextColor={colors.placeholder}
                />
                {errors.email && (
                  <Text style={styles.fieldErrorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.login.passwordLabel}</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder={
                    isRegistering
                      ? t.login.passwordPlaceholder
                      : t.login.passwordLabel
                  }
                  secureTextEntry
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholderTextColor={colors.placeholder}
                />
                {errors.password && (
                  <Text style={styles.fieldErrorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePasswordAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isRegistering ? t.login.registerBtn : t.login.loginBtn}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={handleToggleRegister}
              >
                <Text style={styles.switchModeText}>
                  {isRegistering
                    ? t.login.switchToLogin
                    : t.login.switchToRegister}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setErrors({});
                  setView('login');
                }}
              >
                <ArrowLeft size={18} color={colors.textSecondary} />
                <Text style={styles.backButtonText}>{t.login.backToLogin}</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>{t.login.verifyTitle}</Text>
              <Text style={styles.cardSubtitle}>
                {t.login.verifySubtitle}
              </Text>

              <View style={styles.verifyTargetBox}>
                <Mail size={16} color={colors.primaryText} />
                <Text style={styles.verifyTargetEmail} numberOfLines={1}>
                  {verificationEmail || email}
                </Text>
              </View>

              <View style={styles.infoNoteBox}>
                <CheckCircle2 size={16} color={colors.primaryStrongText} />
                <Text style={styles.infoNoteText}>
                  {t.login.checkEmailInstruction}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.login.otpLabel}</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.otpInput,
                    errors.otp && styles.inputError,
                  ]}
                  placeholder={t.login.otpPlaceholder}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={handleOtpChange}
                  placeholderTextColor={colors.placeholder}
                />
                {errors.otp && (
                  <Text style={[styles.fieldErrorText, styles.centeredError]}>
                    {errors.otp}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t.login.verifyOtpBtn}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResend}
                disabled={loading}
              >
                <RefreshCw size={15} color={colors.primaryText} />
                <Text style={styles.resendButtonText}>
                  {t.login.resendCodeBtn}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!isSupabaseConfigured && (
          <View style={styles.infoBanner}>
            <View style={styles.infoTitleRow}>
              <Lightbulb size={16} color={colors.primaryStrongText} />
              <Text style={styles.infoTitle}>{t.login.infoBannerTitle}</Text>
            </View>
            <Text style={styles.infoText}>
              {t.login.infoBannerText1}{' '}
              <Text style={styles.codeText}>.env</Text>{' '}
              {t.login.infoBannerText2}{' '}
              <Text style={styles.codeText}>apps/mobile/</Text>{' '}
              {t.login.infoBannerText3}{' '}
              <Text style={styles.codeText}>supabase/schema.sql</Text>.
            </Text>
          </View>
        )}
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
      marginBottom: 24,
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
      marginBottom: 8,
      textAlign: 'center',
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 18,
      textAlign: 'center',
      lineHeight: 20,
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
    inputError: {
      borderColor: '#ef4444',
      borderWidth: 1.5,
    },
    fieldErrorText: {
      color: '#ef4444',
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    centeredError: {
      textAlign: 'center',
    },
    otpInput: {
      textAlign: 'center',
      fontSize: 24,
      letterSpacing: 8,
      fontWeight: '700',
    },
    verifyTargetBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primarySoft,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    verifyTargetEmail: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    infoNoteBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: colors.surfaceInput,
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoNoteText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      flex: 1,
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
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginBottom: 14,
      paddingVertical: 4,
    },
    backButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 14,
      paddingVertical: 8,
    },
    resendButtonText: {
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
  });
