import 'react-native-get-random-values';
import webCrypto from 'expo-standard-web-crypto';

// Polyfill global.crypto safely using defineProperty to bypass read-only restrictions
try {
  Object.defineProperty(globalThis, 'crypto', {
    value: webCrypto,
    configurable: true,
    enumerable: true,
    writable: true,
  });
  Object.defineProperty(global, 'crypto', {
    value: webCrypto,
    configurable: true,
    enumerable: true,
    writable: true,
  });
} catch (e) {
  console.error("Failed to polyfill crypto:", e);
}

import React, { useEffect } from 'react';
import { Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'; // NY
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { db } from './src/db/client';
import 'fast-text-encoding';

// Importera dina skärmar
import PosScreen from './src/screens/PosScreen';
import ArticleManager from './src/screens/ArticleManager'; // Ändrat namn från AdminScreen
import BonusSettingsScreen from './src/screens/BonusSettingsScreen'; // NY

const Tab = createBottomTabNavigator();
const AdminTab = createMaterialTopTabNavigator(); // NY: För flikarna i toppen

// --- NY KOMPONENT: Under-flikar för Admin ---
function AdminTabs() {
  return (
    <AdminTab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#007bff' },
      }}
    >
      <AdminTab.Screen
        name="Artiklar"
        component={ArticleManager}
        options={{ title: 'Hantera Artiklar' }}
      />
      <AdminTab.Screen
        name="Bonus"
        component={BonusSettingsScreen}
        options={{ title: 'Bonusregler' }}
      />
    </AdminTab.Navigator>
  );
}

export default function App() {

  useEffect(() => {
    async function setupDb() {
      try {
        await db.run(
          `CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            price REAL NOT NULL
          );`
        );

        // Safe migration: Add category column if it doesn't exist
        try {
          await db.run(`ALTER TABLE articles ADD COLUMN category TEXT NOT NULL DEFAULT 'Färgfilm';`);
          console.log("Added category column to articles table");
        } catch (e) {
          // Column already exists, ignore
        }


        await db.run(
          `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    current_balance REAL DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- <--- LÄGG TILL DENNA RAD
  );`
        );

        await db.run(
          `CREATE TABLE IF NOT EXISTS bonus_settings (
            id INTEGER PRIMARY KEY,
            threshold REAL NOT NULL,
            reward_amount REAL NOT NULL,
            bonus_message TEXT NOT NULL
          );`
        );

        await db.run(
          `CREATE TABLE IF NOT EXISTS sales_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            articleId INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );

        console.log("Databasen och alla tabeller är redo!");
      } catch (e) {
        console.error("Kunde inte initiera databasen", e);
      }
    }
    setupDb();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e5e5',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333333',
            },
            headerLeft: () => (
              <Image
                source={require('./assets/logo.png')}
                style={{ width: 100, height: 32, marginLeft: 15, resizeMode: 'contain' }}
              />
            ),
            tabBarActiveTintColor: '#4188d8',
            tabBarInactiveTintColor: '#888888',
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: 'bold',
            },
            tabBarIconStyle: { display: 'none' },
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: 50,
            }
          }}
        >
          <Tab.Screen
            name="Kassa"
            component={PosScreen}
            options={{ title: 'Kassa' }}
          />
          {/* HÄR ÄR ÄNDRINGEN: Vi använder AdminTabs istället för AdminScreen */}
          <Tab.Screen
            name="Admin"
            component={AdminTabs}
            options={{ title: 'Inställningar' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}