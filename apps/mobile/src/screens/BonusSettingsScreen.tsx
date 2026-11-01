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
  DEFAULT_STAMP_PURCHASE_MESSAGE,
  DEFAULT_STAMP_BONUS_MESSAGE,
  DEFAULT_POINTS_PURCHASE_MESSAGE,
  DEFAULT_POINTS_BONUS_MESSAGE,
  normalizePurchaseTemplate,
  normalizeBonusTemplate,
  formatSmsMessage,
} from '../services/smsFormatter';
import { useTheme, ThemeColors } from '../theme/ThemeContext';

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [storeName, setStoreName] = useState('Min Butik');
  const [bonusType, setBonusType] = useState<BonusType>('STAMPS');
  const [posMode, setPosMode] = useState<PosMode>('QUICK');
  const [threshold, setThreshold] = useState('10');
  const [rewardAmount, setRewardAmount] = useState('1');
  const [rewardDescription, setRewardDescription] = useState('1 gratis vara');
  const [purchaseMessage, setPurchaseMessage] = useState(DEFAULT_STAMP_PURCHASE_MESSAGE);
  const [bonusMessage, setBonusMessage] = useState(DEFAULT_STAMP_BONUS_MESSAGE);
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
      { label: 'Butikens namn', tag: '{butik}' },
      { label: 'Kundens saldo', tag: '{saldo}' },
      { label: 'Kvar till bonus', tag: '{kvar_till_bonus}' },
      { label: 'Bonusen', tag: '{bonus}' },
      {
        label: bonusType === 'STAMPS' ? 'Nya stämplar' : 'Köpesumma',
        tag: bonusType === 'STAMPS' ? '{stämplar}' : '{köpesumma}',
      },
    ],
    [bonusType]
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
      setStoreName(data.storeName);
      setBonusType(data.bonusType);
      setPosMode(data.posMode);
      setThreshold(data.threshold.toString());
      setRewardAmount(data.rewardAmount.toString());
      setRewardDescription(data.rewardDescription || '1 gratis vara');
      setPurchaseMessage(
        normalizePurchaseTemplate(data.purchaseMessage, data.bonusType)
      );
      setBonusMessage(
        normalizeBonusTemplate(data.bonusMessage, data.bonusType)
      );
    } catch (err) {
      console.error('Kunde inte läsa butiksinställningar', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused]);

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
    setPurchaseMessage((prev) => normalizePurchaseTemplate(prev, nextType));
    setBonusMessage((prev) => normalizeBonusTemplate(prev, nextType));
  };

  const handleSave = async () => {
    try {
      const numThreshold =
        parseFloat(threshold) || (bonusType === 'STAMPS' ? 10 : 1000);
      const numReward =
        parseFloat(rewardAmount) || (bonusType === 'STAMPS' ? 1 : 100);

      await saveStoreSettings({
        storeName: storeName.trim() || 'Min Butik',
        bonusType,
        posMode,
        threshold: numThreshold,
        rewardAmount: numReward,
        rewardDescription: rewardDescription.trim() || '1 gratis vara',
        purchaseMessage: purchaseMessage.trim(),
        bonusMessage: bonusMessage.trim(),
      });

      Alert.alert(
        'Sparat!',
        'Butiksprofilen, kassaläget och bonusreglerna har uppdaterats.'
      );
    } catch (err: any) {
      Alert.alert('Fel', 'Kunde inte spara inställningar: ' + err.message);
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
          <Text style={styles.sectionHeader}>1. Butik & Kassaläge</Text>

          <Text style={styles.label}>Butikens namn (syns i SMS till kund):</Text>
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="t.ex. Café Hörnan"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.label}>Hur vill du använda kassan?</Text>
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
                Snabbläge
              </Text>
              <Text style={styles.modeDesc}>
                Slå bara in telefonnummer & ge stämpel/belopp direkt (ingen varukorg)
              </Text>
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
                Artikelläge
              </Text>
              <Text style={styles.modeDesc}>
                Välj varor från kategorier eller scanna streckkod till varukorg
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BONUSMODELL */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>2. Bonusmodell</Text>
          <Text style={styles.helperText}>
            Välj om dina kunder samlar stämplar (t.ex. var 10:e gratis) eller poäng baserat på kronor.
          </Text>

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
                Stämpelkort
              </Text>
              <Text style={styles.modeDesc}>
                Samla antal stämplar (t.ex. 10 st = 1 gratis)
              </Text>
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
                Poäng / Kronor
              </Text>
              <Text style={styles.modeDesc}>
                Handla för ett belopp (t.ex. 1000 kr = 100 kr rabatt)
              </Text>
            </TouchableOpacity>
          </View>

          {bonusType === 'STAMPS' ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Antal stämplar för fullt kort:</Text>
              <TextInput
                style={styles.input}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholder="t.ex. 10"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.label}>
                Vad får kunden när kortet är fullt? (beskrivning i SMS & kassa):
              </Text>
              <TextInput
                style={styles.input}
                value={rewardDescription}
                onChangeText={setRewardDescription}
                placeholder="t.ex. 1 valfri kaffe / 1 gratis klippning"
                placeholderTextColor={colors.placeholder}
              />

              {posMode === 'ARTICLES' && (
                <>
                  <Text style={styles.label}>
                    Rabattvärde i kr vid inlösen i varukorg (valfritt):
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={rewardAmount}
                    onChangeText={setRewardAmount}
                    keyboardType="numeric"
                    placeholder="t.ex. 45"
                    placeholderTextColor={colors.placeholder}
                  />
                </>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Gräns för bonus (kr):</Text>
              <TextInput
                style={styles.input}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholder="t.ex. 1000"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.label}>Bonus att ge i rabatt (kr):</Text>
              <TextInput
                style={styles.input}
                value={rewardAmount}
                onChangeText={setRewardAmount}
                keyboardType="numeric"
                placeholder="t.ex. 100"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          )}
        </View>

        {/* 3. SMS-MALL VID VANLIGT KÖP / STÄMPEL */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>3. SMS-mall vid vanligt besök</Text>
          <Text style={styles.helperText}>
            Anpassa meddelandet som skickas till kunden. Tryck på en knapp nedan för att lägga till automatisk uppgift i texten:
          </Text>

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
            placeholder="Skriv SMS-mallen..."
            placeholderTextColor={colors.placeholder}
          />

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() =>
              setPurchaseMessage(
                bonusType === 'STAMPS'
                  ? DEFAULT_STAMP_PURCHASE_MESSAGE
                  : DEFAULT_POINTS_PURCHASE_MESSAGE
              )
            }
          >
            <Text style={styles.resetButtonText}>Återställ till standardmall</Text>
          </TouchableOpacity>

          <View style={styles.previewBox}>
            <View style={styles.previewTitleRow}>
              <Smartphone size={15} color={colors.primaryStrongText} />
              <Text style={styles.previewTitle}>Förhandsgranskning:</Text>
            </View>
            <Text style={styles.previewText}>{previewPurchase}</Text>
          </View>
        </View>

        {/* 4. SMS-MALL VID UPPNÅDD BONUS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>4. SMS-mall vid uppnådd bonus</Text>
          <Text style={styles.helperText}>
            Skickas när kunden fyller sitt kort eller når en ny bonusnivå. Tryck på en knapp för att infoga uppgift:
          </Text>

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
            placeholder="Skriv SMS-mallen vid uppnådd bonus..."
            placeholderTextColor={colors.placeholder}
          />

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() =>
              setBonusMessage(
                bonusType === 'STAMPS'
                  ? DEFAULT_STAMP_BONUS_MESSAGE
                  : DEFAULT_POINTS_BONUS_MESSAGE
              )
            }
          >
            <Text style={styles.resetButtonText}>Återställ till standardmall</Text>
          </TouchableOpacity>

          <View style={styles.previewBox}>
            <View style={styles.previewTitleRow}>
              <PartyPopper size={15} color={colors.primaryStrongText} />
              <Text style={styles.previewTitle}>Förhandsgranskning:</Text>
            </View>
            <Text style={styles.previewText}>{previewBonus}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Spara alla inställningar</Text>
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
