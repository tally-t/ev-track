import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getAllExpenses } from '../services/database';
import { getSettings } from '../services/userSettings';
import { ExpenseLog } from '../types';
import LogExpenseModal from '../components/LogExpenseModal';

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function buildMonthlyData(expenses: ExpenseLog[]) {
  const map: Record<string, { cost: number; kwh: number; sessions: number }> = {};
  expenses.forEach((e) => {
    const key = monthKey(e.date);
    if (!map[key]) map[key] = { cost: 0, kwh: 0, sessions: 0 };
    map[key].cost += e.totalCost;
    map[key].kwh += e.kwhCharged;
    map[key].sessions += 1;
  });
  return Object.entries(map)
    .slice(-6)
    .map(([month, v]) => ({ month, ...v, cost: parseFloat(v.cost.toFixed(2)) }));
}

function buildStationData(expenses: ExpenseLog[]) {
  const map: Record<string, { cost: number; sessions: number }> = {};
  expenses.forEach((e) => {
    const key = e.stationName ?? 'Unknown';
    if (!map[key]) map[key] = { cost: 0, sessions: 0 };
    map[key].cost += e.totalCost;
    map[key].sessions += 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 5)
    .map(([name, v]) => ({ name, ...v }));
}

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [sym, setSym] = useState('฿');

  useFocusEffect(
    useCallback(() => {
      getAllExpenses().then(setExpenses);
      setSym(getSettings().currencySymbol);
    }, [])
  );

  const totalCost = expenses.reduce((s, e) => s + e.totalCost, 0);
  const totalKwh = expenses.reduce((s, e) => s + e.kwhCharged, 0);
  const avgRate = totalKwh > 0 ? totalCost / totalKwh : 0;
  const totalSessions = expenses.length;
  const avgPerSession = totalSessions > 0 ? totalCost / totalSessions : 0;

  const monthlyData = buildMonthlyData(expenses);
  const stationData = buildStationData(expenses);

  const settings = getSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {settings.name ? `Hi, ${settings.name} 👋` : 'Dashboard'}
          </Text>
          {settings.carModel ? (
            <Text style={styles.carModel}>{settings.carModel}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.logBtnText}>Log</Text>
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <StatCard icon="cash-outline" color="#6366f1" label="Total Spent"
          value={`${sym}${totalCost.toFixed(2)}`} />
        <StatCard icon="flash" color="#22c55e" label="Total kWh"
          value={totalKwh.toFixed(1)} />
        <StatCard icon="repeat-outline" color="#f59e0b" label="Sessions"
          value={totalSessions.toString()} />
        <StatCard icon="speedometer-outline" color="#06b6d4" label={`Avg ${sym}/kWh`}
          value={avgRate > 0 ? `${sym}${avgRate.toFixed(3)}` : '—'} />
        <StatCard icon="wallet-outline" color="#ec4899" label="Avg/Session"
          value={avgPerSession > 0 ? `${sym}${avgPerSession.toFixed(2)}` : '—'} />
        <StatCard icon="battery-charging-outline" color="#84cc16" label="Avg kWh/Session"
          value={totalSessions > 0 ? (totalKwh / totalSessions).toFixed(1) : '—'} />
      </View>

      {/* Monthly spend chart */}
      {monthlyData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Spend</Text>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: any) => [`${sym}${Number(v).toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </View>
      )}

      {/* Monthly kWh chart */}
      {monthlyData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly kWh Charged</Text>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)} kWh`, 'Energy']} />
              <Bar dataKey="kwh" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </View>
      )}

      {/* Top stations */}
      {stationData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Stations</Text>
          {stationData.map((s, i) => (
            <View key={s.name} style={styles.stationRow}>
              <View style={styles.stationLeft}>
                <Text style={styles.rank}>#{i + 1}</Text>
                <View>
                  <Text style={styles.stationName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.stationMeta}>{s.sessions} session{s.sessions !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              <Text style={styles.stationCost}>{sym}{s.cost.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {expenses.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="analytics-outline" size={52} color="#ddd" />
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyBody}>Log your first charging session to see stats here.</Text>
          <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.logBtnText}>Log Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <LogExpenseModal
        visible={showLog}
        onClose={() => setShowLog(false)}
        onSaved={() => { setShowLog(false); getAllExpenses().then(setExpenses); }}
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
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#111' },
  carModel: { fontSize: 13, color: '#888', marginTop: 2 },
  logBtn: {
    backgroundColor: '#6366f1', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    width: '30.5%', shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 2,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  stationRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0',
  },
  stationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rank: { fontSize: 13, fontWeight: '700', color: '#6366f1', width: 24 },
  stationName: { fontSize: 13, fontWeight: '600', color: '#111', maxWidth: 200 },
  stationMeta: { fontSize: 11, color: '#888', marginTop: 1 },
  stationCost: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#999' },
  emptyBody: { fontSize: 13, color: '#bbb', textAlign: 'center' },
});
