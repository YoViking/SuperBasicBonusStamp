import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { addArticle, updateArticle, deleteArticle } from '../db/operations';
import { db } from '../db/client';
import { articles } from '../db/schema';

export default function ArticleManager() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedType, setSelectedType] = useState('COLOR');
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

  const loadArticles = async () => {
    const data = await db.select().from(articles);
    setSavedArticles(data);
  };

  useEffect(() => { loadArticles(); }, []);

  const handleSaveArticle = async () => {
    if (!sku || !name || !price) {
      Alert.alert("Info saknas", "Fyll i alla fält (SKU, Namn, Pris).");
      return;
    }

    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, sku, name, parseFloat(price), selectedType);
        Alert.alert("Uppdaterad!", "Artikeln har sparats.");
      } else {
        await addArticle(sku, name, parseFloat(price), selectedType);
        Alert.alert("Sparat!", "Ny artikel har lagts till.");
      }
      setSku(''); setName(''); setPrice('');
      setEditingArticleId(null);
      loadArticles();
    } catch (error: any) {
      Alert.alert("Fel", error.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingArticleId(item.id);
    setSku(item.sku);
    setName(item.name);
    setPrice(item.price.toString());
    setSelectedType(item.category || 'COLOR');
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      "Radera artikel",
      `Är du säker på att du vill ta bort ${item.name}?`,
      [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Ja, ta bort", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteArticle(item.id);
              if (editingArticleId === item.id) {
                setSku(''); setName(''); setPrice(''); setEditingArticleId(null);
              }
              loadArticles();
            } catch (error: any) {
              Alert.alert("Fel vid radering", error.message);
            }
          }
        }
      ]
    );
  };

  const cancelEdit = () => {
    setSku(''); setName(''); setPrice('');
    setEditingArticleId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>
          {editingArticleId ? "Redigera artikel" : "Lägg till ny artikel"}
        </Text>
        
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleButton, selectedType === 'COLOR' && styles.toggleActiveColor]} 
            onPress={() => setSelectedType('COLOR')}>
            <Text style={[styles.toggleText, selectedType === 'COLOR' && styles.toggleTextActive]}>FÄRGFILM</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, selectedType === 'BW' && styles.toggleActiveBW]} 
            onPress={() => setSelectedType('BW')}>
            <Text style={[styles.toggleText, selectedType === 'BW' && styles.toggleTextActive]}>SVARTVIT FILM</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="SKU (t.ex. PORTRA-400)" value={sku} onChangeText={setSku} />
        <TextInput style={styles.input} placeholder="Namn (t.ex. Kodak Portra 400)" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Pris" value={price} onChangeText={setPrice} keyboardType="numeric" />
        
        <TouchableOpacity 
          style={[styles.button, editingArticleId && { backgroundColor: '#28a745' }]} 
          onPress={handleSaveArticle}
        >
          <Text style={styles.buttonText}>
            {editingArticleId ? "Uppdatera Artikel" : "Spara Artikel"}
          </Text>
        </TouchableOpacity>

        {editingArticleId && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
            <Text style={styles.cancelButtonText}>Avbryt redigering</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const brand = item.name.split(' ')[0];
          return (
            <View style={styles.row}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.sku} - {item.name}</Text>
                <Text style={styles.itemSub}>Märke: {brand} | Kat: {item.category}</Text>
                <Text style={styles.itemPrice}>{item.price} kr</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Text style={styles.editButtonText}>Redigera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteButtonText}>Ta bort</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  toggleButton: { flex: 1, padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  toggleActiveColor: { backgroundColor: '#f6b518', borderColor: '#f6b518' },
  toggleActiveBW: { backgroundColor: '#333', borderColor: '#333' },
  toggleText: { fontWeight: 'bold', color: '#555' },
  toggleTextActive: { color: '#fff' },

  input: { borderBottomWidth: 1, marginBottom: 15, padding: 5, borderColor: '#ddd' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  cancelButton: { marginTop: 10, padding: 10, alignItems: 'center' },
  cancelButtonText: { color: '#dc3545', fontWeight: 'bold' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#666', marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#000', marginTop: 4 },
  
  actionButtons: { flexDirection: 'row', gap: 10 },
  editButton: { backgroundColor: '#ffc107', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  editButtonText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  deleteButton: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});