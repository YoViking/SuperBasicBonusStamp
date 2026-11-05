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
  Sparkles,
  UserCheck,
  Gift,
  Check,
  Minus,
  Plus,
  ScanBarcode,
  Flame,
  X,
  Tag,
} from 'lucide-react-native';
import {
  Article,
  StoreSettings,
  getStoreSettings,
  getArticles,
  getCustomer,
  deleteCustomerById,
  processPurchase,
  ShopifyDiscountCode,
  getActiveDiscountCodesForCustomer,
  redeemShopifyDiscountCodeInPos,
} from '../db/operations';
import {
  formatSmsMessage,
  normalizePurchaseTemplate,
  normalizeBonusTemplate,
  normalizeRewardDescription,
  normalizeStoreName,
  normalizeCategoryName,
} from '../services/smsFormatter';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function PosScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { language, currencySymbol: currency, t } = useLanguage();
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
  const [activeShopifyCoupons, setActiveShopifyCoupons] = useState<ShopifyDiscountCode[]>([]);

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
  const rewardDescription = normalizeRewardDescription(
    storeSettings?.rewardDescription,
    language
  );
  const displayStoreName = normalizeStoreName(
    storeSettings?.storeName,
    language
  );

  const resetCustomerState = () => {
    setCustomerSearched(false);
    setCustomerId(null);
    setIsNewCustomer(false);
    setCurrentBalance(0);
    setAvailableBonuses(0);
    setAppliedBonusesCount(0);
    setActiveShopifyCoupons([]);
  };

  const resetAllAfterPurchase = () => {
    setCart([]);
    setPhone('');
    setQuickStamps(1);
    setQuickAmount('');
    resetCustomerState();
  };

  const handleRedeemShopifyCoupon = async (coupon: ShopifyDiscountCode) => {
    Alert.alert(
      t.shopify.inStoreRedeemBtn,
      `${t.shopify.inStoreRedeemConfirm}\n\n${coupon.code} (${coupon.discountAmount} ${currency})`,
      [
        { text: t.pos.cancel, style: 'cancel' },
        {
          text: t.shopify.inStoreRedeemBtn,
          onPress: async () => {
            try {
              await redeemShopifyDiscountCodeInPos(coupon.id);
              Alert.alert('Shopify', t.pos.shopifyDiscountRedeemedAlert);
              setActiveShopifyCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
              setAppliedBonusesCount((prev) => prev + 1);
            } catch (err: any) {
              Alert.alert(t.pos.errorTitle, err.message);
            }
          },
        },
      ]
    );
  };

  const searchCustomer = async () => {
    if (!phone.trim()) {
      Alert.alert(t.pos.enterPhoneTitle, t.pos.enterPhoneMsg);
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
        setActiveShopifyCoupons([]);
      } else {
        setCustomerId(customer.id);
        setIsNewCustomer(customer.currentBalance === 0 && customer.totalSpent === 0);
        setCurrentBalance(customer.currentBalance);
        const bonusesFound = Math.floor(customer.currentBalance / threshold);
        setAvailableBonuses(bonusesFound);
        setAppliedBonusesCount(0);

        try {
          const coupons = await getActiveDiscountCodesForCustomer(customer.id);
          setActiveShopifyCoupons(coupons);
        } catch (couponErr) {
          console.warn('Kunde inte läsa Shopify-kuponger för kund:', couponErr);
          setActiveShopifyCoupons([]);
        }
      }
    } catch (error: any) {
      Alert.alert(t.pos.searchErrorTitle, error.message);
    }
  };

  const handleDeleteCustomer = () => {
    if (!customerId) return;
    Alert.alert(
      t.pos.gdprAlertTitle,
      t.pos.gdprAlertMsg,
      [
        { text: t.pos.cancel, style: 'cancel' },
        {
          text: t.pos.gdprConfirmBtn,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomerById(customerId);
              setPhone('');
              resetCustomerState();
            } catch (error: any) {
              Alert.alert(
                t.pos.errorTitle,
                t.pos.deleteCustomerError + error.message
              );
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
        t.pos.itemAddedTitle,
        t.pos.itemAddedMsg(found.name, `${found.price} ${currency}`)
      );
    } else {
      Alert.alert(
        t.pos.itemNotFoundTitle,
        t.pos.itemNotFoundMsg(scannedCode)
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

    const templateToUse = bonusEarned
      ? normalizeBonusTemplate(
          activeSettings.bonusMessage,
          activeSettings.bonusType,
          language
        )
      : normalizePurchaseTemplate(
          activeSettings.purchaseMessage,
          activeSettings.bonusType,
          language
        );

    const normalizedStore = normalizeStoreName(
      activeSettings.storeName,
      language
    );

    let msg = formatSmsMessage(templateToUse, {
      amount: addedVal,
      remaining: remainingAfter,
      reward: activeSettings.rewardAmount,
      threshold: activeThreshold,
      storeName: normalizedStore,
      rewardDescription: normalizeRewardDescription(
        activeSettings.rewardDescription,
        language
      ),
      currentProgress: progressAfter,
      bonusType: activeSettings.bonusType,
      language,
      currencySymbol: currency,
    });

    if (isNew) {
      msg += t.pos.gdprSmsFooter(normalizedStore);
    }

    const url = `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    try {
      if (!phone.trim()) {
        Alert.alert(t.pos.missingPhoneTitle, t.pos.missingPhoneMsg);
        return;
      }

      if (rawAddedValue <= 0 && appliedBonusesCount === 0) {
        Alert.alert(
          t.pos.nothingToRegisterTitle,
          posMode === 'ARTICLES'
            ? t.pos.nothingToRegisterArticles
            : bonusType === 'STAMPS'
            ? t.pos.nothingToRegisterStamps
            : t.pos.nothingToRegisterPoints
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

      const title = bonusEarned ? t.pos.newBonusTitle : t.pos.registeredTitle;
      const message = bonusEarned ? t.pos.newBonusMsg : t.pos.registeredMsg;

      Alert.alert(title, message, [
        {
          text: t.pos.noDoneBtn,
          style: 'cancel',
          onPress: resetAllAfterPurchase,
        },
        {
          text: t.pos.yesOpenSmsBtn,
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
      Alert.alert(t.pos.errorTitle, error.message);
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
    new Set(
      availableArticles.map((a) => normalizeCategoryName(a.category, language))
    )
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
      : availableArticles.filter(
          (a) => normalizeCategoryName(a.category, language) === selectedCategory
        );

  // Beräkning av kundens nuvarande progress (efter ev. valda bonusar)
  const effectiveBalance = Math.max(0, currentBalance - appliedBonusesCount * threshold);
  const currentProgress = effectiveBalance % threshold;
  const remainingToNext = threshold - currentProgress;
  const progressPercent = Math.min(100, Math.round((currentProgress / threshold) * 100));

  return (
    <View style={styles.container}>
      {/* BUTIKSNAMN HÖGST UPP */}
      <View style={styles.storeHeaderRow}>
        <Text style={styles.storeNameText}>
          {displayStoreName}
        </Text>
      </View>

      {/* SÖK KUND PÅ TELEFONNUMMER */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.phoneInput}
          placeholder={t.pos.phonePlaceholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          multiline={false}
          numberOfLines={1}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (customerSearched) resetCustomerState();
          }}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchCustomer}>
          <Text style={styles.searchButtonText}>{t.pos.searchCustomerBtn}</Text>
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
                {isNewCustomer ? t.pos.newCustomerBadge : t.pos.existingCustomerBadge}
              </Text>
            </View>
            {customerId && (
              <TouchableOpacity onPress={handleDeleteCustomer}>
                <Text style={styles.gdprDeleteText}>{t.pos.gdprDeleteBtn}</Text>
              </TouchableOpacity>
            )}
          </View>

          {bonusType === 'STAMPS' ? (
            <View style={styles.stampSection}>
              <Text style={styles.progressSummaryText}>
                {t.pos.stampsProgressText(
                  currentProgress,
                  threshold,
                  remainingToNext,
                  rewardDescription
                )}
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
                {t.pos.pointsProgressText(
                  currentProgress,
                  threshold,
                  remainingToNext,
                  rewardAmount,
                  currency
                )}
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
                  {t.pos.bonusAvailableTitle(availableBonuses)}
                </Text>
              </View>

              {availableBonuses - appliedBonusesCount > 0 && (
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => setAppliedBonusesCount((prev) => prev + 1)}
                >
                  <Text style={styles.redeemButtonText}>
                    {t.pos.redeemBonusBtn(
                      bonusType === 'STAMPS'
                        ? rewardDescription
                        : `-${rewardAmount} ${currency}`
                    )}
                  </Text>
                </TouchableOpacity>
              )}

              {appliedBonusesCount > 0 && (
                <View style={styles.appliedBonusRow}>
                  <View style={styles.appliedBonusTextRow}>
                    <Check size={16} color={colors.success} />
                    <Text style={styles.appliedBonusText}>
                      {t.pos.appliedBonusText(appliedBonusesCount)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setAppliedBonusesCount(0)}>
                    <Text style={styles.undoBonusText}>{t.pos.undoBtn}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* AKTIVA SHOPIFY-RABATTKODER */}
          {activeShopifyCoupons.length > 0 && (
            <View style={styles.shopifyCouponContainer}>
              {activeShopifyCoupons.map((coupon) => (
                <View key={coupon.id} style={styles.shopifyCouponItem}>
                  <View style={styles.shopifyCouponLeft}>
                    <Tag size={16} color={colors.primaryStrongText} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shopifyCouponTitle}>
                        {t.pos.activeShopifyDiscount(coupon.code, coupon.discountAmount, currency)}
                      </Text>
                      {coupon.expiresAt && (
                        <Text style={styles.shopifyCouponSub}>
                          {t.shopify.expiresOn(new Date(coupon.expiresAt).toLocaleDateString())}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.redeemShopifyBtn}
                    onPress={() => handleRedeemShopifyCoupon(coupon)}
                  >
                    <Text style={styles.redeemShopifyBtnText}>
                      {t.pos.redeemShopifyDiscountBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
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
                <Text style={styles.quickCardTitle}>
                  {t.pos.howManyStampsTitle}
                </Text>

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
                      {quickStamps === 1 ? t.pos.stampSingular : t.pos.stampPlural}
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
                        +{num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.quickCard}>
                <Text style={styles.quickCardTitle}>
                  {t.pos.enterPurchaseAmountTitle(currency)}
                </Text>
                <TextInput
                  style={styles.quickAmountInput}
                  placeholder={`0 ${currency}`}
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
                      <Text style={styles.presetChipText}>
                        +{val} {currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {quickAmount.length > 0 && (
                    <TouchableOpacity
                      style={[styles.presetChip, { borderColor: colors.danger }]}
                      onPress={() => setQuickAmount('')}
                    >
                      <Text style={[styles.presetChipText, { color: colors.dangerText }]}>
                        {t.pos.clearBtn}
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
              <Text style={styles.scanButtonText}>{t.pos.scanBarcodeBtn}</Text>
            </TouchableOpacity>

            <BarcodeScannerModal
              visible={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onScan={handleBarcodeScanned}
              title={t.pos.scanModalTitle}
              subtitle={t.pos.scanModalSubtitle}
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
                    {t.pos.allCategory(availableArticles.length)}
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
                      {t.pos.topSellersCategory}
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
                    {t.pos.emptyArticlesText}
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
                    <Text style={styles.articleCategory}>
                      {normalizeCategoryName(item.category, language)}
                    </Text>
                  </View>
                  <Text style={styles.articlePrice}>
                    +{item.price} {currency}
                  </Text>
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
                {t.pos.cartTitle(cart.length)}
              </Text>
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCartText}>{t.pos.clearCartBtn}</Text>
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
                      {quantity > 1
                        ? `${quantity} × ${article.price} ${currency} = `
                        : ''}
                      {totalPrice} {currency}
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
              {t.pos.redeemedBonusLabel}{' '}
              {bonusType === 'STAMPS'
                ? `${appliedBonusesCount} × ${rewardDescription}`
                : `-${appliedBonusesCount * rewardAmount} ${currency}`}
            </Text>
          )}
          <Text style={styles.totalText}>
            {bonusType === 'STAMPS' && posMode === 'QUICK'
              ? t.pos.toRegisterStamps(quickStamps)
              : bonusType === 'STAMPS' && posMode === 'ARTICLES'
              ? t.pos.totalWithStamps(`${totalToPayKr} ${currency}`, cart.length)
              : t.pos.totalAmount(`${totalToPayKr} ${currency}`)}
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
              ? t.pos.checkoutStampsBtn
              : t.pos.checkoutPointsBtn}
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
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    phoneInput: {
      flex: 1,
      minWidth: 0,
      height: 48,
      fontSize: 16,
      lineHeight: 22,
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    searchButton: {
      height: 48,
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
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
    shopifyCouponContainer: {
      marginTop: 10,
      gap: 8,
    },
    shopifyCouponItem: {
      backgroundColor: colors.surfaceInput,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    shopifyCouponLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    shopifyCouponTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    shopifyCouponSub: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    redeemShopifyBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    redeemShopifyBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
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
