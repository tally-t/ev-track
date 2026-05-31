import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseLog } from '../types';
import { getAllExpenses, deleteExpense } from '../services/database';
import { getSettings } from '../services/userSettings';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [sym, setSym] = useState('฿');

  const reload = useCallback(() => {
    getAllExpenses().then(setExpenses);
    setSym(getSettings().currencySymbol);
  }, []);

  useFocusEffect(reload);

  function confirmDelete(id: number) {
    Alert.alert('Delete Session', 'Remove this expense log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(id);
          reload();
        },
      },
    ]);
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={56} color="#ccc" />
        <Text style={styles.emptyTitle}>No sessions yet</Text>
        <Text style={styles.emptyBody}>
          Log your first charging session from the Map or Log tab.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>History</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="flash" size={18} color="#6366f1" />
              </View>
              <View>
                <Text style={styles.stationName} numberOfLines={1}>
                  {item.stationName ?? 'Unknown Station'}
                </Text>
                <Text style={styles.dateText}>
                  {formatDate(item.date)} · {formatTime(item.date)}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{item.kwhCharged.toFixed(1)} kWh</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>${item.costPerKwh.toFixed(3)}/kWh</Text>
                  {item.durationMinutes && (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.meta}>{item.durationMinutes} min</Text>
                    </>
                  )}
                </View>
                {item.notes ? (
                  <Text style={styles.notes} numberOfLines={1}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cost}>{sym}{item.totalCost.toFixed(2)}</Text>
              <TouchableOpacity
                onPress={() => confirmDelete(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    padding: 20,
    paddingBottom: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationName: { fontSize: 14, fontWeight: '600', color: '#111', maxWidth: 200 },
  dateText: { fontSize: 12, color: '#888', marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  meta: { fontSize: 12, color: '#555' },
  metaDot: { fontSize: 12, color: '#ccc' },
  notes: { fontSize: 11, color: '#aaa', marginTop: 3, fontStyle: 'italic' },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  cost: { fontSize: 17, fontWeight: '700', color: '#16a34a' },
  deleteBtn: { padding: 4 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#666' },
  emptyBody: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
});
