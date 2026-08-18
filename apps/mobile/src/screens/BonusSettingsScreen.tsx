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
import { saveSettings } from '../db/operations';
import { db } from '../db/client';
import { bonusSettings } from '../db/schema';
import { useIsFocused } from '@react-navigation/native';
import {
  DEFAULT_PURCHASE_MESSAGE,
  DEFAULT_BONUS_MESSAGE,
  formatSmsMessage,
} from '../services/smsFormatter';

export default function BonusSettingsScreen() {
  const isFocused = useIsFocused();
  const [threshold, setThreshold] = useState('1000');
  const [reward, setReward] = useState('100');
  const [purchaseMessage, setPurchaseMessage] = useState(DEFAULT_PURCHASE_MESSAGE);
  const [bonusMessage, setBonusMessage] = useState(DEFAULT_BONUS_MESSAGE);

  const loadSettings = async () => {
    try {
      const data = await db.query.bonusSettings.findFirst();
      if (data) {
        setThreshold(data.threshold.toString());
        setReward(data.rewardAmount.toString());
        if (data.bonusMessage) {
          setBonusMessage(data.bonusMessage);
        }
        if (data.purchaseMessage) {
          setPurchaseMessage(data.purchaseMessage);
        }
      }
    } catch (err) {
      console.error("Kunde inte läsa bonusinställningar", err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused]);

  const handleSave = async () => {
    try {
      const numThreshold = parseFloat(threshold) || 1000;
      const numReward = parseFloat(reward) || 100;
      await saveSettings(
        numThreshold,
        numReward,
        bonusMessage.trim(),
        purchaseMessage.trim()
      );
      Alert.alert("Sparat!", "Bonusreglerna och båda SMS-mallarna har sparats!");
    } catch (err: any) {
      Alert.alert("Fel", "Kunde inte spara inställningar: " + err.message);
    }
  };

  const numThreshold = parseFloat(threshold) || 1000;
  const numReward = parseFloat(reward) || 100;

  // Live preview calculations
  const samplePurchaseAmount = 350;
  const sampleRemaining = Math.max(0, numThreshold - samplePurchaseAmount);

  const previewPurchase = formatSmsMessage(purchaseMessage, {
    amount: samplePurchaseAmount,
    remaining: sampleRemaining,
    reward: numReward,
    threshold: numThreshold,
  });

  const previewBonus = formatSmsMessage(bonusMessage, {
    amount: numThreshold,
    remaining: numThreshold,
    reward: numReward,
    threshold: numThreshold,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 220 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
      >
      {/* 1. BONUSREGLER */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Bonusregler</Text>
        
        <Text style={styles.label}>Gräns för bonus (kr):</Text>
        <TextInput
          style={styles.input}
          value={threshold}
          onChangeText={setThreshold}
          keyboardType="numeric"
          placeholder="t.ex. 1000"
        />

        <Text style={styles.label}>Bonus att ge (kr):</Text>
        <TextInput
          style={styles.input}
          value={reward}
          onChangeText={setReward}
          keyboardType="numeric"
          placeholder="t.ex. 100"
        />
      </View>

      {/* 2. SMS-MALL VID VANLIGT KÖP */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>1. SMS-mall vid vanligt köp</Text>
        <Text style={styles.helperText}>
          Skickas vid köp när kunden inte når en ny bonusnivå. Använd <Text style={styles.boldText}>X kr</Text> (eller <Text style={styles.boldText}>&#123;köpesumma&#125; kr</Text> / <Text style={styles.boldText}>&#123;kvar_till_bonus&#125; kr</Text>) i texten.
        </Text>

        <Text style={styles.label}>Meddelandetext:</Text>
        <TextInput
          style={styles.textArea}
          value={purchaseMessage}
          onChangeText={setPurchaseMessage}
          multiline
          numberOfLines={4}
          placeholder="Skriv SMS-mallen för vanligt köp..."
        />
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => setPurchaseMessage(DEFAULT_PURCHASE_MESSAGE)}
        >
          <Text style={styles.resetButtonText}>Återställ till standardmall</Text>
        </TouchableOpacity>

        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>📱 Förhandsgranskning (vid köp på 350 kr):</Text>
          <Text style={styles.previewText}>{previewPurchase}</Text>
        </View>
      </View>

      {/* 3. SMS-MALL VID UPPNÅDD BONUS */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>2. SMS-mall vid uppnådd bonus</Text>
        <Text style={styles.helperText}>
          Skickas när kunden når en ny bonusnivå. Använd <Text style={styles.boldText}>X kr</Text> (eller <Text style={styles.boldText}>&#123;köpesumma&#125; kr</Text> / <Text style={styles.boldText}>&#123;kvar_till_bonus&#125; kr</Text>) i texten.
        </Text>

        <Text style={styles.label}>Meddelandetext:</Text>
        <TextInput
          style={styles.textArea}
          value={bonusMessage}
          onChangeText={setBonusMessage}
          multiline
          numberOfLines={5}
          placeholder="Skriv SMS-mallen vid uppnådd bonus..."
        />
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => setBonusMessage(DEFAULT_BONUS_MESSAGE)}
        >
          <Text style={styles.resetButtonText}>Återställ till standardmall</Text>
        </TouchableOpacity>

        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>🎉 Förhandsgranskning (vid uppnådd bonus):</Text>
          <Text style={styles.previewText}>{previewBonus}</Text>
        </View>
      </View>

      {/* SPARA KNAPP */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Spara alla inställningar</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#111',
  },
  label: { fontSize: 15, marginBottom: 8, fontWeight: '600', color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 18,
    fontSize: 16,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
    padding: 12,
    backgroundColor: '#fafafa',
    minHeight: 90,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  resetButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  previewBox: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    marginTop: 5,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 6,
  },
  previewText: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

