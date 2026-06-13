import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { addArticle } from '../db/operations';
import { db } from '../db/client';
import { articles } from '../db/schema';

export default function ArticleManager() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  const loadArticles = async () => {
    const data = await db.select().from(articles);
    setSavedArticles(data);
  };

  useEffect(() => { loadArticles(); }, []);

  const handleAddArticle = async () => {
    try {
      await addArticle(sku, name, parseFloat(price));
      Alert.alert("Sparat!");
      setSku(''); setName(''); setPrice('');
      loadArticles();
    } catch (error: any) {
      Alert.alert("Fel", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Lägg till ny artikel</Text>
        <TextInput style={styles.input} placeholder="SKU" value={sku} onChangeText={setSku} />
        <TextInput style={styles.input} placeholder="Namn" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Pris" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onPress={handleAddArticle}>
          <Text style={styles.buttonText}>Spara Artikel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.sku}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.sku} - {item.name}</Text>
            <Text style={{fontWeight: 'bold'}}>{item.price} kr</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 5 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#eee' }
});