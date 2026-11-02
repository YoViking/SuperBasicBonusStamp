import React, { useState, useEffect, useMemo } from 'react';
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
  Linking,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  Zap,
  ShoppingCart,
  Star,
  Coins,
  Smartphone,
  PartyPopper,
  Plus,
  SlidersHorizontal,
  Send,
  Users,
  Gift,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import {
  getStoreSettings,
  saveStoreSettings,
  getAllCustomers,
  Customer,
  BonusType,
  PosMode,
} from '../db/operations';
import {
  normalizePurchaseTemplate,
  normalizeBonusTemplate,
  normalizeRewardDescription,
  normalizeStoreName,
  formatSmsMessage,
} from '../services/smsFormatter';
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

type SubTab = 'SETTINGS' | 'OUTREACH';
type OutreachFilter = 'ALL' | 'HAS_BONUS' | 'CLOSE_TO_BONUS';

function getAllDefaultOutreachTemplates(): Set<string> {
  const set = new Set<string>();
  for (const lang of Object.values(translations)) {
    set.add(lang.bonusSettings.defaultCampaignMsg);
    set.add(lang.bonusSettings.defaultReminderHasBonusMsg);
    set.add(lang.bonusSettings.defaultReminderCloseMsg);
  }
  return set;
}

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { language, currencySymbol: currency, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('SETTINGS');

  const [storeName, setStoreName] = useState(t.pos.defaultStoreName);
  const [bonusType, setBonusType] = useState<BonusType>('STAMPS');
  const [posMode, setPosMode] = useState<PosMode>('QUICK');
  const [threshold, setThreshold] = useState('10');
  const [rewardAmount, setRewardAmount] = useState('1');
  const [rewardDescription, setRewardDescription] = useState(t.pos.defaultRewardDesc);
  const [purchaseMessage, setPurchaseMessage] = useState(t.sms.defaultStampPurchase);
  const [bonusMessage, setBonusMessage] = useState(t.sms.defaultStampBonus);
  const [purchaseSelection, setPurchaseSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [bonusSelection, setBonusSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // States för Utskick & Påminnelser
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [outreachFilter, setOutreachFilter] = useState<OutreachFilter>('ALL');
  const [outreachMessage, setOutreachMessage] = useState(
    t.bonusSettings.defaultCampaignMsg
  );
  const [outreachSelection, setOutreachSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [includeOptOut, setIncludeOptOut] = useState<boolean>(true);
  const [sentCustomerIds, setSentCustomerIds] = useState<string[]>([]);

  const smsQuickTags = useMemo(
    () => [
      { label: t.sms.tagStoreLabel, tag: t.sms.tagStore },
      { label: t.sms.tagBalanceLabel, tag: t.sms.tagBalance },
      { label: t.sms.tagRemainingLabel, tag: t.sms.tagRemaining },
      { label: t.sms.tagBonusLabel, tag: t.sms.tagBonus },
      {
        label: bonusType === 'STAMPS' ? t.sms.tagStampsLabel : t.sms.tagAmountLabel,
        tag: bonusType === 'STAMPS' ? t.sms.tagStamps : t.sms.tagAmount,
      },
    ],
    [bonusType, t]
  );

  const outreachQuickTags = useMemo(
    () => [
      { label: t.sms.tagStoreLabel, tag: t.sms.tagStore },
      { label: t.sms.tagBalanceLabel, tag: t.sms.tagBalance },
      { label: t.sms.tagRemainingLabel, tag: t.sms.tagRemaining },
      { label: t.sms.tagBonusLabel, tag: t.sms.tagBonus },
    ],
    [t]
  );

  const getDefaultOutreachTemplateForFilter = (filter: OutreachFilter) => {
    if (filter === 'HAS_BONUS') return t.bonusSettings.defaultReminderHasBonusMsg;
    if (filter === 'CLOSE_TO_BONUS') return t.bonusSettings.defaultReminderCloseMsg;
    return t.bonusSettings.defaultCampaignMsg;
  };

  const insertTag = (
    tag: string,
    currentText: string,
    setText: (val: string) => void,
    selection: { start: number; end: number } | null,
    setSelection: (sel: { start: number; end: number } | null) => void
  ) => {
    if (selection && selection.start <= currentText.length) {
      const before = currentText.slice(0, selection.start);
      const after = currentText.slice(selection.end);
      const needsSpaceBefore =
        before.length > 0 && !/\s$/.test(before) && !/[([{]$/.test(before);
      const needsSpaceAfter =
        after.length > 0 && !/^\s/.test(after) && !/^[.,!?)\]}]/.test(after);
      const inserted = `${needsSpaceBefore ? ' ' : ''}${tag}${
        needsSpaceAfter ? ' ' : ''
      }`;
      const nextText = `${before}${inserted}${after}`;
      const nextCursor = before.length + inserted.length;
      setText(nextText);
      setSelection({ start: nextCursor, end: nextCursor });
    } else {
      const needsSpace =
        currentText.length > 0 && !/\s$/.test(currentText);
      const nextText = `${currentText}${needsSpace ? ' ' : ''}${tag}`;
      setText(nextText);
      setSelection({ start: nextText.length, end: nextText.length });
    }
  };

  const loadSettingsAndCustomers = async () => {
    try {
      const [data, allCustomers] = await Promise.all([
        getStoreSettings(),
        getAllCustomers(),
      ]);
      setStoreName(normalizeStoreName(data.storeName, language));
      setBonusType(data.bonusType);
      setPosMode(data.posMode);
      setThreshold(data.threshold.toString());
      setRewardAmount(data.rewardAmount.toString());
      setRewardDescription(
        normalizeRewardDescription(data.rewardDescription, language)
      );
      setPurchaseMessage(
        normalizePurchaseTemplate(data.purchaseMessage, data.bonusType, language)
      );
      setBonusMessage(
        normalizeBonusTemplate(data.bonusMessage, data.bonusType, language)
      );
      setCustomers(allCustomers);
    } catch (err) {
      console.error('Kunde inte läsa butiksinställningar eller kunder', err);
    }
  };

  useEffect(() => {
    setStoreName((prev) => normalizeStoreName(prev, language));
    setRewardDescription((prev) => normalizeRewardDescription(prev, language));
    setPurchaseMessage((prev) =>
      normalizePurchaseTemplate(prev, bonusType, language)
    );
    setBonusMessage((prev) =>
      normalizeBonusTemplate(prev, bonusType, language)
    );
    setOutreachMessage((prev) => {
      const trimmed = prev.trim();
      if (!trimmed || getAllDefaultOutreachTemplates().has(trimmed)) {
        return getDefaultOutreachTemplateForFilter(outreachFilter);
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (isFocused) {
      loadSettingsAndCustomers();
    }
  }, [isFocused, language]);

  const handleSelectOutreachFilter = (nextFilter: OutreachFilter) => {
    if (nextFilter === outreachFilter) return;
    setOutreachFilter(nextFilter);
    setSentCustomerIds([]);
    setIncludeOptOut(nextFilter === 'ALL');

    setOutreachMessage((prev) => {
      const trimmed = prev.trim();
      if (!trimmed || getAllDefaultOutreachTemplates().has(trimmed)) {
        return getDefaultOutreachTemplateForFilter(nextFilter);
      }
      return prev;
    });
  };

  const handleSelectBonusType = (nextType: BonusType) => {
    if (nextType === bonusType) return;
    setBonusType(nextType);

    if (nextType === 'STAMPS') {
      if (threshold === '1000') setThreshold('10');
      if (rewardAmount === '100') setRewardAmount('1');
    } else {
      if (threshold === '10') setThreshold('1000');
      if (rewardAmount === '1') setRewardAmount('100');
    }
    setPurchaseMessage((prev) =>
      normalizePurchaseTemplate(prev, nextType, language)
    );
    setBonusMessage((prev) =>
      normalizeBonusTemplate(prev, nextType, language)
    );
  };

  const handleSave = async () => {
    try {
      const numThreshold =
        parseFloat(threshold) || (bonusType === 'STAMPS' ? 10 : 1000);
      const numReward =
        parseFloat(rewardAmount) || (bonusType === 'STAMPS' ? 1 : 100);

      await saveStoreSettings({
        storeName: storeName.trim() || t.pos.defaultStoreName,
        bonusType,
        posMode,
        threshold: numThreshold,
        rewardAmount: numReward,
        rewardDescription: rewardDescription.trim() || t.pos.defaultRewardDesc,
        purchaseMessage: purchaseMessage.trim(),
        bonusMessage: bonusMessage.trim(),
      });

      Alert.alert(t.bonusSettings.savedTitle, t.bonusSettings.savedMsg);
    } catch (err: any) {
      Alert.alert(t.pos.errorTitle, t.bonusSettings.saveErrorMsg + err.message);
    }
  };

  const numThreshold = Math.max(
    1,
    parseFloat(threshold) || (bonusType === 'STAMPS' ? 10 : 1000)
  );
  const numReward =
    parseFloat(rewardAmount) || (bonusType === 'STAMPS' ? 1 : 100);

  const sampleAmount = bonusType === 'STAMPS' ? 1 : 350;
  const sampleProgress = bonusType === 'STAMPS' ? 4 : 350;
  const sampleRemaining = Math.max(0, numThreshold - sampleProgress);

  const previewPurchase = formatSmsMessage(purchaseMessage, {
    amount: sampleAmount,
    remaining: sampleRemaining,
    reward: numReward,
    threshold: numThreshold,
    storeName,
    rewardDescription,
    currentProgress: sampleProgress,
    bonusType,
    language,
    currencySymbol: currency,
  });

  const previewBonus = formatSmsMessage(bonusMessage, {
    amount: sampleAmount,
    remaining: numThreshold,
    reward: numReward,
    threshold: numThreshold,
    storeName,
    rewardDescription,
    currentProgress: numThreshold,
    bonusType,
    language,
    currencySymbol: currency,
  });

  // Filtrera kunder för Utskick & Påminnelser
  const isCustomerCloseToBonus = (c: Customer) => {
    const progress = c.currentBalance % numThreshold;
    if (progress <= 0) return false;
    const remaining = numThreshold - progress;
    if (bonusType === 'STAMPS') {
      const closeLimit = Math.max(1, Math.min(3, Math.floor(numThreshold * 0.3)));
      return remaining <= closeLimit;
    }
    return progress >= numThreshold * 0.7;
  };

  const hasBonusCustomers = useMemo(
    () => customers.filter((c) => c.currentBalance >= numThreshold),
    [customers, numThreshold]
  );

  const closeToBonusCustomers = useMemo(
    () => customers.filter(isCustomerCloseToBonus),
    [customers, numThreshold, bonusType]
  );

  const filteredCustomers = useMemo(() => {
    if (outreachFilter === 'HAS_BONUS') return hasBonusCustomers;
    if (outreachFilter === 'CLOSE_TO_BONUS') return closeToBonusCustomers;
    return customers;
  }, [outreachFilter, customers, hasBonusCustomers, closeToBonusCustomers]);

  const formatCustomerOutreachSms = (customer?: Customer) => {
    const balance = customer ? customer.currentBalance : sampleProgress;
    const progress = balance % numThreshold;
    const hasFullBonus = balance >= numThreshold && progress === 0;
    const effectiveProgress = hasFullBonus ? numThreshold : progress;
    const remaining = hasFullBonus
      ? 0
      : Math.max(0, numThreshold - effectiveProgress);

    let msg = formatSmsMessage(outreachMessage, {
      amount: 1,
      remaining,
      reward: numReward,
      threshold: numThreshold,
      storeName,
      rewardDescription,
      currentProgress: effectiveProgress,
      bonusType,
      language,
      currencySymbol: currency,
    });

    if (includeOptOut) {
      const cleanStore = storeName.trim() || t.pos.defaultStoreName;
      msg += t.bonusSettings.optOutFooter(cleanStore);
    }

    return msg;
  };

  const previewOutreach = formatCustomerOutreachSms(filteredCustomers[0]);

  const sendOutreachSmsToCustomer = (customer: Customer) => {
    const msg = formatCustomerOutreachSms(customer);
    const url = `sms:${customer.phoneNumber}${
      Platform.OS === 'ios' ? '&' : '?'
    }body=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
    setSentCustomerIds((prev) =>
      prev.includes(customer.id) ? prev : [...prev, customer.id]
    );
  };

  const nextUnsentCustomer = useMemo(
    () => filteredCustomers.find((c) => !sentCustomerIds.includes(c.id)),
    [filteredCustomers, sentCustomerIds]
  );

  const nextUnsentIndex = useMemo(() => {
    if (!nextUnsentCustomer) return filteredCustomers.length;
    return (
      filteredCustomers.findIndex((c) => c.id === nextUnsentCustomer.id) + 1
    );
  }, [filteredCustomers, nextUnsentCustomer]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 180 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* TOPP-SWITCH: INSTÄLLNINGAR & MALLAR | UTSKICK & PÅMINNELSER */}
        <View style={styles.subTabRow}>
          <TouchableOpacity
            style={[
              styles.subTabBtn,
              activeSubTab === 'SETTINGS' && styles.subTabBtnActive,
            ]}
            onPress={() => setActiveSubTab('SETTINGS')}
          >
            <SlidersHorizontal
              size={17}
              color={
                activeSubTab === 'SETTINGS'
                  ? '#fff'
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'SETTINGS' && styles.subTabTextActive,
              ]}
            >
              {t.bonusSettings.tabSettings}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.subTabBtn,
              activeSubTab === 'OUTREACH' && styles.subTabBtnActive,
            ]}
            onPress={() => {
              setActiveSubTab('OUTREACH');
              loadSettingsAndCustomers();
            }}
          >
            <Send
              size={17}
              color={
                activeSubTab === 'OUTREACH'
                  ? '#fff'
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'OUTREACH' && styles.subTabTextActive,
              ]}
            >
              {t.bonusSettings.tabOutreach}
            </Text>
          </TouchableOpacity>
        </View>

        {activeSubTab === 'SETTINGS' ? (
          <>
            {/* 1. BUTIKSPROFIL & KASSALÄGE */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>{t.bonusSettings.section1Title}</Text>

              <Text style={styles.label}>{t.bonusSettings.storeNameLabel}</Text>
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder={t.bonusSettings.storeNamePlaceholder}
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.label}>{t.bonusSettings.posModeLabel}</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    posMode === 'QUICK' && styles.modeCardActive,
                  ]}
                  onPress={() => setPosMode('QUICK')}
                >
                  <View style={styles.modeIconWrapper}>
                    <Zap
                      size={26}
                      color={
                        posMode === 'QUICK'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeTitle,
                      posMode === 'QUICK' && styles.modeTitleActive,
                    ]}
                  >
                    {t.bonusSettings.quickModeTitle}
                  </Text>
                  <Text style={styles.modeDesc}>{t.bonusSettings.quickModeDesc}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    posMode === 'ARTICLES' && styles.modeCardActive,
                  ]}
                  onPress={() => setPosMode('ARTICLES')}
                >
                  <View style={styles.modeIconWrapper}>
                    <ShoppingCart
                      size={26}
                      color={
                        posMode === 'ARTICLES'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeTitle,
                      posMode === 'ARTICLES' && styles.modeTitleActive,
                    ]}
                  >
                    {t.bonusSettings.articlesModeTitle}
                  </Text>
                  <Text style={styles.modeDesc}>{t.bonusSettings.articlesModeDesc}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. BONUSMODELL */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>{t.bonusSettings.section2Title}</Text>
              <Text style={styles.helperText}>{t.bonusSettings.section2Helper}</Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    bonusType === 'STAMPS' && styles.modeCardActive,
                  ]}
                  onPress={() => handleSelectBonusType('STAMPS')}
                >
                  <View style={styles.modeIconWrapper}>
                    <Star
                      size={26}
                      color={
                        bonusType === 'STAMPS'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeTitle,
                      bonusType === 'STAMPS' && styles.modeTitleActive,
                    ]}
                  >
                    {t.bonusSettings.stampCardTitle}
                  </Text>
                  <Text style={styles.modeDesc}>{t.bonusSettings.stampCardDesc}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    bonusType === 'POINTS' && styles.modeCardActive,
                  ]}
                  onPress={() => handleSelectBonusType('POINTS')}
                >
                  <View style={styles.modeIconWrapper}>
                    <Coins
                      size={26}
                      color={
                        bonusType === 'POINTS'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeTitle,
                      bonusType === 'POINTS' && styles.modeTitleActive,
                    ]}
                  >
                    {t.bonusSettings.pointsTitle}
                  </Text>
                  <Text style={styles.modeDesc}>
                    {t.bonusSettings.pointsDesc(currency)}
                  </Text>
                </TouchableOpacity>
              </View>

              {bonusType === 'STAMPS' ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>{t.bonusSettings.stampsThresholdLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={threshold}
                    onChangeText={setThreshold}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={colors.placeholder}
                  />

                  <Text style={styles.label}>
                    {t.bonusSettings.stampsRewardDescLabel}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={rewardDescription}
                    onChangeText={setRewardDescription}
                    placeholder={t.bonusSettings.stampsRewardDescPlaceholder}
                    placeholderTextColor={colors.placeholder}
                  />

                  {posMode === 'ARTICLES' && (
                    <>
                      <Text style={styles.label}>
                        {t.bonusSettings.stampsDiscountValueLabel(currency)}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={rewardAmount}
                        onChangeText={setRewardAmount}
                        keyboardType="numeric"
                        placeholder="45"
                        placeholderTextColor={colors.placeholder}
                      />
                    </>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>
                    {t.bonusSettings.pointsThresholdLabel(currency)}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={threshold}
                    onChangeText={setThreshold}
                    keyboardType="numeric"
                    placeholder="1000"
                    placeholderTextColor={colors.placeholder}
                  />

                  <Text style={styles.label}>
                    {t.bonusSettings.pointsRewardLabel(currency)}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={rewardAmount}
                    onChangeText={setRewardAmount}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              )}
            </View>

            {/* 3. SMS-MALL VID VANLIGT KÖP / STÄMPEL */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>{t.bonusSettings.section3Title}</Text>
              <Text style={styles.helperText}>{t.bonusSettings.section3Helper}</Text>

              <View style={styles.tagChipsRow}>
                {smsQuickTags.map((item) => (
                  <TouchableOpacity
                    key={item.tag}
                    style={styles.tagChip}
                    onPress={() =>
                      insertTag(
                        item.tag,
                        purchaseMessage,
                        setPurchaseMessage,
                        purchaseSelection,
                        setPurchaseSelection
                      )
                    }
                  >
                    <Plus size={13} color={colors.primaryStrongText} />
                    <Text style={styles.tagChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textArea}
                value={purchaseMessage}
                onChangeText={setPurchaseMessage}
                onSelectionChange={(e) =>
                  setPurchaseSelection(e.nativeEvent.selection)
                }
                multiline
                numberOfLines={4}
                placeholder={t.bonusSettings.purchaseTemplatePlaceholder}
                placeholderTextColor={colors.placeholder}
              />

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() =>
                  setPurchaseMessage(
                    bonusType === 'STAMPS'
                      ? t.sms.defaultStampPurchase
                      : t.sms.defaultPointsPurchase
                  )
                }
              >
                <Text style={styles.resetButtonText}>
                  {t.bonusSettings.resetTemplateBtn}
                </Text>
              </TouchableOpacity>

              <View style={styles.previewBox}>
                <View style={styles.previewTitleRow}>
                  <Smartphone size={15} color={colors.primaryStrongText} />
                  <Text style={styles.previewTitle}>{t.bonusSettings.previewLabel}</Text>
                </View>
                <Text style={styles.previewText}>{previewPurchase}</Text>
              </View>
            </View>

            {/* 4. SMS-MALL VID UPPNÅDD BONUS */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>{t.bonusSettings.section4Title}</Text>
              <Text style={styles.helperText}>{t.bonusSettings.section4Helper}</Text>

              <View style={styles.tagChipsRow}>
                {smsQuickTags.map((item) => (
                  <TouchableOpacity
                    key={item.tag}
                    style={styles.tagChip}
                    onPress={() =>
                      insertTag(
                        item.tag,
                        bonusMessage,
                        setBonusMessage,
                        bonusSelection,
                        setBonusSelection
                      )
                    }
                  >
                    <Plus size={13} color={colors.primaryStrongText} />
                    <Text style={styles.tagChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textArea}
                value={bonusMessage}
                onChangeText={setBonusMessage}
                onSelectionChange={(e) =>
                  setBonusSelection(e.nativeEvent.selection)
                }
                multiline
                numberOfLines={4}
                placeholder={t.bonusSettings.bonusTemplatePlaceholder}
                placeholderTextColor={colors.placeholder}
              />

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() =>
                  setBonusMessage(
                    bonusType === 'STAMPS'
                      ? t.sms.defaultStampBonus
                      : t.sms.defaultPointsBonus
                  )
                }
              >
                <Text style={styles.resetButtonText}>
                  {t.bonusSettings.resetTemplateBtn}
                </Text>
              </TouchableOpacity>

              <View style={styles.previewBox}>
                <View style={styles.previewTitleRow}>
                  <PartyPopper size={15} color={colors.primaryStrongText} />
                  <Text style={styles.previewTitle}>{t.bonusSettings.previewLabel}</Text>
                </View>
                <Text style={styles.previewText}>{previewBonus}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t.bonusSettings.saveAllBtn}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* 1. VÄLJ MÅLGRUPP */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>
                {t.bonusSettings.outreachFilterTitle}
              </Text>
              <Text style={styles.helperText}>
                {t.bonusSettings.outreachFilterHelper}
              </Text>

              <View style={styles.filterCardsColumn}>
                <TouchableOpacity
                  style={[
                    styles.filterCard,
                    outreachFilter === 'ALL' && styles.modeCardActive,
                  ]}
                  onPress={() => handleSelectOutreachFilter('ALL')}
                >
                  <View style={styles.filterCardLeft}>
                    <Users
                      size={22}
                      color={
                        outreachFilter === 'ALL'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.filterCardTitle,
                          outreachFilter === 'ALL' && styles.modeTitleActive,
                        ]}
                      >
                        {t.bonusSettings.filterAllTitle}
                      </Text>
                      <Text style={styles.filterCardDesc}>
                        {t.bonusSettings.filterAllDesc}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{customers.length}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterCard,
                    outreachFilter === 'HAS_BONUS' && styles.modeCardActive,
                  ]}
                  onPress={() => handleSelectOutreachFilter('HAS_BONUS')}
                >
                  <View style={styles.filterCardLeft}>
                    <Gift
                      size={22}
                      color={
                        outreachFilter === 'HAS_BONUS'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.filterCardTitle,
                          outreachFilter === 'HAS_BONUS' && styles.modeTitleActive,
                        ]}
                      >
                        {t.bonusSettings.filterHasBonusTitle}
                      </Text>
                      <Text style={styles.filterCardDesc}>
                        {t.bonusSettings.filterHasBonusDesc}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {hasBonusCustomers.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterCard,
                    outreachFilter === 'CLOSE_TO_BONUS' && styles.modeCardActive,
                  ]}
                  onPress={() => handleSelectOutreachFilter('CLOSE_TO_BONUS')}
                >
                  <View style={styles.filterCardLeft}>
                    <Sparkles
                      size={22}
                      color={
                        outreachFilter === 'CLOSE_TO_BONUS'
                          ? colors.primaryStrongText
                          : colors.textSecondary
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.filterCardTitle,
                          outreachFilter === 'CLOSE_TO_BONUS' &&
                            styles.modeTitleActive,
                        ]}
                      >
                        {t.bonusSettings.filterCloseToBonusTitle}
                      </Text>
                      <Text style={styles.filterCardDesc}>
                        {t.bonusSettings.filterCloseToBonusDesc}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {closeToBonusCustomers.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. MEDDELANDE */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>
                {t.bonusSettings.outreachMessageTitle}
              </Text>
              <Text style={styles.helperText}>
                {t.bonusSettings.outreachMessageHelper}
              </Text>

              <View style={styles.tagChipsRow}>
                {outreachQuickTags.map((item) => (
                  <TouchableOpacity
                    key={item.tag}
                    style={styles.tagChip}
                    onPress={() =>
                      insertTag(
                        item.tag,
                        outreachMessage,
                        setOutreachMessage,
                        outreachSelection,
                        setOutreachSelection
                      )
                    }
                  >
                    <Plus size={13} color={colors.primaryStrongText} />
                    <Text style={styles.tagChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textArea}
                value={outreachMessage}
                onChangeText={setOutreachMessage}
                onSelectionChange={(e) =>
                  setOutreachSelection(e.nativeEvent.selection)
                }
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.placeholder}
              />

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() =>
                  setOutreachMessage(
                    getDefaultOutreachTemplateForFilter(outreachFilter)
                  )
                }
              >
                <Text style={styles.resetButtonText}>
                  {t.bonusSettings.resetTemplateBtn}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optOutRow}
                onPress={() => setIncludeOptOut((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkbox,
                    includeOptOut && styles.checkboxChecked,
                  ]}
                >
                  {includeOptOut && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.optOutLabel}>
                  {t.bonusSettings.includeOptOutLabel}
                </Text>
              </TouchableOpacity>

              <View style={styles.previewBox}>
                <View style={styles.previewTitleRow}>
                  <Smartphone size={15} color={colors.primaryStrongText} />
                  <Text style={styles.previewTitle}>
                    {t.bonusSettings.previewLabel}
                  </Text>
                </View>
                <Text style={styles.previewText}>{previewOutreach}</Text>
              </View>
            </View>

            {/* 3. SNABBKÖ FÖR UTSKICK */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>
                {t.bonusSettings.outreachQueueTitle(filteredCustomers.length)}
              </Text>
              <Text style={styles.helperText}>
                {t.bonusSettings.outreachQueueHelper}
              </Text>

              {filteredCustomers.length === 0 ? (
                <Text style={styles.emptyQueueText}>
                  {t.bonusSettings.emptyFilterCustomers}
                </Text>
              ) : (
                <>
                  {nextUnsentCustomer ? (
                    <TouchableOpacity
                      style={styles.sendNextButton}
                      onPress={() =>
                        sendOutreachSmsToCustomer(nextUnsentCustomer)
                      }
                    >
                      <Send size={18} color="#fff" />
                      <Text style={styles.sendNextButtonText}>
                        {t.bonusSettings.sendNextBtn(
                          nextUnsentIndex,
                          filteredCustomers.length,
                          nextUnsentCustomer.phoneNumber
                        )}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.allSentContainer}>
                      <View style={styles.allSentBadge}>
                        <Check size={18} color="#fff" />
                        <Text style={styles.allSentText}>
                          {t.bonusSettings.allSentBadge}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.resetQueueBtn}
                        onPress={() => setSentCustomerIds([])}
                      >
                        <RotateCcw size={15} color={colors.primaryStrongText} />
                        <Text style={styles.resetQueueBtnText}>
                          {t.bonusSettings.resetQueueBtn}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.customerQueueList}>
                    {filteredCustomers.map((customer) => {
                      const isSent = sentCustomerIds.includes(customer.id);
                      const availableBonuses = Math.floor(
                        customer.currentBalance / numThreshold
                      );
                      const progress = customer.currentBalance % numThreshold;
                      const balanceLabel =
                        bonusType === 'STAMPS'
                          ? `${progress} ${t.sms.ofWord} ${numThreshold} ${t.sms.stampPlural}`
                          : `${progress} ${t.sms.ofWord} ${numThreshold} ${currency}`;

                      return (
                        <View
                          key={customer.id}
                          style={[
                            styles.customerQueueRow,
                            isSent && styles.customerQueueRowSent,
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.customerPhoneText}>
                              {customer.phoneNumber}
                            </Text>
                            <View style={styles.customerMetaRow}>
                              <Text style={styles.customerBalanceText}>
                                {balanceLabel}
                              </Text>
                              {availableBonuses > 0 && (
                                <View style={styles.customerBonusPill}>
                                  <Text style={styles.customerBonusPillText}>
                                    {t.bonusSettings.customerBonusReadyBadge(
                                      availableBonuses
                                    )}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.customerSendBtn,
                              isSent && styles.customerSendBtnSent,
                            ]}
                            onPress={() => sendOutreachSmsToCustomer(customer)}
                          >
                            {isSent ? (
                              <>
                                <Check size={14} color={colors.success} />
                                <Text style={styles.customerSendBtnTextSent}>
                                  {t.bonusSettings.customerSentStatus}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Send
                                  size={13}
                                  color={colors.primaryStrongText}
                                />
                                <Text style={styles.customerSendBtnText}>
                                  {t.bonusSettings.customerSendSingleBtn}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 18 },
    subTabRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    subTabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 11,
      paddingHorizontal: 10,
      borderRadius: 9,
    },
    subTabBtnActive: {
      backgroundColor: colors.primary,
    },
    subTabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    subTabTextActive: {
      color: '#fff',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionHeader: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    helperText: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 14,
    },
    boldText: {
      fontWeight: '700',
      color: colors.text,
    },
    label: {
      fontSize: 14,
      marginBottom: 6,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 16,
      padding: 12,
      backgroundColor: colors.surfaceInput,
      color: colors.text,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    modeCard: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.surfaceInput,
      alignItems: 'center',
    },
    modeCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    modeIconWrapper: {
      marginBottom: 6,
    },
    modeTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    modeTitleActive: {
      color: colors.primaryStrongText,
    },
    modeDesc: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
    },
    filterCardsColumn: {
      gap: 10,
    },
    filterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.surfaceInput,
    },
    filterCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    filterCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    filterCardDesc: {
      fontSize: 13,
      color: colors.textMuted,
    },
    countBadge: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 16,
      marginLeft: 10,
    },
    countBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    textArea: {
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 10,
      marginBottom: 12,
      fontSize: 15,
      padding: 12,
      backgroundColor: colors.surfaceInput,
      minHeight: 85,
      textAlignVertical: 'top',
      lineHeight: 22,
      color: colors.text,
    },
    tagChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
    },
    tagChipText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    resetButton: {
      alignSelf: 'flex-start',
      marginBottom: 14,
    },
    resetButtonText: {
      color: colors.primaryText,
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    optOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.borderInput,
      backgroundColor: colors.surfaceInput,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optOutLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    previewBox: {
      backgroundColor: colors.primarySoft,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      padding: 14,
      borderRadius: 8,
    },
    previewTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    previewTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    previewText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    emptyQueueText: {
      fontSize: 14,
      color: colors.textMuted,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: 14,
    },
    sendNextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    sendNextButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    allSentContainer: {
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    allSentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.success,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      width: '100%',
      justifyContent: 'center',
    },
    allSentText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    resetQueueBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
    },
    resetQueueBtnText: {
      color: colors.primaryStrongText,
      fontSize: 14,
      fontWeight: '600',
    },
    customerQueueList: {
      gap: 8,
    },
    customerQueueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceInput,
    },
    customerQueueRowSent: {
      opacity: 0.65,
    },
    customerPhoneText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    customerMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    customerBalanceText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    customerBonusPill: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
    },
    customerBonusPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    customerSendBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primarySoftBorder,
    },
    customerSendBtnSent: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    customerSendBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primaryStrongText,
    },
    customerSendBtnTextSent: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
    },
    saveButton: {
      backgroundColor: colors.success,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.success,
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
  });
