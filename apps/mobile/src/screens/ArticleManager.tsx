import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  getArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  Article,
} from '../db/operations';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function ArticleManager() {
  const isFocused = useIsFocused();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Allmänt');
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerOpen(false);
    const cleaned = scannedCode.trim();
    setSku(cleaned);
    Alert.alert('Streckkod avläst!', `SKU sattes till: ${cleaned}`);
  };

  const loadArticles = async () => {
    try {
      const data = await getArticles();
      setSavedArticles(data);
    } catch (err: any) {
      console.error('Kunde inte ladda artiklar:', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadArticles();
    }
  }, [isFocused]);

  const existingCategories = Array.from(
    new Set(['Allmänt', ...savedArticles.map((a) => a.category).filter(Boolean)])
  );

  const handleSaveArticle = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Info saknas', 'Fyll i både artikelnamn och pris.');
      return;
    }

    const numericPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numericPrice)) {
      Alert.alert('Felaktigt pris', 'Ange ett giltigt nummer för pris.');
      return;
    }

    try {
      const cleanCategory = category.trim() || 'Allmänt';
      if (editingArticleId) {
        await updateArticle(editingArticleId, sku, name, numericPrice, cleanCategory);
        Alert.alert('Uppdaterad!', 'Artikeln har sparats.');
      } else {
        await addArticle(sku, name, numericPrice, cleanCategory);
        Alert.alert('Sparat!', 'Ny artikel har lagts till.');
      }
      setSku('');
      setName('');
      setPrice('');
      setCategory('Allmänt');
      setEditingArticleId(null);
      setIsFormVisible(false);
      loadArticles();
    } catch (error: any) {
      Alert.alert('Fel', error.message);
    }
  };

  const handleEdit = (item: Article) => {
    setEditingArticleId(item.id);
    setSku(item.sku || '');
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category || 'Allmänt');
    setIsFormVisible(true);
  };

  const handleDelete = (item: Article) => {
    Alert.alert(
      'Radera artikel',
      `Är du säker på att du vill ta bort "${item.name}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ja, ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArticle(item.id);
              if (editingArticleId === item.id) {
                cancelEdit();
              }
              loadArticles();
            } catch (error: any) {
              Alert.alert('Fel vid radering', error.message);
            }
          },
        },
      ]
    );
  };

  const cancelEdit = () => {
    setSku('');
    setName('');
    setPrice('');
    setCategory('Allmänt');
    setEditingArticleId(null);
    setIsFormVisible(false);
  };

  const filteredArticles = savedArticles.filter((item) => {
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
            placeholder="🔍 Sök artikel (namn, kategori, streckkod)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.toggleFormButton,
            isFormVisible && styles.toggleFormButtonActive,
          ]}
          onPress={() => {
            if (editingArticleId) {
              cancelEdit();
            } else {
              setIsFormVisible(!isFormVisible);
            }
          }}
        >
          <Text style={styles.toggleFormButtonText}>
            {editingArticleId
              ? 'Avbryt'
              : isFormVisible
              ? 'Dölj formulär'
              : '＋ Ny artikel'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÄR FÖR ATT SKAPA / REDIGERA ARTIKEL */}
      {isFormVisible && (
        <View style={styles.form}>
          <Text style={styles.label}>
            {editingArticleId ? 'Redigera artikel' : 'Lägg till ny artikel'}
          </Text>

          <Text style={styles.fieldLabel}>Namn på vara / tjänst *</Text>
          <TextInput
            style={styles.input}
            placeholder="t.ex. Cappuccino, Lunchbuffé eller Klippning"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>Pris (kr) *</Text>
          <TextInput
            style={styles.input}
            placeholder="t.ex. 45"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Kategori (valfri)</Text>
          <TextInput
            style={styles.input}
            placeholder="t.ex. Kaffe, Bakverk, Behandlingar..."
            value={category}
            onChangeText={setCategory}
          />

          {existingCategories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              {existingCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.fieldLabel}>Streckkod / SKU (valfritt)</Text>
          <View style={styles.skuRow}>
            <TextInput
              style={[styles.input, styles.skuInput]}
              placeholder="Lämna tomt eller scanna streckkod"
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

          <TouchableOpacity
            style={[
              styles.button,
              editingArticleId ? { backgroundColor: '#16a34a' } : null,
            ]}
            onPress={handleSaveArticle}
          >
            <Text style={styles.buttonText}>
              {editingArticleId ? 'Uppdatera Artikel' : 'Spara Artikel'}
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
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Inga artiklar matchade din sökning.'
                : 'Inga artiklar sparade än. Klicka på "＋ Ny artikel" om du vill använda Artikelläge i kassan.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>
                Kategori: {item.category}
                {item.sku ? `  •  SKU: ${item.sku}` : ''}
              </Text>
              <Text style={styles.itemPrice}>{item.price} kr</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editButtonText}>Redigera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Ta bort</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  container: { flex: 1, padding: 18, backgroundColor: '#f4f6f9' },
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchBtnText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  toggleFormButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleFormButtonActive: {
    backgroundColor: '#6b7280',
  },
  toggleFormButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  form: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  chipScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryChipTextActive: {
    color: '#2563eb',
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  skuInput: {
    flex: 1,
    marginBottom: 0,
  },
  skuScanBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skuScanBtnText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { marginTop: 10, padding: 8, alignItems: 'center' },
  cancelButtonText: { color: '#dc2626', fontWeight: '700' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 16, color: '#111827', fontWeight: '700' },
  itemSub: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#2563eb', marginTop: 4 },

  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: { color: '#92400e', fontWeight: '700', fontSize: 13 },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: { color: '#b91c1c', fontWeight: '700', fontSize: 13 },

  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
