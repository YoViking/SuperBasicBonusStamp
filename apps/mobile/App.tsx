import 'react-native-get-random-values';
import 'fast-text-encoding';

import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, isSupabaseConfigured } from './src/db/supabase';
import { isDemoModeActive, setDemoModeActive } from './src/db/operations';

import PosScreen from './src/screens/PosScreen';
import ArticleManager from './src/screens/ArticleManager';
import BonusSettingsScreen from './src/screens/BonusSettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();
const AdminTab = createMaterialTopTabNavigator();

function AdminTabs() {
  return (
    <AdminTab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#2563eb', height: 3 },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <AdminTab.Screen
        name="Bonus"
        component={BonusSettingsScreen}
        options={{ title: 'Butik & Bonusregler' }}
      />
      <AdminTab.Screen
        name="Artiklar"
        component={ArticleManager}
        options={{ title: 'Artiklar (Valfritt)' }}
      />
    </AdminTab.Navigator>
  );
}

export default function App() {
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
      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, [checkAuth]);

  const handleLogout = async () => {
    await setDemoModeActive(false);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LoginScreen onAuthenticated={checkAuth} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 19,
              fontWeight: '700',
              color: '#111827',
            },
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutBtnText}>Logga ut</Text>
              </TouchableOpacity>
            ),
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
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
            tabBarIcon: () => null,
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
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
              title: 'Kassa',
            }}
          />
          <Tab.Screen
            name="Admin"
            component={AdminTabs}
            options={{
              title: 'Inställningar',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
  },
  logoutBtn: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
});
