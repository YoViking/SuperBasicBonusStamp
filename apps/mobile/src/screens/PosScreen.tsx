import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Platform, 
  Linking 
} from 'react-native';
import { db } from '../db/client';
import { articles } from '../db/schema';
import { processPurchase } from '../db/operations';
import { generateStatusLink } from '../services/authService';
import { InferSelectModel } from 'drizzle-orm';

type Article = InferSelectModel<typeof articles>;

export default function PosScreen() {
  const isFocused = useIsFocused();
  const [phone, setPhone] = useState('');
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [cart, setCart] = useState<Article[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await db.select().from(articles);
      setAvailableArticles(data);
    };
    if (isFocused) {
    loadData();
    }
  }, [isFocused]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const sendSms = (number: string, link: string) => {
    const msg = `Tack för ditt köp! Se din bonusstatus här: ${link}`;
    const url = `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    try {
      if (!phone || cart.length === 0) {
        Alert.alert("Info saknas", "Mata in telefonnummer och välj artiklar.");
        return;
      }

      const result = await processPurchase(phone, total);
      const link = await generateStatusLink(phone);

      Alert.alert("Köp registrerat", "Vill du skicka statuslänk via SMS?", [
        { text: "Nej", onPress: () => { setCart([]); setPhone(''); } },
        { text: "Ja, skicka SMS", onPress: () => { sendSms(phone, link); setCart([]); setPhone(''); } }
      ]);
    } catch (error: any) {
      Alert.alert("Ett fel uppstod", error.message);
    }
  }; // <-- Denna stänger handleComplete

  // HÄR SKA RETURN LIGGA, INUTI POSSCREEN
  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.phoneInput} 
        placeholder="Kundens telefonnummer" 
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>Välj artiklar:</Text>
      <FlatList 
        data={availableArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.articleCard} 
            onPress={() => setCart([...cart, item])}
          >
            <Text>{item.name}</Text>
            <Text style={{fontWeight: 'bold'}}>{item.price} kr</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Totalt: {total} kr</Text>
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Slutför köp & Skicka SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} // <-- Denna stänger hela PosScreen

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  phoneInput: { fontSize: 24, borderBottomWidth: 2, marginBottom: 30, padding: 10 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  articleCard: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footer: { borderTopWidth: 1, paddingTop: 20 },
  totalText: { fontSize: 28, fontWeight: 'bold', textAlign: 'right', marginBottom: 20 },
  button: { backgroundColor: '#28a745', padding: 20, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});