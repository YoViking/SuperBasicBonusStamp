import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveSettings } from '../db/operations';
import { db } from '../db/client';
import { bonusSettings } from '../db/schema';

export default function BonusSettingsScreen() {
  const [threshold, setThreshold] = useState('1000');
  const [reward, setReward] = useState('100');
  const [message, setMessage] = useState('Grattis! Du har fått en bonus.');

  useEffect(() => {
    const loadSettings = async () => {
      const data = await db.query.bonusSettings.findFirst();
      if (data) {
        setThreshold(data.threshold.toString());
        setReward(data.rewardAmount.toString());
        setMessage(data.bonusMessage);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await saveSettings(parseFloat(threshold), parseFloat(reward), message);
      Alert.alert("Sparat", "Bonusreglerna har uppdaterats!");
    } catch (err) {
      Alert.alert("Fel", "Kunde inte spara inställningar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gräns för bonus (kr):</Text>
      <TextInput style={styles.input} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
      
      <Text style={styles.label}>Bonus att ge (kr):</Text>
      <TextInput style={styles.input} value={reward} onChangeText={setReward} keyboardType="numeric" />
      
      <Text style={styles.label}>SMS-meddelande vid bonus:</Text>
      <TextInput style={[styles.input, { height: 100 }]} value={message} onChangeText={setMessage} multiline />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Uppdatera Regler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#fff' },
  label: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 25, fontSize: 18, padding: 5 },
  saveButton: { backgroundColor: '#28a745', padding: 20, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

