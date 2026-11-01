import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function ArticleManager() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currency = 'kr';

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(t.articles.defaultCategory);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerOpen(false);
    const cleaned = scannedCode.trim();
    setSku(cleaned);
    Alert.alert(
      t.articles.barcodeScannedTitle,
      t.articles.barcodeScannedMsg(cleaned)
    );
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
    new Set([
      t.articles.defaultCategory,
      ...savedArticles.map((a) => a.category).filter(Boolean),
    ])
  );

  const handleSaveArticle = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert(t.articles.missingInfoTitle, t.articles.missingInfoMsg);
      return;
    }

    const numericPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numericPrice)) {
      Alert.alert(t.articles.invalidPriceTitle, t.articles.invalidPriceMsg);
      return;
    }

    try {
      const cleanCategory = category.trim() || t.articles.defaultCategory;
      if (editingArticleId) {
        await updateArticle(editingArticleId, sku, name, numericPrice, cleanCategory);
        Alert.alert(t.articles.updatedTitle, t.articles.updatedMsg);
      } else {
        await addArticle(sku, name, numericPrice, cleanCategory);
        Alert.alert(t.articles.savedTitle, t.articles.savedMsg);
      }
      setSku('');
      setName('');
      setPrice('');
      setCategory(t.articles.defaultCategory);
      setEditingArticleId(null);
      setIsFormVisible(false);
      loadArticles();
    } catch (error: any) {
      Alert.alert(t.pos.errorTitle, error.message);
    }
  };

  const handleEdit = (item: Article) => {
    setEditingArticleId(item.id);
    setSku(item.sku || '');
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category || t.articles.defaultCategory);
    setIsFormVisible(true);
  };

  const handleDelete = (item: Article) => {
    Alert.alert(
      t.articles.deleteAlertTitle,
      t.articles.deleteAlertMsg(item.name),
      [
        { text: t.articles.cancelBtn, style: 'cancel' },
        {
          text: t.articles.deleteConfirmBtn,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArticle(item.id);
              if (editingArticleId === item.id) {
                cancelEdit();
              }
              loadArticles();
            } catch (error: any) {
              Alert.alert(t.articles.deleteErrorTitle, error.message);
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
    setCategory(t.articles.defaultCategory);
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
            placeholder={t.articles.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.placeholder}
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
              ? t.articles.cancelBtn
              : isFormVisible
              ? t.articles.hideFormBtn
              : t.articles.newArticleBtn}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÄR FÖR ATT SKAPA / REDIGERA ARTIKEL */}
      {isFormVisible && (
        <View style={styles.form}>
          <Text style={styles.label}>
            {editingArticleId
              ? t.articles.editArticleTitle
              : t.articles.addArticleTitle}
          </Text>

          <Text style={styles.fieldLabel}>{t.articles.nameLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.articles.namePlaceholder}
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>
            {t.articles.priceLabel(currency)}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="45"
            placeholderTextColor={colors.placeholder}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>{t.articles.categoryLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.articles.categoryPlaceholder}
            placeholderTextColor={colors.placeholder}
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

          <Text style={styles.fieldLabel}>{t.articles.skuLabel}</Text>
          <View style={styles.skuRow}>
            <TextInput
              style={[styles.input, styles.skuInput]}
              placeholder={t.articles.skuPlaceholder}
              placeholderTextColor={colors.placeholder}
              value={sku}
              onChangeText={setSku}
            />
            <TouchableOpacity
              style={styles.skuScanBtn}
              onPress={() => setIsScannerOpen(true)}
            >
              <Text style={styles.skuScanBtnText}>{t.articles.scanBtn}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              editingArticleId ? { backgroundColor: colors.success } : null,
            ]}
            onPress={handleSaveArticle}
          >
            <Text style={styles.buttonText}>
              {editingArticleId
                ? t.articles.updateArticleBtn
                : t.articles.saveArticleBtn}
            </Text>
          </TouchableOpacity>

          {editingArticleId && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>
                {t.articles.cancelEditBtn}
              </Text>
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
                ? t.articles.emptySearchText
                : t.articles.emptyListText}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>
                {t.articles.categoryPrefix} {item.category}
                {item.sku ? `  •  SKU: ${item.sku}` : ''}
              </Text>
              <Text style={styles.itemPrice}>
                {item.price} {currency}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editButtonText}>{t.articles.editBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>{t.articles.deleteBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title={t.articles.scanModalTitle}
        subtitle={t.articles.scanModalSubtitle}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, padding: 18, backgroundColor: colors.background },
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
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderInput,
      paddingHorizontal: 12,
      height: 48,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      color: colors.text,
    },
    clearSearchBtn: {
      padding: 6,
    },
    clearSearchBtnText: {
      fontSize: 16,
      color: colors.textMuted,
      fontWeight: 'bold',
    },
    toggleFormButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      height: 48,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleFormButtonActive: {
      backgroundColor: colors.textMuted,
    },
    toggleFormButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    form: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 14,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 8,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      backgroundColor: colors.surfaceInput,
      color: colors.text,
    },
    chipScroll: {
      marginBottom: 12,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderInput,
      marginRight: 8,
    },
    categoryChipActive: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    categoryChipTextActive: {
      color: colors.primaryStrongText,
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
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skuScanBtnText: {
      color: colors.primaryStrongText,
      fontWeight: '700',
      fontSize: 14,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    cancelButton: { marginTop: 10, padding: 8, alignItems: 'center' },
    cancelButtonText: { color: colors.dangerText, fontWeight: '700' },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
    },
    itemInfo: { flex: 1, marginRight: 10 },
    itemTitle: { fontSize: 16, color: colors.text, fontWeight: '700' },
    itemSub: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
    itemPrice: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 4 },

    actionButtons: { flexDirection: 'row', gap: 8 },
    editButton: {
      backgroundColor: colors.warningSoft,
      borderWidth: 1,
      borderColor: colors.warning,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    editButtonText: { color: colors.warningText, fontWeight: '700', fontSize: 13 },
    deleteButton: {
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    deleteButtonText: { color: colors.dangerText, fontWeight: '700', fontSize: 13 },

    emptyContainer: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 10,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
