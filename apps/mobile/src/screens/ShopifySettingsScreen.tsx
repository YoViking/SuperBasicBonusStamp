import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Key,
  Globe,
  Sliders,
  Tag,
  Receipt,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react-native';
import {
  ShopifyIntegration,
  ShopifyDiscountCode,
  ShopifyOrderSummary,
  getShopifyIntegration,
  saveShopifyIntegration,
  testShopifyConnection,
  getShopifyDiscountCodes,
  redeemShopifyDiscountCodeInPos,
  getRecentShopifyOrders,
  syncShopifyArticles,
  ShopifyConsentMode,
} from '../db/operations';
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function ShopifySettingsScreen() {
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();
  const { language, currencySymbol: currency, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'CONFIG' | 'DISCOUNTS' | 'ORDERS'>('CONFIG');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Formulär-states
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [consentMode, setConsentMode] = useState<ShopifyConsentMode>('RESPECT_OUTREACH');
  const [pointsPerCurrency, setPointsPerCurrency] = useState('1');
  const [productTypesFilter, setProductTypesFilter] = useState('');
  const [discountPrefix, setDiscountPrefix] = useState('BONUS-');
  const [discountValidityDays, setDiscountValidityDays] = useState('90');
  const [syncArticles, setSyncArticles] = useState(false);

  // Rabattkoder & Ordrar
  const [discountCodes, setDiscountCodes] = useState<ShopifyDiscountCode[]>([]);
  const [discountFilter, setDiscountFilter] = useState<'ALL' | 'ACTIVE' | 'USED'>('ACTIVE');
  const [recentOrders, setRecentOrders] = useState<ShopifyOrderSummary[]>([]);

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://din-projekt-id.supabase.co';
  const webhookUrl = `${supabaseUrl}/functions/v1/shopify-webhook`;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [integration, discounts, orders] = await Promise.all([
        getShopifyIntegration(),
        getShopifyDiscountCodes(),
        getRecentShopifyOrders(15),
      ]);

      if (integration) {
        setShopDomain(integration.shopDomain);
        setAccessToken(integration.accessToken);
        setWebhookSecret(integration.webhookSecret);
        setIsActive(integration.isActive);
        setConsentMode(integration.consentMode || 'RESPECT_OUTREACH');
        setPointsPerCurrency(String(integration.pointsPerCurrency ?? 1));
        setProductTypesFilter((integration.eligibleProductTypes || []).join(', '));
        setDiscountPrefix(integration.discountCodePrefix || 'BONUS-');
        setDiscountValidityDays(String(integration.discountValidityDays ?? 90));
        setSyncArticles(Boolean(integration.syncArticles));
      }

      setDiscountCodes(discounts);
      setRecentOrders(orders);
    } catch (err: any) {
      console.error('Kunde inte ladda Shopify-data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const handleTestConnection = async () => {
    if (!shopDomain.trim() || !accessToken.trim()) {
      Alert.alert(t.pos.errorTitle, t.shopify.sectionConnectDesc);
      return;
    }

    try {
      setTesting(true);
      const result = await testShopifyConnection(shopDomain, accessToken);
      if (result.success) {
        Alert.alert('Shopify', t.shopify.testSuccess(result.shopName || shopDomain));
      } else {
        Alert.alert(t.pos.errorTitle, result.error || t.shopify.testError);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!shopDomain.trim() || !accessToken.trim() || !webhookSecret.trim()) {
      Alert.alert(t.pos.errorTitle, 'Vänligen fyll i domän, access token och webhook secret.');
      return;
    }

    try {
      setSaving(true);
      const eligibleArr = productTypesFilter
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await saveShopifyIntegration({
        shopDomain,
        accessToken,
        webhookSecret,
        isActive,
        consentMode,
        eligibleProductTypes: eligibleArr,
        pointsPerCurrency: Math.max(0.01, parseFloat(pointsPerCurrency) || 1),
        discountCodePrefix: discountPrefix.trim() || 'BONUS-',
        discountValidityDays: Math.max(1, parseInt(discountValidityDays, 10) || 90),
        syncArticles,
      });

      Alert.alert('Shopify', t.shopify.savedSuccess);
      await loadData();
    } catch (err: any) {
      Alert.alert(t.pos.errorTitle, err.message || 'Kunde inte spara.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncArticles = async () => {
    try {
      setSyncing(true);
      const res = await syncShopifyArticles();
      Alert.alert('Shopify', t.shopify.syncSuccess(res.count));
    } catch (err: any) {
      Alert.alert(t.pos.errorTitle, err.message || t.shopify.syncError);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      Alert.alert('Shopify', t.shopify.urlCopied);
    } else {
      Alert.alert(t.shopify.webhookUrlTitle, webhookUrl, [
        { text: 'OK' },
      ]);
    }
  };

  const handleRedeemDiscountInStore = (discount: ShopifyDiscountCode) => {
    Alert.alert(
      t.shopify.inStoreRedeemBtn,
      `${t.shopify.inStoreRedeemConfirm}\n\nKod: ${discount.code} (${discount.discountAmount} ${currency})`,
      [
        { text: t.appSettings.cancel, style: 'cancel' },
        {
          text: t.shopify.inStoreRedeemBtn,
          style: 'default',
          onPress: async () => {
            try {
              await redeemShopifyDiscountCodeInPos(discount.id);
              Alert.alert('Shopify', t.shopify.inStoreRedeemedSuccess);
              const updatedDiscounts = await getShopifyDiscountCodes();
              setDiscountCodes(updatedDiscounts);
            } catch (err: any) {
              Alert.alert(t.pos.errorTitle, err.message || 'Kunde inte lösa in rabattkoden.');
            }
          },
        },
      ]
    );
  };

  const isConfigured = Boolean(shopDomain && accessToken && webhookSecret);
  const statusBadge = isConfigured
    ? isActive
      ? { label: t.shopify.badgeActive, bg: colors.primarySoft, text: colors.success }
      : { label: t.shopify.badgeInactive, bg: colors.warningSoft, text: colors.warningText }
    : { label: t.shopify.badgeNotConfigured, bg: colors.border, text: colors.textMuted };

  const filteredDiscounts = useMemo(() => {
    if (discountFilter === 'ALL') return discountCodes;
    return discountCodes.filter((d) => d.status === discountFilter);
  }, [discountCodes, discountFilter]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER & STATUS BADGE */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrapper}>
              <ShoppingBag size={24} color={colors.primaryStrongText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{t.shopify.title}</Text>
              <Text style={styles.headerSub}>{t.shopify.subTitle}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.badgeText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {/* FLIK-VÄLJARE */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CONFIG' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CONFIG')}
          >
            <Sliders size={16} color={activeTab === 'CONFIG' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === 'CONFIG' && styles.tabBtnTextActive]}>
              Inställningar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'DISCOUNTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('DISCOUNTS')}
          >
            <Tag size={16} color={activeTab === 'DISCOUNTS' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === 'DISCOUNTS' && styles.tabBtnTextActive]}>
              {t.shopify.tabDiscounts} ({discountCodes.filter((d) => d.status === 'ACTIVE').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ORDERS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ORDERS')}
          >
            <Receipt size={16} color={activeTab === 'ORDERS' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === 'ORDERS' && styles.tabBtnTextActive]}>
              {t.shopify.tabOrders} ({recentOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 1: KONFIGURATION & NYCKLAR */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'CONFIG' && (
          <>
            {/* SEKTION 1: ANSLUTNING */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Globe size={20} color={colors.primaryStrongText} />
                <Text style={styles.sectionHeader}>{t.shopify.sectionConnectTitle}</Text>
              </View>
              <Text style={styles.helperText}>{t.shopify.sectionConnectDesc}</Text>

              <Text style={styles.label}>{t.shopify.domainLabel}</Text>
              <TextInput
                style={styles.input}
                value={shopDomain}
                onChangeText={setShopDomain}
                placeholder={t.shopify.domainPlaceholder}
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>{t.shopify.tokenLabel}</Text>
              <TextInput
                style={styles.input}
                value={accessToken}
                onChangeText={setAccessToken}
                placeholder={t.shopify.tokenPlaceholder}
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>{t.shopify.secretLabel}</Text>
              <TextInput
                style={styles.input}
                value={webhookSecret}
                onChangeText={setWebhookSecret}
                placeholder={t.shopify.secretPlaceholder}
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* WEBHOOK URL COPY-BOX */}
              <View style={styles.webhookBox}>
                <Text style={styles.webhookBoxTitle}>{t.shopify.webhookUrlTitle}</Text>
                <Text style={styles.webhookBoxDesc}>{t.shopify.webhookUrlHelper}</Text>
                <View style={styles.webhookRow}>
                  <Text numberOfLines={1} style={styles.webhookText}>{webhookUrl}</Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyWebhookUrl}>
                    <Copy size={14} color="#fff" />
                    <Text style={styles.copyBtnText}>{t.shopify.copyUrlBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TEST KNAPP */}
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestConnection}
                disabled={testing}
              >
                {testing ? (
                  <ActivityIndicator size="small" color={colors.primaryStrongText} />
                ) : (
                  <>
                    <RefreshCw size={16} color={colors.primaryStrongText} />
                    <Text style={styles.testBtnText}>{t.shopify.testBtn}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* SEKTION 2: POÄNGREGLER & KATEGORIER */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Sliders size={20} color={colors.primaryStrongText} />
                <Text style={styles.sectionHeader}>{t.shopify.rulesTitle}</Text>
              </View>
              <Text style={styles.helperText}>{t.shopify.rulesDesc}</Text>

              {/* Poäng per valuta */}
              <Text style={styles.label}>{t.shopify.pointsRateLabel(currency)}</Text>
              <TextInput
                style={styles.input}
                value={pointsPerCurrency}
                onChangeText={setPointsPerCurrency}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.placeholder}
              />

              {/* Artikelgrupper */}
              <Text style={styles.label}>{t.shopify.productTypesFilterLabel}</Text>
              <TextInput
                style={styles.input}
                value={productTypesFilter}
                onChangeText={setProductTypesFilter}
                placeholder={t.shopify.productTypesFilterPlaceholder}
                placeholderTextColor={colors.placeholder}
              />
              <Text style={styles.fieldSubHelper}>{t.shopify.productTypesFilterHelper}</Text>

              {/* Samtycke (Consent) */}
              <View style={styles.divider} />
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={18} color={colors.primaryStrongText} />
                <Text style={styles.subSectionHeader}>{t.shopify.consentTitle}</Text>
              </View>
              <Text style={styles.fieldSubHelper}>{t.shopify.consentDesc}</Text>

              <TouchableOpacity
                style={[styles.radioCard, consentMode === 'RESPECT_OUTREACH' && styles.radioCardActive]}
                onPress={() => setConsentMode('RESPECT_OUTREACH')}
              >
                <View style={[styles.radioCircle, consentMode === 'RESPECT_OUTREACH' && styles.radioCircleActive]}>
                  {consentMode === 'RESPECT_OUTREACH' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>{t.shopify.consentRespect}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioCard, consentMode === 'REQUIRE_CONSENT' && styles.radioCardActive]}
                onPress={() => setConsentMode('REQUIRE_CONSENT')}
              >
                <View style={[styles.radioCircle, consentMode === 'REQUIRE_CONSENT' && styles.radioCircleActive]}>
                  {consentMode === 'REQUIRE_CONSENT' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>{t.shopify.consentRequire}</Text>
              </TouchableOpacity>

              {/* Rabattkoder parametrar */}
              <View style={styles.divider} />
              <Text style={styles.label}>{t.shopify.discountPrefixLabel}</Text>
              <TextInput
                style={styles.input}
                value={discountPrefix}
                onChangeText={setDiscountPrefix}
                placeholder="BONUS-"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>{t.shopify.discountValidityLabel}</Text>
              <TextInput
                style={styles.input}
                value={discountValidityDays}
                onChangeText={setDiscountValidityDays}
                keyboardType="numeric"
                placeholder="90"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* SEKTION 3: SYNKRONISERING */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <RefreshCw size={20} color={colors.primaryStrongText} />
                <Text style={styles.sectionHeader}>{t.shopify.syncTitle}</Text>
              </View>
              <Text style={styles.helperText}>{t.shopify.syncDesc}</Text>

              <TouchableOpacity
                style={styles.syncBtn}
                onPress={handleSyncArticles}
                disabled={syncing || !isConfigured}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <RefreshCw size={16} color="#fff" />
                    <Text style={styles.syncBtnText}>{t.shopify.syncBtn}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* SPARA-KNAPP */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>{t.shopify.saveBtn}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 2: RABATTKODER */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'DISCOUNTS' && (
          <View style={styles.card}>
            <View style={styles.filterRow}>
              {(['ALL', 'ACTIVE', 'USED'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, discountFilter === filter && styles.filterChipActive]}
                  onPress={() => setDiscountFilter(filter)}
                >
                  <Text
                    style={[styles.filterChipText, discountFilter === filter && styles.filterChipTextActive]}
                  >
                    {filter === 'ALL'
                      ? t.shopify.filterAll
                      : filter === 'ACTIVE'
                      ? t.shopify.filterActive
                      : t.shopify.filterUsed}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredDiscounts.length === 0 ? (
              <Text style={styles.emptyText}>{t.shopify.emptyDiscounts}</Text>
            ) : (
              filteredDiscounts.map((discount) => {
                const isActiveCode = discount.status === 'ACTIVE';
                return (
                  <View key={discount.id} style={styles.discountCard}>
                    <View style={styles.discountTop}>
                      <View>
                        <Text style={styles.discountCodeText}>{discount.code}</Text>
                        <Text style={styles.discountAmountText}>
                          {discount.discountAmount} {currency} rabatt
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          isActiveCode ? styles.statusPillActive : styles.statusPillUsed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            isActiveCode ? styles.statusPillTextActive : styles.statusPillTextUsed,
                          ]}
                        >
                          {isActiveCode ? t.shopify.filterActive : t.shopify.filterUsed}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.discountCustomer}>
                      Kund: {discount.customerPhone || discount.customerEmail || 'Anonym'}
                    </Text>

                    {discount.expiresAt && isActiveCode && (
                      <Text style={styles.discountMeta}>
                        {t.shopify.expiresOn(new Date(discount.expiresAt).toLocaleDateString())}
                      </Text>
                    )}

                    {!isActiveCode && discount.usedInOrderId && (
                      <Text style={styles.discountMeta}>
                        {t.shopify.redeemedInOrder(discount.usedInOrderId)}
                      </Text>
                    )}

                    {isActiveCode && (
                      <TouchableOpacity
                        style={styles.inStoreRedeemBtn}
                        onPress={() => handleRedeemDiscountInStore(discount)}
                      >
                        <ShoppingBag size={14} color={colors.primaryStrongText} />
                        <Text style={styles.inStoreRedeemText}>{t.shopify.inStoreRedeemBtn}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 3: SYNKADE ORDRAR */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'ORDERS' && (
          <View style={styles.card}>
            {recentOrders.length === 0 ? (
              <Text style={styles.emptyText}>{t.shopify.emptyOrders}</Text>
            ) : (
              recentOrders.map((ord) => (
                <View key={ord.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderNumber}>{ord.orderNumber}</Text>
                    <Text style={styles.orderTotal}>
                      {ord.totalPrice} {currency}
                    </Text>
                  </View>
                  <View style={styles.orderMetaRow}>
                    <Text style={styles.orderCustomer}>
                      {ord.customerPhone || ord.customerEmail || 'Kund'}
                    </Text>
                    <View style={styles.pointsPill}>
                      <Text style={styles.pointsPillText}>+{ord.pointsAwarded} poäng</Text>
                    </View>
                  </View>
                  <Text style={styles.orderDate}>
                    {new Date(ord.processedAt).toLocaleString()} ({ord.sourceName})
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    headerCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    headerIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
    },
    headerSub: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 9,
      borderRadius: 8,
      gap: 6,
    },
    tabBtnActive: {
      backgroundColor: colors.primary,
    },
    tabBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabBtnTextActive: {
      color: '#fff',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    subSectionHeader: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    helperText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 14,
      lineHeight: 18,
    },
    fieldSubHelper: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -6,
      marginBottom: 12,
      lineHeight: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surfaceInput,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
    },
    webhookBox: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 10,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    webhookBoxTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    webhookBoxDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
    },
    webhookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    webhookText: {
      flex: 1,
      fontSize: 11,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: colors.textSecondary,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 4,
    },
    copyBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    testBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    testBtnText: {
      color: colors.primaryStrongText,
      fontSize: 13,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    radioCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      backgroundColor: colors.surfaceInput,
    },
    radioCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    radioCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.textMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    radioCircleActive: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    radioText: {
      fontSize: 13,
      color: colors.text,
      flex: 1,
      fontWeight: '500',
    },
    syncBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 11,
      borderRadius: 8,
      gap: 8,
    },
    syncBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      marginBottom: 20,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      paddingVertical: 24,
      fontSize: 14,
    },
    discountCard: {
      backgroundColor: colors.surfaceInput,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    discountTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    discountCodeText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    discountAmountText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryStrongText,
      marginTop: 2,
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusPillActive: {
      backgroundColor: colors.primarySoft,
    },
    statusPillUsed: {
      backgroundColor: colors.border,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
    },
    statusPillTextActive: {
      color: colors.success,
    },
    statusPillTextUsed: {
      color: colors.textMuted,
    },
    discountCustomer: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    discountMeta: {
      fontSize: 11,
      color: colors.textMuted,
    },
    inStoreRedeemBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      paddingVertical: 7,
      borderRadius: 6,
      gap: 6,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    inStoreRedeemText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    orderCard: {
      backgroundColor: colors.surfaceInput,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    orderNumber: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    orderTotal: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    orderMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    orderCustomer: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    pointsPill: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pointsPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    orderDate: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
