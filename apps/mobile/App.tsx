import 'react-native-get-random-values';
import 'fast-text-encoding';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Store, Settings } from 'lucide-react-native';
import { supabase, isSupabaseConfigured } from './src/db/supabase';
import { isDemoModeActive, setDemoModeActive } from './src/db/operations';
import { ThemeProvider, useTheme, ThemeColors } from './src/theme/ThemeContext';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';

import PosScreen from './src/screens/PosScreen';
import ArticleManager from './src/screens/ArticleManager';
import BonusSettingsScreen from './src/screens/BonusSettingsScreen';
import ShopifySettingsScreen from './src/screens/ShopifySettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import { handleAuthUrl } from './src/services/authDeepLink';

const Tab = createBottomTabNavigator();
const AdminTab = createMaterialTopTabNavigator();

function AdminTabs({ onLogout }: { onLogout: () => Promise<void> }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <AdminTab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12.5, fontWeight: '700', textTransform: 'none' },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <AdminTab.Screen
        name="Bonus"
        component={BonusSettingsScreen}
        options={{ title: t.tabs.bonusSms }}
      />
      <AdminTab.Screen
        name="Artiklar"
        component={ArticleManager}
        options={{ title: t.tabs.articles }}
      />
      <AdminTab.Screen
        name="Shopify"
        component={ShopifySettingsScreen}
        options={{ title: t.tabs.shopify }}
      />
      <AdminTab.Screen
        name="App"
        options={{ title: t.tabs.app }}
      >
        {() => <AppSettingsScreen onLogout={onLogout} />}
      </AdminTab.Screen>
    </AdminTab.Navigator>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const demo = await isDemoModeActive();
      if (demo) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(Boolean(data.session));
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(Boolean(session));
      });

      // Handle deep links when app is launched or receives URL
      const processDeepLink = async (url: string | null) => {
        if (!url) return;
        try {
          const result = await handleAuthUrl(url);
          if (result.handled) {
            if (result.success) {
              await checkAuth();
            } else if (result.error) {
              Alert.alert(t.login.authErrorTitle, result.error);
            }
          }
        } catch (err: any) {
          console.warn('Deep link error:', err);
        }
      };

      // Check initial launch URL
      Linking.getInitialURL()
        .then(processDeepLink)
        .catch(() => {});

      // Listen for incoming deep links while app is open
      const linkSub = Linking.addEventListener('url', (event) => {
        processDeepLink(event.url);
      });

      return () => {
        listener.subscription.unsubscribe();
        linkSub.remove();
      };
    }
  }, [checkAuth, t]);

  const handleLogout = useCallback(async () => {
    await setDemoModeActive(false);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  }, []);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [isDark, colors]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen onAuthenticated={checkAuth} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 19,
              fontWeight: '700',
              color: colors.text,
            },
            tabBarActiveTintColor: colors.primaryText,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelPosition: 'beside-icon',
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            },
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: '700',
            },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              elevation: 4,
              shadowOpacity: 0.08,
              height: 64,
              paddingTop: 8,
              paddingBottom: 12,
            },
          }}
        >
          <Tab.Screen
            name="Kassa"
            component={PosScreen}
            options={{
              title: t.tabs.pos,
              tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Admin"
            options={{
              title: t.tabs.settings,
              tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            }}
          >
            {() => <AdminTabs onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
  });
