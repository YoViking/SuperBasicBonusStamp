import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme, ThemeColors, ThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGE_OPTIONS } from '../i18n/translations';

interface AppSettingsScreenProps {
  onLogout: () => Promise<void>;
}

export default function AppSettingsScreen({ onLogout }: AppSettingsScreenProps) {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const themeOptions: { mode: ThemeMode; label: string; desc: string; emoji: string }[] = [
    {
      mode: 'light',
      label: t.appSettings.lightLabel,
      desc: t.appSettings.lightDesc,
      emoji: '☀️',
    },
    {
      mode: 'dark',
      label: t.appSettings.darkLabel,
      desc: t.appSettings.darkDesc,
      emoji: '🌙',
    },
    {
      mode: 'system',
      label: t.appSettings.systemLabel,
      desc: t.appSettings.systemDesc,
      emoji: '📱',
    },
  ];

  const confirmLogout = () => {
    Alert.alert(
      t.appSettings.logoutConfirmTitle,
      t.appSettings.logoutConfirmMessage,
      [
        { text: t.appSettings.cancel, style: 'cancel' },
        {
          text: t.appSettings.logoutBtn,
          style: 'destructive',
          onPress: () => {
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* UTSEENDE / TEMA */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>{t.appSettings.themeTitle}</Text>
        <Text style={styles.helperText}>{t.appSettings.themeHelper}</Text>

        <View style={styles.themeRow}>
          {themeOptions.map((opt) => {
            const active = themeMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[styles.modeCard, active && styles.modeCardActive]}
                onPress={() => setThemeMode(opt.mode)}
              >
                <Text style={styles.modeEmoji}>{opt.emoji}</Text>
                <Text
                  style={[styles.modeTitle, active && styles.modeTitleActive]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.modeDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SPRÅK */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>{t.appSettings.languageTitle}</Text>
        <Text style={styles.helperText}>{t.appSettings.languageHelper}</Text>

        <View style={styles.gridRow}>
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = language === opt.code;
            return (
              <TouchableOpacity
                key={opt.code}
                style={[styles.langCard, active && styles.modeCardActive]}
                onPress={() => setLanguage(opt.code)}
              >
                <Text style={styles.modeEmoji}>{opt.flag}</Text>
                <Text
                  style={[styles.modeTitle, active && styles.modeTitleActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* KONTO & SESSION */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>{t.appSettings.accountTitle}</Text>
        <Text style={styles.helperText}>{t.appSettings.accountHelper}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutButtonText}>{t.appSettings.logoutBtn}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 18,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionHeader: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    helperText: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 14,
    },
    themeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    modeCard: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.surfaceInput,
      alignItems: 'center',
    },
    langCard: {
      flexGrow: 1,
      minWidth: '45%',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceInput,
      alignItems: 'center',
    },
    modeCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    modeEmoji: {
      fontSize: 24,
      marginBottom: 6,
    },
    modeTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    modeTitleActive: {
      color: colors.primaryStrongText,
    },
    modeDesc: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 15,
    },
    logoutButton: {
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: colors.dangerText,
      fontSize: 16,
      fontWeight: '700',
    },
  });
