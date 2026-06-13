import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { addArticle, saveSettings } from '../db/operations';
import { db } from '../db/client';
import { articles } from '../db/schema';

export default function AdminScreen() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [savedArticles, setSavedArticles] = useState<any[]>([]); // Lista för att visa artiklar

  // Funktion för att hämta alla artiklar från DB
  const loadArticles = async () => {
    try {
      const data = await db.select().from(articles);
      setSavedArticles(data);
    } catch (err) {
      console.error("Kunde inte ladda artiklar", err);
    }
  };

  // Ladda artiklar när vi öppnar skärmen
  useEffect(() => {
    loadArticles();
  }, []);

  const handleAddArticle = async () => {
    try {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) return Alert.alert("Fel", "Ange ett pris");

      await addArticle(sku, name, numericPrice);
      Alert.alert("Succé!", `Artikeln ${name} har sparats.`);
      
      // Rensa fält och ladda om listan
      setSku('');
      setName('');
      setPrice('');
      loadArticles(); 
    } catch (error: any) {
      Alert.alert("Fel vid sparning", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin - Inställningar</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Lägg till Artikel</Text>
        <TextInput style={styles.input} placeholder="SKU" value={sku} onChangeText={setSku} />
        <TextInput style={styles.input} placeholder="Namn" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Pris (kr)" value={price} onChangeText={setPrice} keyboardType="numeric" />
        
        <TouchableOpacity style={styles.button} onPress={handleAddArticle}>
          <Text style={styles.buttonText}>Spara Artikel</Text>
        </TouchableOpacity>
      </View>

      {/* NYTT: Lista som visar vad som finns i databasen */}
      <Text style={[styles.label, { marginTop: 20 }]}>Sparade Artiklar:</Text>
      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.sku}
        renderItem={({ item }) => (
          <View style={styles.articleRow}>
            <Text style={styles.articleText}>{item.sku} - {item.name}</Text>
            <Text style={styles.articlePrice}>{item.price} kr</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 8 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  articleRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  articleText: { fontSize: 16 },
  articlePrice: { fontWeight: 'bold' }
});