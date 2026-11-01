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
} from 'lucide-react-native';
import {
  getStoreSettings,
  saveStoreSettings,
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

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { language, currencySymbol: currency, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const loadSettings = async () => {
    try {
      const data = await getStoreSettings();
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
    } catch (err) {
      console.error('Kunde inte läsa butiksinställningar', err);
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
  }, [language]);

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused, language]);

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

  const numThreshold =
    parseFloat(threshold) || (bonusType === 'STAMPS' ? 10 : 1000);
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 18 },
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
