import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Linking,
  ScrollView,
} from 'react-native';
import {
  Star,
  Coins,
  Zap,
  ShoppingCart,
  Sparkles,
  UserCheck,
  Gift,
  Check,
  Minus,
  Plus,
  ScanBarcode,
  Flame,
  X,
} from 'lucide-react-native';
import {
  Article,
  StoreSettings,
  getStoreSettings,
  getArticles,
  getCustomer,
  deleteCustomerById,
  processPurchase,
} from '../db/operations';
import {
  formatSmsMessage,
  DEFAULT_STAMP_PURCHASE_MESSAGE,
  DEFAULT_STAMP_BONUS_MESSAGE,
  DEFAULT_POINTS_PURCHASE_MESSAGE,
  DEFAULT_POINTS_BONUS_MESSAGE,
} from '../services/smsFormatter';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useTheme, ThemeColors } from '../theme/ThemeContext';

export default function PosScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [phone, setPhone] = useState('');
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [cart, setCart] = useState<Article[]>([]);

  // Snabbläge-states
  const [quickStamps, setQuickStamps] = useState<number>(1);
  const [quickAmount, setQuickAmount] = useState<string>('');

  // Kund-states
  const [customerSearched, setCustomerSearched] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [availableBonuses, setAvailableBonuses] = useState<number>(0);
  const [appliedBonusesCount, setAppliedBonusesCount] = useState<number>(0);

  // Artikelläge-states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALLA');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [settings, articlesData] = await Promise.all([
        getStoreSettings(),
        getArticles(),
      ]);
      setStoreSettings(settings);
      setAvailableArticles(articlesData);
    } catch (err) {
      console.error('Kunde inte ladda kassadata:', err);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const bonusType = storeSettings?.bonusType ?? 'STAMPS';
  const posMode = storeSettings?.posMode ?? 'QUICK';
  const threshold = Math.max(1, storeSettings?.threshold ?? (bonusType === 'STAMPS' ? 10 : 1000));
  const rewardAmount = storeSettings?.rewardAmount ?? (bonusType === 'STAMPS' ? 1 : 100);
  const rewardDescription = storeSettings?.rewardDescription || '1 gratis vara';

  const resetCustomerState = () => {
    setCustomerSearched(false);
    setCustomerId(null);
    setIsNewCustomer(false);
    setCurrentBalance(0);
    setAvailableBonuses(0);
    setAppliedBonusesCount(0);
  };

  const resetAllAfterPurchase = () => {
    setCart([]);
    setPhone('');
    setQuickStamps(1);
    setQuickAmount('');
    resetCustomerState();
  };

  const searchCustomer = async () => {
    if (!phone.trim()) {
      Alert.alert('Ange telefonnummer', 'Skriv in kundens telefonnummer först.');
      return;
    }
    try {
      const customer = await getCustomer(phone.trim());
      setCustomerSearched(true);

      if (!customer) {
        setCustomerId(null);
        setIsNewCustomer(true);
        setCurrentBalance(0);
        setAvailableBonuses(0);
        setAppliedBonusesCount(0);
      } else {
        setCustomerId(customer.id);
        setIsNewCustomer(customer.currentBalance === 0 && customer.totalSpent === 0);
        setCurrentBalance(customer.currentBalance);
        const bonusesFound = Math.floor(customer.currentBalance / threshold);
        setAvailableBonuses(bonusesFound);
        setAppliedBonusesCount(0);
      }
    } catch (error: any) {
      Alert.alert('Fel vid sökning', error.message);
    }
  };

  const handleDeleteCustomer = () => {
    if (!customerId) return;
    Alert.alert(
      'Radera kund (GDPR)',
      'Är du säker på att du vill radera kunden och alla sparade stämplar/poäng? Detta kan inte ångras.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ja, ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomerById(customerId);
              setPhone('');
              resetCustomerState();
            } catch (error: any) {
              Alert.alert('Fel', 'Kunde inte radera kunden: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setIsScannerOpen(false);
    const cleanedCode = scannedCode.trim().toLowerCase();
    const found = availableArticles.find(
      (a) => a.sku?.trim().toLowerCase() === cleanedCode
    );

    if (found) {
      setCart((prev) => [...prev, found]);
      Alert.alert(
        'Vara tillagd!',
        `${found.name} (${found.price} kr) lades till i varukorgen.`
      );
    } else {
      Alert.alert(
        'Vara hittades inte',
        `Ingen artikel med streckkod/SKU "${scannedCode}" hittades.\n\nTips: Koppla streckkoden under Inställningar > Artiklar.`
      );
    }
  };

  // Beräkna vad som läggs till vid köp
  const subTotalKr = cart.reduce((sum, item) => sum + item.price, 0);
  const quickAmountNum = parseFloat(quickAmount.replace(',', '.')) || 0;

  const rawAddedValue =
    posMode === 'QUICK'
      ? bonusType === 'STAMPS'
        ? quickStamps
        : quickAmountNum
      : bonusType === 'STAMPS'
      ? cart.length
      : subTotalKr;

  const totalToPayKr =
    posMode === 'ARTICLES'
      ? Math.max(0, subTotalKr - appliedBonusesCount * rewardAmount)
      : Math.max(0, quickAmountNum - appliedBonusesCount * rewardAmount);

  const canCheckout =
    Boolean(phone.trim()) &&
    (rawAddedValue > 0 || appliedBonusesCount > 0);

  const sendSms = (
    number: string,
    addedVal: number,
    bonusEarned: boolean,
    isNew: boolean,
    newBalanceAfter: number,
    activeSettings: StoreSettings
  ) => {
    const activeThreshold = Math.max(1, activeSettings.threshold);
    const progressAfter = newBalanceAfter % activeThreshold;
    const remainingAfter = activeThreshold - progressAfter;

    const defaultPurchase =
      activeSettings.bonusType === 'STAMPS'
        ? DEFAULT_STAMP_PURCHASE_MESSAGE
        : DEFAULT_POINTS_PURCHASE_MESSAGE;
    const defaultBonus =
      activeSettings.bonusType === 'STAMPS'
        ? DEFAULT_STAMP_BONUS_MESSAGE
        : DEFAULT_POINTS_BONUS_MESSAGE;

    const templateToUse = bonusEarned
      ? activeSettings.bonusMessage?.trim() || defaultBonus
      : activeSettings.purchaseMessage?.trim() || defaultPurchase;

    let msg = formatSmsMessage(templateToUse, {
      amount: addedVal,
      remaining: remainingAfter,
      reward: activeSettings.rewardAmount,
      threshold: activeThreshold,
      storeName: activeSettings.storeName,
      rewardDescription: activeSettings.rewardDescription,
      currentProgress: progressAfter,
      bonusType: activeSettings.bonusType,
    });

    if (isNew) {
      msg += `\n\nInfo: Vi sparar ditt nummer för bonussystemet hos ${activeSettings.storeName}. Svara STOPP om du vill gå ur.`;
    }

    const url = `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    try {
      if (!phone.trim()) {
        Alert.alert('Telefonnummer saknas', 'Ange kundens telefonnummer först.');
        return;
      }

      if (rawAddedValue <= 0 && appliedBonusesCount === 0) {
        Alert.alert(
          'Inget att registrera',
          posMode === 'ARTICLES'
            ? 'Välj minst en artikel eller lös in en bonus.'
            : bonusType === 'STAMPS'
            ? 'Välj minst 1 stämpel eller lös in en bonus.'
            : 'Ange köpesumma eller lös in en bonus.'
        );
        return;
      }

      const {
        bonusEarned,
        newBalance,
        actualAdded,
        storeSettings: updatedSettings,
      } = await processPurchase(
        phone.trim(),
        rawAddedValue,
        posMode === 'ARTICLES' ? cart : [],
        appliedBonusesCount
      );

      const title = bonusEarned
        ? 'Ny Bonus Uppnådd!'
        : 'Registrerat!';
      const message = bonusEarned
        ? 'Kunden har nått en ny bonusnivå!\n\nVill du skicka ett SMS till kunden?'
        : 'Köpet/stämpeln har sparats.\n\nVill du skicka ett bekräftelse-SMS till kunden?';

      Alert.alert(title, message, [
        {
          text: 'Nej, klart',
          style: 'cancel',
          onPress: resetAllAfterPurchase,
        },
        {
          text: 'Ja, öppna SMS',
          onPress: () => {
            sendSms(
              phone.trim(),
              actualAdded,
              bonusEarned,
              isNewCustomer,
              newBalance,
              updatedSettings
            );
            resetAllAfterPurchase();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Ett fel uppstod', error.message);
    }
  };

  // Varukorgs-hjälpare
  const handleRemoveOne = (articleId: string) => {
    const lastIndex = cart.map((a) => a.id).lastIndexOf(articleId);
    if (lastIndex !== -1) {
      setCart((prev) => prev.filter((_, idx) => idx !== lastIndex));
    }
  };

  const handleRemoveAllOfArticle = (articleId: string) => {
    setCart((prev) => prev.filter((a) => a.id !== articleId));
  };

  const groupedCart = cart.reduce((acc, item) => {
    const existing = acc.find((x) => x.article.id === item.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += item.price;
    } else {
      acc.push({ article: item, quantity: 1, totalPrice: item.price });
    }
    return acc;
  }, [] as { article: Article; quantity: number; totalPrice: number }[]);

  // Kategorier & Toppsäljare för Artikelläge
  const uniqueCategories = Array.from(
    new Set(availableArticles.map((a) => a.category || 'Allmänt'))
  );

  const topSellers = [...availableArticles]
    .filter((a) => (a.salesCount || 0) > 0)
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4);

  const displayedArticles =
    selectedCategory === 'ALLA'
      ? availableArticles
      : selectedCategory === 'TOP'
      ? topSellers
      : availableArticles.filter((a) => (a.category || 'Allmänt') === selectedCategory);

  // Beräkning av kundens nuvarande progress (efter ev. valda bonusar)
  const effectiveBalance = Math.max(0, currentBalance - appliedBonusesCount * threshold);
  const currentProgress = effectiveBalance % threshold;
  const remainingToNext = threshold - currentProgress;
  const progressPercent = Math.min(100, Math.round((currentProgress / threshold) * 100));

  return (
    <View style={styles.container}>
      {/* BUTIKS-BADGE HÖGST UPP */}
      <View style={styles.storeHeaderRow}>
        <Text style={styles.storeNameText}>
          {storeSettings?.storeName || 'Min Butik'}
        </Text>
        <View style={styles.modePill}>
          {bonusType === 'STAMPS' ? (
            <Star size={13} color={colors.primaryStrongText} />
          ) : (
            <Coins size={13} color={colors.primaryStrongText} />
          )}
          <Text style={styles.modePillText}>
            {bonusType === 'STAMPS' ? 'Stämpelkort' : 'Poäng/Kr'} •
          </Text>
          {posMode === 'QUICK' ? (
            <Zap size={13} color={colors.primaryStrongText} />
          ) : (
            <ShoppingCart size={13} color={colors.primaryStrongText} />
          )}
          <Text style={styles.modePillText}>
            {posMode === 'QUICK' ? 'Snabbläge' : 'Artikelläge'}
          </Text>
        </View>
      </View>

      {/* SÖK KUND PÅ TELEFONNUMMER */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.phoneInput}
          placeholder="Kundens telefonnummer..."
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (customerSearched) resetCustomerState();
          }}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchCustomer}>
          <Text style={styles.searchButtonText}>Sök Kund</Text>
        </TouchableOpacity>
      </View>

      {/* KUNDKORT (VISUELLT STÄMPELKORT ELLER PROGRESS-BAR) */}
      {customerSearched && (
        <View style={styles.customerCard}>
          <View style={styles.customerHeaderRow}>
            <View style={styles.customerBadgeRow}>
              {isNewCustomer ? (
                <Sparkles size={15} color={colors.primaryStrongText} />
              ) : (
                <UserCheck size={15} color={colors.primaryStrongText} />
              )}
              <Text style={styles.customerBadgeText}>
                {isNewCustomer ? 'Ny kund' : 'Registrerad kund'}
              </Text>
            </View>
            {customerId && (
              <TouchableOpacity onPress={handleDeleteCustomer}>
                <Text style={styles.gdprDeleteText}>Ta bort kund (GDPR)</Text>
              </TouchableOpacity>
            )}
          </View>

          {bonusType === 'STAMPS' ? (
            <View style={styles.stampSection}>
              <Text style={styles.progressSummaryText}>
                {currentProgress} av {threshold} stämplar ({remainingToNext} kvar till{' '}
                {rewardDescription})
              </Text>

              {threshold <= 20 ? (
                <View style={styles.stampsGrid}>
                  {Array.from({ length: threshold }).map((_, idx) => {
                    const isFilled = idx < currentProgress;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.stampCircle,
                          isFilled && styles.stampCircleFilled,
                        ]}
                      >
                        {isFilled ? (
                          <Star
                            size={16}
                            color={colors.warningText}
                            fill={colors.warningText}
                          />
                        ) : (
                          <Text style={styles.stampCircleText}>{idx + 1}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.progressBarBg}>
                  <View
                    style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.stampSection}>
              <Text style={styles.progressSummaryText}>
                {currentProgress} / {threshold} kr ({remainingToNext} kr kvar till{' '}
                {rewardAmount} kr bonus)
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>
            </View>
          )}

          {/* BONUS ATT LÖSA IN */}
          {availableBonuses > 0 && (
            <View style={styles.bonusBox}>
              <View style={styles.bonusBoxTitleRow}>
                <Gift size={16} color={colors.warningText} />
                <Text style={styles.bonusBoxTitle}>
                  Kunden har {availableBonuses} st bonus att hämta ut!
                </Text>
              </View>

              {availableBonuses - appliedBonusesCount > 0 && (
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => setAppliedBonusesCount((prev) => prev + 1)}
                >
                  <Text style={styles.redeemButtonText}>
                    Utnyttja 1 bonus (
                    {bonusType === 'STAMPS'
                      ? rewardDescription
                      : `-${rewardAmount} kr`}
                    )
                  </Text>
                </TouchableOpacity>
              )}

              {appliedBonusesCount > 0 && (
                <View style={styles.appliedBonusRow}>
                  <View style={styles.appliedBonusTextRow}>
                    <Check size={16} color={colors.success} />
                    <Text style={styles.appliedBonusText}>
                      {appliedBonusesCount} st bonus vald att lösas in
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setAppliedBonusesCount(0)}>
                    <Text style={styles.undoBonusText}>Ångra</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* HUVUDYTA: SNABBLÄGE ELLER ARTIKELLÄGE */}
      <View style={styles.contentArea}>
        {posMode === 'QUICK' ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {bonusType === 'STAMPS' ? (
              <View style={styles.quickCard}>
                <Text style={styles.quickCardTitle}>Hur många stämplar vill du ge?</Text>

                <View style={styles.stampStepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuickStamps((prev) => Math.max(0, prev - 1))}
                  >
                    <Minus size={28} color={colors.primaryStrongText} />
                  </TouchableOpacity>

                  <View style={styles.stampCountDisplay}>
                    <Text style={styles.stampCountNumber}>+{quickStamps}</Text>
                    <Text style={styles.stampCountLabel}>
                      {quickStamps === 1 ? 'stämpel' : 'stämplar'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuickStamps((prev) => prev + 1)}
                  >
                    <Plus size={28} color={colors.primaryStrongText} />
                  </TouchableOpacity>
                </View>

                <View style={styles.quickPresetsRow}>
                  {[1, 2, 3, 5].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.presetChip,
                        quickStamps === num && styles.presetChipActive,
                      ]}
                      onPress={() => setQuickStamps(num)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          quickStamps === num && styles.presetChipTextActive,
                        ]}
                      >
                        +{num} st
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.quickCard}>
                <Text style={styles.quickCardTitle}>Ange köpesumma (kr)</Text>
                <TextInput
                  style={styles.quickAmountInput}
                  placeholder="0 kr"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={quickAmount}
                  onChangeText={setQuickAmount}
                />
                <View style={styles.quickPresetsRow}>
                  {[50, 100, 250, 500].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={styles.presetChip}
                      onPress={() =>
                        setQuickAmount(((parseFloat(quickAmount) || 0) + val).toString())
                      }
                    >
                      <Text style={styles.presetChipText}>+{val} kr</Text>
                    </TouchableOpacity>
                  ))}
                  {quickAmount.length > 0 && (
                    <TouchableOpacity
                      style={[styles.presetChip, { borderColor: colors.danger }]}
                      onPress={() => setQuickAmount('')}
                    >
                      <Text style={[styles.presetChipText, { color: colors.dangerText }]}>
                        Rensa
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          /* ARTIKELLÄGE */
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setIsScannerOpen(true)}
            >
              <ScanBarcode size={18} color={colors.primaryText} />
              <Text style={styles.scanButtonText}>Scanna streckkod på vara</Text>
            </TouchableOpacity>

            <BarcodeScannerModal
              visible={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onScan={handleBarcodeScanned}
              title="Scanna vara"
              subtitle="Rikta kameran mot streckkoden på produkten"
            />

            {/* KATEGORI-FILTER */}
            <View style={{ marginBottom: 10 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.catTab,
                    selectedCategory === 'ALLA' && styles.catTabActive,
                  ]}
                  onPress={() => setSelectedCategory('ALLA')}
                >
                  <Text
                    style={[
                      styles.catTabText,
                      selectedCategory === 'ALLA' && styles.catTabTextActive,
                    ]}
                  >
                    Alla ({availableArticles.length})
                  </Text>
                </TouchableOpacity>

                {topSellers.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.catTab,
                      selectedCategory === 'TOP' && styles.catTabActive,
                    ]}
                    onPress={() => setSelectedCategory('TOP')}
                  >
                    <Flame
                      size={14}
                      color={
                        selectedCategory === 'TOP'
                          ? '#ffffff'
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.catTabText,
                        selectedCategory === 'TOP' && styles.catTabTextActive,
                      ]}
                    >
                      Toppsäljare
                    </Text>
                  </TouchableOpacity>
                )}

                {uniqueCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catTab,
                      selectedCategory === cat && styles.catTabActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catTabText,
                        selectedCategory === cat && styles.catTabTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={displayedArticles}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyArticlesBox}>
                  <Text style={styles.emptyArticlesText}>
                    Inga artiklar hittades. Lägg till varor under Inställningar &gt;
                    Artiklar, eller byt till Snabbläge!
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.articleCard}
                  onPress={() => setCart([...cart, item])}
                >
                  <View>
                    <Text style={styles.articleName}>{item.name}</Text>
                    <Text style={styles.articleCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.articlePrice}>+{item.price} kr</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* FOOTER: VARUKORG & SLUTFÖR-KNAPP */}
      <View style={styles.footer}>
        {posMode === 'ARTICLES' && cart.length > 0 && (
          <View style={styles.cartContainer}>
            <View style={styles.cartHeaderRow}>
              <Text style={styles.cartHeaderTitle}>
                Varukorg ({cart.length} st):
              </Text>
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCartText}>Töm varukorg</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartScrollList} nestedScrollEnabled={true}>
              {groupedCart.map(({ article, quantity, totalPrice }) => (
                <View key={article.id} style={styles.cartItemRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {article.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      {quantity > 1 ? `${quantity} × ${article.price} kr = ` : ''}
                      {totalPrice} kr
                    </Text>
                  </View>

                  <View style={styles.cartControls}>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => handleRemoveOne(article.id)}
                    >
                      <Minus size={14} color={colors.primaryStrongText} />
                    </TouchableOpacity>
                    <Text style={styles.cartQtyNumber}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => setCart([...cart, article])}
                    >
                      <Plus size={14} color={colors.primaryStrongText} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cartDeleteBtn}
                      onPress={() => handleRemoveAllOfArticle(article.id)}
                    >
                      <X size={16} color={colors.dangerText} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.totalRow}>
          {appliedBonusesCount > 0 && (
            <Text style={styles.discountText}>
              Inlöst bonus:{' '}
              {bonusType === 'STAMPS'
                ? `${appliedBonusesCount} × ${rewardDescription}`
                : `-${appliedBonusesCount * rewardAmount} kr`}
            </Text>
          )}
          <Text style={styles.totalText}>
            {bonusType === 'STAMPS' && posMode === 'QUICK'
              ? `Att registrera: +${quickStamps} stämpel`
              : bonusType === 'STAMPS' && posMode === 'ARTICLES'
              ? `Totalt: ${totalToPayKr} kr (+${cart.length} stämplar)`
              : `Totalt: ${totalToPayKr} kr`}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !canCheckout && styles.checkoutButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!canCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {bonusType === 'STAMPS'
              ? 'Registrera stämpel & Skicka SMS'
              : 'Slutför köp & Skicka SMS'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    storeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    storeNameText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    modePill: {
      backgroundColor: colors.modePillBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    modePillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    phoneInput: {
      flex: 1,
      fontSize: 20,
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    searchButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 10,
      justifyContent: 'center',
    },
    searchButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    customerCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
    },
    customerHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    customerBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    customerBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    gdprDeleteText: {
      fontSize: 12,
      color: colors.dangerText,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    stampSection: {
      marginTop: 2,
    },
    progressSummaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 10,
    },
    stampsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    stampCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      borderColor: colors.stampCircleBorder,
      backgroundColor: colors.stampCircleBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stampCircleFilled: {
      borderColor: colors.warning,
      backgroundColor: colors.warningSoft,
    },
    stampCircleText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.stampCircleText,
    },
    progressBarBg: {
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    bonusBox: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    bonusBoxTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    bonusBoxTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.warningText,
    },
    redeemButton: {
      backgroundColor: colors.warning,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    redeemButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    appliedBonusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    appliedBonusTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    appliedBonusText: {
      color: colors.success,
      fontWeight: '700',
      fontSize: 14,
    },
    undoBonusText: {
      color: colors.dangerText,
      fontWeight: '700',
      textDecorationLine: 'underline',
      fontSize: 14,
    },
    contentArea: {
      flex: 1,
    },
    quickCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      marginTop: 6,
    },
    quickCardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 18,
    },
    stampStepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 28,
      marginBottom: 20,
    },
    stepperBtn: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primarySoft,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stampCountDisplay: {
      alignItems: 'center',
      minWidth: 90,
    },
    stampCountNumber: {
      fontSize: 42,
      fontWeight: '800',
      color: colors.text,
    },
    stampCountLabel: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    quickAmountInput: {
      width: '100%',
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderInput,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.surfaceInput,
      color: colors.text,
      marginBottom: 16,
    },
    quickPresetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
    },
    presetChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderInput,
    },
    presetChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    presetChipText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    presetChipTextActive: {
      color: '#ffffff',
    },
    scanButton: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 11,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    scanButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: '700',
    },
    catTab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderInput,
      marginRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    catTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    catTabText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    catTabTextActive: {
      color: '#ffffff',
    },
    articleCard: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    articleName: { fontSize: 16, fontWeight: '700', color: colors.text },
    articleCategory: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    articlePrice: { fontSize: 16, fontWeight: '800', color: colors.primaryText },
    emptyArticlesBox: {
      padding: 24,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    emptyArticlesText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: { paddingTop: 8 },
    cartContainer: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      marginBottom: 8,
      maxHeight: 135,
    },
    cartHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    cartHeaderTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    clearCartText: {
      fontSize: 12,
      color: colors.dangerText,
      fontWeight: '700',
    },
    cartScrollList: { maxHeight: 85 },
    cartItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    cartItemName: { fontSize: 14, fontWeight: '600', color: colors.text },
    cartItemPrice: { fontSize: 12, color: colors.textMuted },
    cartControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cartQtyBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
    },
    cartQtyNumber: {
      fontSize: 14,
      fontWeight: '700',
      minWidth: 18,
      textAlign: 'center',
      color: colors.text,
    },
    cartDeleteBtn: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    discountText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.warningText,
    },
    totalText: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginLeft: 'auto',
    },
    checkoutButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    checkoutButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    checkoutButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },
  });
