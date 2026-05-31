import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChargingStation } from '../types';
import { addExpense } from '../services/database';
import { getSettings } from '../services/userSettings';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  station?: ChargingStation;
  onClose: () => void;
  onSaved: () => void;
}

export default function LogExpenseModal({ visible, station, onClose, onSaved }: Props) {
  const [kwhCharged, setKwhCharged] = useState('');
  const [costPerKwh, setCostPerKwh] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { currencySymbol: sym, currency } = getSettings();

  const totalCost =
    parseFloat(kwhCharged || '0') * parseFloat(costPerKwh || '0');

  async function handleSave() {
    const kwh = parseFloat(kwhCharged);
    const rate = parseFloat(costPerKwh);
    if (!kwh || !rate) {
      Alert.alert('Required', 'Please enter kWh charged and cost per kWh.');
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        stationId: station?.id,
        stationName: station?.name,
        date: new Date().toISOString(),
        kwhCharged: kwh,
        costPerKwh: rate,
        totalCost: kwh * rate,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        notes: notes || undefined,
      });
      setKwhCharged('');
      setCostPerKwh('');
      setDurationMinutes('');
      setNotes('');
      onSaved();
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Log Charging Session</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {station && (
            <View style={styles.stationChip}>
              <Ionicons name="location-outline" size={14} color="#6366f1" />
              <Text style={styles.stationChipText} numberOfLines={1}>
                {station.name}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <Field label="kWh Charged *" unit="kWh">
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="e.g. 25.5"
                value={kwhCharged}
                onChangeText={setKwhCharged}
              />
            </Field>

            <Field label="Cost per kWh *" unit={`${sym}/kWh`}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder={currency === 'THB' ? 'e.g. 5.50' : 'e.g. 0.35'}
                value={costPerKwh}
                onChangeText={setCostPerKwh}
              />
            </Field>

            {kwhCharged && costPerKwh ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total cost</Text>
                <Text style={styles.totalValue}>{sym}{totalCost.toFixed(2)}</Text>
              </View>
            ) : null}

            <Field label="Duration" unit="min">
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="optional"
                value={durationMinutes}
                onChangeText={setDurationMinutes}
              />
            </Field>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="optional"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Session'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.label}>{label}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  stationChipText: { fontSize: 12, color: '#6366f1', fontWeight: '500', maxWidth: 250 },
  field: { marginBottom: 14 },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 4 },
  unit: { fontSize: 12, color: '#888' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#111',
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  totalLabel: { fontSize: 14, color: '#166534', fontWeight: '500' },
  totalValue: { fontSize: 18, color: '#16a34a', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
