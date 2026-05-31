import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { ChargingStation } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  station: ChargingStation | null;
  onClose: () => void;
  onLogExpense: (station: ChargingStation) => void;
}

function StatusBadge({ isOperational, title }: { isOperational?: boolean; title?: string }) {
  const color =
    isOperational === true ? '#22c55e' : isOperational === false ? '#ef4444' : '#f59e0b';
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{title ?? 'Unknown'}</Text>
    </View>
  );
}

export default function StationDetailSheet({ station, onClose, onLogExpense }: Props) {
  if (!station) return null;

  const operationalCount = station.connections.filter(
    (c) => c.statusType?.isOperational === true
  ).length;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {station.name}
            </Text>
            <Text style={styles.address}>{station.address}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <StatusBadge
            isOperational={station.statusType?.isOperational}
            title={station.statusType?.title}
          />
          {station.operatorName && (
            <Text style={styles.operator}>{station.operatorName}</Text>
          )}
        </View>

        {station.usageCost && (
          <View style={styles.costRow}>
            <Ionicons name="cash-outline" size={16} color="#6366f1" />
            <Text style={styles.costText}>{station.usageCost}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Connectors ({station.connections.length} total
          {operationalCount > 0 ? `, ${operationalCount} available` : ''})
        </Text>

        <ScrollView style={styles.connectors} showsVerticalScrollIndicator={false}>
          {station.connections.map((conn, i) => (
            <View key={conn.id || i} style={styles.connector}>
              <View style={styles.connectorLeft}>
                <Ionicons name="flash-outline" size={16} color="#6366f1" />
                <Text style={styles.connType}>{conn.connectionType}</Text>
              </View>
              <View style={styles.connectorRight}>
                {conn.powerKW && (
                  <Text style={styles.power}>{conn.powerKW} kW</Text>
                )}
                {conn.statusType && (
                  <StatusBadge
                    isOperational={conn.statusType.isOperational}
                    title={conn.statusType.title}
                  />
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => onLogExpense(station)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.logBtnText}>Log Charging Expense</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#111' },
  address: { fontSize: 13, color: '#888', marginTop: 2 },
  closeBtn: { padding: 4, marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  operator: { fontSize: 12, color: '#888' },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  costText: { fontSize: 13, color: '#6366f1', fontWeight: '500' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  connectors: { maxHeight: 180, marginBottom: 16 },
  connector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  connectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  connType: { fontSize: 13, color: '#333' },
  connectorRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  power: { fontSize: 12, color: '#888' },
  logBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
