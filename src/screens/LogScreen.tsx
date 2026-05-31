import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import LogExpenseModal from '../components/LogExpenseModal';
import { getExpenseSummary } from '../services/database';
import { getSettings } from '../services/userSettings';

interface Summary { totalCost: number; totalKwh: number; sessionCount: number; }

export default function LogScreen() {
  const [showLog, setShowLog] = useState(false);
  const [summary, setSummary] = useState<Summary>({ totalCost: 0, totalKwh: 0, sessionCount: 0 });
  const [sym, setSym] = useState('฿');

  useFocusEffect(useCallback(() => {
    getExpenseSummary().then(setSummary);
    setSym(getSettings().currencySymbol);
  }, []));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Log Session</Text>

      <View style={styles.summaryGrid}>
        <StatCard icon="flash" color="#6366f1" label="Total kWh" value={summary.totalKwh.toFixed(1)} />
        <StatCard icon="cash-outline" color="#22c55e" label="Total Spent"
          value={`${sym}${summary.totalCost.toFixed(2)}`} />
        <StatCard icon="repeat-outline" color="#f59e0b" label="Sessions"
          value={summary.sessionCount.toString()} />
        <StatCard icon="speedometer-outline" color="#06b6d4" label={`Avg ${sym}/kWh`}
          value={summary.totalKwh > 0 ? `${sym}${(summary.totalCost / summary.totalKwh).toFixed(3)}` : '—'} />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowLog(true)}>
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.addBtnText}>Log New Session</Text>
      </TouchableOpacity>

      <View style={styles.tip}>
        <Ionicons name="information-circle-outline" size={16} color="#6366f1" />
        <Text style={styles.tipText}>
          Record kWh charged, rate, duration, and notes for each charging session.
        </Text>
      </View>

      <LogExpenseModal
        visible={showLog}
        onClose={() => setShowLog(false)}
        onSaved={() => { setShowLog(false); getExpenseSummary().then(setSummary); }}
      />
    </ScrollView>
  );
}

function StatCard({ icon, color, label, value }: {
  icon: keyof typeof Ionicons.glyphMap; color: string; label: string; value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 20 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '47%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: {
    backgroundColor: '#6366f1', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  tip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#ede9fe', borderRadius: 12, padding: 12,
  },
  tipText: { flex: 1, fontSize: 13, color: '#6366f1', lineHeight: 18 },
});
