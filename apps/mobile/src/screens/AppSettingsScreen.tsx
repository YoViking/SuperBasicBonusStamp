import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Sun, Moon, Smartphone, LogOut } from 'lucide-react-native';
import { useTheme, ThemeColors, ThemeMode } from '../theme/ThemeContext';

interface AppSettingsScreenProps {
  onLogout: () => Promise<void>;
}

export default function AppSettingsScreen({ onLogout }: AppSettingsScreenProps) {
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    desc: string;
    Icon: typeof Sun;
  }[] = [
    {
      mode: 'light',
      label: 'Ljust',
      desc: 'Klassiskt ljust utseende',
      Icon: Sun,
    },
    {
      mode: 'dark',
      label: 'Mörkt',
      desc: 'Skonsamt i mörkare miljö',
      Icon: Moon,
    },
    {
      mode: 'system',
      label: 'System',
      desc: 'Följer enhetens inställning',
      Icon: Smartphone,
    },
  ];

  const confirmLogout = () => {
    Alert.alert('Logga ut', 'Är du säker på att du vill logga ut från kassan?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logga ut',
        style: 'destructive',
        onPress: () => {
          onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* UTSEENDE / TEMA */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Utseende (Tema)</Text>
        <Text style={styles.helperText}>
          Välj om appen ska visas i ljust läge, mörkt läge eller följa enhetens systeminställning.
        </Text>

        <View style={styles.themeRow}>
          {themeOptions.map((opt) => {
            const active = themeMode === opt.mode;
            const IconComponent = opt.Icon;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[styles.modeCard, active && styles.modeCardActive]}
                onPress={() => setThemeMode(opt.mode)}
              >
                <View style={styles.modeIconWrapper}>
                  <IconComponent
                    size={24}
                    color={
                      active ? colors.primaryStrongText : colors.textSecondary
                    }
                  />
                </View>
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

      {/* KONTO & SESSION */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Konto</Text>
        <Text style={styles.helperText}>
          Avsluta din nuvarande session eller byt butikskonto.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <LogOut size={18} color={colors.dangerText} />
          <Text style={styles.logoutButtonText}>Logga ut</Text>
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
    modeCard: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.surfaceInput,
      alignItems: 'center',
    },
    modeCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    modeIconWrapper: {
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
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    logoutButtonText: {
      color: colors.dangerText,
      fontSize: 16,
      fontWeight: '700',
    },
  });
