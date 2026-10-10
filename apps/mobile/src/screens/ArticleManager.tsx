import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { addArticle, updateArticle, deleteArticle } from '../db/operations';
import { db } from '../db/client';
import { articles } from '../db/schema';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function ArticleManager() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedType, setSelectedType] = useState('COLOR');
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerOpen(false);
    const cleaned = scannedCode.trim();
    setSku(cleaned);
    Alert.alert("Streckkod avläst!", `SKU sattes till: ${cleaned}`);
  };

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
      setIsFormVisible(false);
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
    setIsFormVisible(true);
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
    setIsFormVisible(false);
  };

  const filteredArticles = savedArticles.filter(item => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = item.name?.toLowerCase().includes(q);
    const skuMatch = item.sku?.toLowerCase().includes(q);
    const catMatch = item.category?.toLowerCase().includes(q);
    return nameMatch || skuMatch || catMatch;
  });

  return (
    <View style={styles.container}>
      {/* SÖKFÄLT OCH KNAPP FÖR NY ARTIKEL */}
      <View style={styles.topActionsRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Sök artikel (namn, SKU, kategori)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.toggleFormButton, isFormVisible && styles.toggleFormButtonActive]}
          onPress={() => {
            if (editingArticleId) {
              cancelEdit();
            } else {
              setIsFormVisible(!isFormVisible);
            }
          }}
        >
          <Text style={styles.toggleFormButtonText}>
            {editingArticleId ? "Avbryt" : isFormVisible ? "Dölj formulär" : "＋ Ny artikel"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÄR FÖR ATT SKAPA / REDIGERA ARTIKEL */}
      {isFormVisible && (
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

          <View style={styles.skuRow}>
            <TextInput
              style={[styles.input, styles.skuInput]}
              placeholder="SKU / Streckkod (t.ex. 7310...)"
              value={sku}
              onChangeText={setSku}
            />
            <TouchableOpacity
              style={styles.skuScanBtn}
              onPress={() => setIsScannerOpen(true)}
            >
              <Text style={styles.skuScanBtnText}>📷 Scanna</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Namn (t.ex. Kodak Portra 400)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Pris"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={[styles.button, editingArticleId ? { backgroundColor: '#28a745' } : null]} 
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
      )}

      {/* ARTIKELLISTA */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "Inga artiklar matchade din sökning." : "Inga artiklar sparade än."}
            </Text>
          </View>
        }
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

      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scanna artikelns streckkod"
        subtitle="Rikta kameran mot streckkoden på förpackningen"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fafafa' },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#222',
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchBtnText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  toggleFormButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleFormButtonActive: {
    backgroundColor: '#6c757d',
  },
  toggleFormButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  toggleButton: { flex: 1, padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  toggleActiveColor: { backgroundColor: '#f6b518', borderColor: '#f6b518' },
  toggleActiveBW: { backgroundColor: '#333', borderColor: '#333' },
  toggleText: { fontWeight: 'bold', color: '#555' },
  toggleTextActive: { color: '#fff' },

  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, borderColor: '#ddd', fontSize: 16 },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  skuInput: {
    flex: 1,
    marginBottom: 0,
  },
  skuScanBtn: {
    backgroundColor: '#eef3f9',
    borderWidth: 1,
    borderColor: '#4188d8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skuScanBtnText: {
    color: '#4188d8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  cancelButton: { marginTop: 10, padding: 10, alignItems: 'center' },
  cancelButtonText: { color: '#dc3545', fontWeight: 'bold' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 6, marginBottom: 8 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#666', marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#000', marginTop: 4 },
  
  actionButtons: { flexDirection: 'row', gap: 10 },
  editButton: { backgroundColor: '#ffc107', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  editButtonText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  deleteButton: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
  }
});