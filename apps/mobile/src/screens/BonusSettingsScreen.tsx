import React, { useState, useEffect } from 'react';
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
  DEFAULT_STAMP_PURCHASE_MESSAGE,
  DEFAULT_STAMP_BONUS_MESSAGE,
  DEFAULT_POINTS_PURCHASE_MESSAGE,
  DEFAULT_POINTS_BONUS_MESSAGE,
  formatSmsMessage,
} from '../services/smsFormatter';

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();

  const [storeName, setStoreName] = useState('Min Butik');
  const [bonusType, setBonusType] = useState<BonusType>('STAMPS');
  const [posMode, setPosMode] = useState<PosMode>('QUICK');
  const [threshold, setThreshold] = useState('10');
  const [rewardAmount, setRewardAmount] = useState('1');
  const [rewardDescription, setRewardDescription] = useState('1 gratis vara');
  const [purchaseMessage, setPurchaseMessage] = useState(DEFAULT_STAMP_PURCHASE_MESSAGE);
  const [bonusMessage, setBonusMessage] = useState(DEFAULT_STAMP_BONUS_MESSAGE);

  const loadSettings = async () => {
    try {
      const data = await getStoreSettings();
      setStoreName(data.storeName);
      setBonusType(data.bonusType);
      setPosMode(data.posMode);
      setThreshold(data.threshold.toString());
      setRewardAmount(data.rewardAmount.toString());
      setRewardDescription(data.rewardDescription || '1 gratis vara');
      setPurchaseMessage(data.purchaseMessage);
      setBonusMessage(data.bonusMessage);
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
      if (purchaseMessage === DEFAULT_POINTS_PURCHASE_MESSAGE) {
        setPurchaseMessage(DEFAULT_STAMP_PURCHASE_MESSAGE);
      }
      if (bonusMessage === DEFAULT_POINTS_BONUS_MESSAGE) {
        setBonusMessage(DEFAULT_STAMP_BONUS_MESSAGE);
      }
    } else {
      if (threshold === '10') setThreshold('1000');
      if (rewardAmount === '1') setRewardAmount('100');
      if (purchaseMessage === DEFAULT_STAMP_PURCHASE_MESSAGE) {
        setPurchaseMessage(DEFAULT_POINTS_PURCHASE_MESSAGE);
      }
      if (bonusMessage === DEFAULT_STAMP_BONUS_MESSAGE) {
        setBonusMessage(DEFAULT_POINTS_BONUS_MESSAGE);
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
              <Text style={styles.modeEmoji}>⚡</Text>
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
              <Text style={styles.modeEmoji}>🛒</Text>
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
              <Text style={styles.modeEmoji}>⭐</Text>
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
              <Text style={styles.modeEmoji}>💰</Text>
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
              />

              <Text style={styles.label}>
                Vad får kunden när kortet är fullt? (beskrivning i SMS & kassa):
              </Text>
              <TextInput
                style={styles.input}
                value={rewardDescription}
                onChangeText={setRewardDescription}
                placeholder="t.ex. 1 valfri kaffe / 1 gratis klippning"
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
              />

              <Text style={styles.label}>Bonus att ge i rabatt (kr):</Text>
              <TextInput
                style={styles.input}
                value={rewardAmount}
                onChangeText={setRewardAmount}
                keyboardType="numeric"
                placeholder="t.ex. 100"
              />
            </View>
          )}
        </View>

        {/* 3. SMS-MALL VID VANLIGT KÖP / STÄMPEL */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>3. SMS-mall vid vanligt besök</Text>
          <Text style={styles.helperText}>
            Tillgängliga taggar:{' '}
            <Text style={styles.boldText}>&#123;butik&#125;</Text>,{' '}
            <Text style={styles.boldText}>&#123;saldo&#125;</Text>,{' '}
            <Text style={styles.boldText}>&#123;kvar_till_bonus&#125;</Text>,{' '}
            <Text style={styles.boldText}>&#123;bonus&#125;</Text> och{' '}
            <Text style={styles.boldText}>
              {bonusType === 'STAMPS' ? '{stämplar}' : '{köpesumma}'}
            </Text>
            .
          </Text>

          <TextInput
            style={styles.textArea}
            value={purchaseMessage}
            onChangeText={setPurchaseMessage}
            multiline
            numberOfLines={4}
            placeholder="Skriv SMS-mallen..."
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
            <Text style={styles.previewTitle}>📱 Förhandsgranskning:</Text>
            <Text style={styles.previewText}>{previewPurchase}</Text>
          </View>
        </View>

        {/* 4. SMS-MALL VID UPPNÅDD BONUS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>4. SMS-mall vid uppnådd bonus</Text>
          <Text style={styles.helperText}>
            Skickas när kunden fyller sitt kort eller når en ny bonusnivå.
          </Text>

          <TextInput
            style={styles.textArea}
            value={bonusMessage}
            onChangeText={setBonusMessage}
            multiline
            numberOfLines={4}
            placeholder="Skriv SMS-mallen vid uppnådd bonus..."
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
            <Text style={styles.previewTitle}>🎉 Förhandsgranskning:</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  modeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  modeEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  modeTitleActive: {
    color: '#1d4ed8',
  },
  modeDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    minHeight: 85,
    textAlignVertical: 'top',
    lineHeight: 22,
    color: '#111827',
  },
  resetButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  resetButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  previewBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16a34a',
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
