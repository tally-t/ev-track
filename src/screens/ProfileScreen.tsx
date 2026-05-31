import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getSettings, saveSettings, CURRENCIES, UserSettings,
} from '../services/userSettings';
import { getExpenseSummary, getAllExpenses } from '../services/database';

export default function ProfileScreen() {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [summary, setSummary] = useState({ totalCost: 0, totalKwh: 0, sessionCount: 0 });
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSettings(getSettings());
      getExpenseSummary().then(setSummary);
    }, [])
  );

  function update(key: keyof UserSettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function selectCurrency(code: string, symbol: string) {
    const updated = { ...settings, currency: code, currencySymbol: symbol };
    setSettings(updated);
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all your expense logs. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const all = await getAllExpenses();
            const { deleteExpense } = await import('../services/database');
            for (const e of all) await deleteExpense(e.id);
            getExpenseSummary().then(setSummary);
            Alert.alert('Done', 'All data cleared.');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {settings.name ? settings.name[0].toUpperCase() : '?'}
          </Text>
        </View>
        <View>
          <Text style={styles.displayName}>{settings.name || 'Your Name'}</Text>
          <Text style={styles.displayCar}>{settings.carModel || 'Add your car model'}</Text>
        </View>
      </View>

      {/* Stats summary */}
      <View style={styles.statsRow}>
        <MiniStat label="Sessions" value={summary.sessionCount.toString()} />
        <MiniStat label="Total kWh" value={summary.totalKwh.toFixed(1)} />
        <MiniStat
          label={`Total (${settings.currency})`}
          value={`${settings.currencySymbol}${summary.totalCost.toFixed(2)}`}
        />
      </View>

      {/* Personal info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <Field label="Name">
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={settings.name}
            onChangeText={(v) => update('name', v)}
          />
        </Field>
        <Field label="EV Car Model">
          <TextInput
            style={styles.input}
            placeholder="e.g. Tesla Model 3, BYD Atto 3"
            value={settings.carModel}
            onChangeText={(v) => update('carModel', v)}
          />
        </Field>
      </View>

      {/* Currency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <View style={styles.currencyGrid}>
          {CURRENCIES.map((c) => {
            const selected = settings.currency === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.currencyChip, selected && styles.currencyChipSelected]}
                onPress={() => selectCurrency(c.code, c.symbol)}
              >
                <Text style={[styles.currencySymbol, selected && styles.currencySymbolSelected]}>
                  {c.symbol}
                </Text>
                <Text style={[styles.currencyCode, selected && styles.currencyCodeSelected]}>
                  {c.code}
                </Text>
                <Text style={[styles.currencyLabel, selected && styles.currencyLabelSelected]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave}>
        <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Profile'}</Text>
      </TouchableOpacity>

      {/* Danger zone */}
      <View style={styles.danger}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.dangerBtnText}>Clear All Expense Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 20 },
  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  displayName: { fontSize: 17, fontWeight: '700', color: '#111' },
  displayCar: { fontSize: 13, color: '#888', marginTop: 2 },
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 14,
  },
  miniStat: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 2,
  },
  miniStatValue: { fontSize: 16, fontWeight: '800', color: '#6366f1' },
  miniStatLabel: { fontSize: 10, color: '#888', marginTop: 3, textAlign: 'center' },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 12 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, fontSize: 15, backgroundColor: '#fafafa', color: '#111',
  },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', minWidth: 80,
  },
  currencyChipSelected: { borderColor: '#6366f1', backgroundColor: '#ede9fe' },
  currencySymbol: { fontSize: 18, fontWeight: '700', color: '#666' },
  currencySymbolSelected: { color: '#6366f1' },
  currencyCode: { fontSize: 12, fontWeight: '700', color: '#888', marginTop: 2 },
  currencyCodeSelected: { color: '#6366f1' },
  currencyLabel: { fontSize: 9, color: '#aaa', marginTop: 1, textAlign: 'center' },
  currencyLabelSelected: { color: '#818cf8' },
  saveBtn: {
    backgroundColor: '#6366f1', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 20,
  },
  saveBtnDone: { backgroundColor: '#22c55e' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  danger: {
    borderWidth: 1.5, borderColor: '#fee2e2', borderRadius: 14,
    padding: 14, backgroundColor: '#fff5f5',
  },
  dangerTitle: { fontSize: 12, fontWeight: '700', color: '#ef4444', marginBottom: 10 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dangerBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
});
