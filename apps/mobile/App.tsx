import React, { useEffect } from 'react';
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
            headerStyle: { backgroundColor: '#f8f9fa' },
            tabBarActiveTintColor: '#007bff',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen 
            name="Kassa" 
            component={PosScreen} 
            options={{ title: 'Kassa 📸' }}
          />
          {/* HÄR ÄR ÄNDRINGEN: Vi använder AdminTabs istället för AdminScreen */}
          <Tab.Screen 
            name="Admin" 
            component={AdminTabs} 
            options={{ title: 'Inställningar ⚙️' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}