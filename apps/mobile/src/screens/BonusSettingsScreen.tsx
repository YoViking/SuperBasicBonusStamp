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
  getStoreSettings,
  saveStoreSettings,
  BonusType,
  PosMode,
} from '../db/operations';
import {
  getAllDefaultPurchaseTemplates,
  getAllDefaultBonusTemplates,
  formatSmsMessage,
} from '../services/smsFormatter';
import { useTheme, ThemeColors } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const currency = 'kr';

  const [storeName, setStoreName] = useState(t.pos.defaultStoreName);
  const [bonusType, setBonusType] = useState<BonusType>('STAMPS');
  const [posMode, setPosMode] = useState<PosMode>('QUICK');
  const [threshold, setThreshold] = useState('10');
  const [rewardAmount, setRewardAmount] = useState('1');
  const [rewardDescription, setRewardDescription] = useState(t.pos.defaultRewardDesc);
  const [purchaseMessage, setPurchaseMessage] = useState(t.sms.defaultStampPurchase);
  const [bonusMessage, setBonusMessage] = useState(t.sms.defaultStampBonus);

  const loadSettings = async () => {
    try {
      const data = await getStoreSettings();
      setStoreName(data.storeName);
      setBonusType(data.bonusType);
      setPosMode(data.posMode);
      setThreshold(data.threshold.toString());
      setRewardAmount(data.rewardAmount.toString());
      setRewardDescription(data.rewardDescription || t.pos.defaultRewardDesc);

      const defaultPurchases = getAllDefaultPurchaseTemplates();
      const defaultBonuses = getAllDefaultBonusTemplates();

      if (defaultPurchases.has(data.purchaseMessage?.trim())) {
        setPurchaseMessage(
          data.bonusType === 'STAMPS'
            ? t.sms.defaultStampPurchase
            : t.sms.defaultPointsPurchase
        );
      } else {
        setPurchaseMessage(data.purchaseMessage);
      }

      if (defaultBonuses.has(data.bonusMessage?.trim())) {
        setBonusMessage(
          data.bonusType === 'STAMPS'
            ? t.sms.defaultStampBonus
            : t.sms.defaultPointsBonus
        );
      } else {
        setBonusMessage(data.bonusMessage);
      }
    } catch (err) {
      console.error('Kunde inte läsa butiksinställningar', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused, language]);

  const handleSelectBonusType = (nextType: BonusType) => {
    if (nextType === bonusType) return;
    setBonusType(nextType);

    const defaultPurchases = getAllDefaultPurchaseTemplates();
    const defaultBonuses = getAllDefaultBonusTemplates();

    if (nextType === 'STAMPS') {
      if (threshold === '1000') setThreshold('10');
      if (rewardAmount === '100') setRewardAmount('1');
      if (defaultPurchases.has(purchaseMessage.trim())) {
        setPurchaseMessage(t.sms.defaultStampPurchase);
      }
      if (defaultBonuses.has(bonusMessage.trim())) {
        setBonusMessage(t.sms.defaultStampBonus);
      }
    } else {
      if (threshold === '10') setThreshold('1000');
      if (rewardAmount === '1') setRewardAmount('100');
      if (defaultPurchases.has(purchaseMessage.trim())) {
        setPurchaseMessage(t.sms.defaultPointsPurchase);
      }
      if (defaultBonuses.has(bonusMessage.trim())) {
        setBonusMessage(t.sms.defaultPointsBonus);
      }
    }
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
              <Text style={styles.modeEmoji}>⚡</Text>
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
              <Text style={styles.modeEmoji}>🛒</Text>
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
              <Text style={styles.modeEmoji}>⭐</Text>
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
              <Text style={styles.modeEmoji}>💰</Text>
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
          <Text style={styles.helperText}>
            {t.bonusSettings.availableTagsLabel}{' '}
            <Text style={styles.boldText}>{t.sms.tagStore}</Text>,{' '}
            <Text style={styles.boldText}>{t.sms.tagBalance}</Text>,{' '}
            <Text style={styles.boldText}>{t.sms.tagRemaining}</Text>,{' '}
            <Text style={styles.boldText}>{t.sms.tagBonus}</Text>{' '}
            {t.bonusSettings.andWord}{' '}
            <Text style={styles.boldText}>
              {bonusType === 'STAMPS' ? t.sms.tagStamps : t.sms.tagAmount}
            </Text>
            .
          </Text>

          <TextInput
            style={styles.textArea}
            value={purchaseMessage}
            onChangeText={setPurchaseMessage}
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
            <Text style={styles.previewTitle}>
              📱 {t.bonusSettings.previewLabel}
            </Text>
            <Text style={styles.previewText}>{previewPurchase}</Text>
          </View>
        </View>

        {/* 4. SMS-MALL VID UPPNÅDD BONUS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t.bonusSettings.section4Title}</Text>
          <Text style={styles.helperText}>{t.bonusSettings.section4Helper}</Text>

          <TextInput
            style={styles.textArea}
            value={bonusMessage}
            onChangeText={setBonusMessage}
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
            <Text style={styles.previewTitle}>
              🎉 {t.bonusSettings.previewLabel}
            </Text>
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
    modeEmoji: {
      fontSize: 26,
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
    previewTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primaryStrongText,
      marginBottom: 4,
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
