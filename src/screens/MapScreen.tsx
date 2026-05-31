import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChargingStation } from '../types';
import { fetchNearbyStations } from '../services/openChargeMap';
import { useLocation } from '../hooks/useLocation';
import StationDetailSheet from '../components/StationDetailSheet';
import LogExpenseModal from '../components/LogExpenseModal';

// Lazy-load Leaflet only on web to avoid native bundling issues
let MapComponent: React.ComponentType<{
  center: [number, number];
  stations: ChargingStation[];
  onSelectStation: (s: ChargingStation) => void;
}> | null = null;

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MapComponent = require('../components/LeafletMap').default;
}

export default function MapScreen() {
  const { location, error: locationError, loading: locationLoading } = useLocation();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [logStation, setLogStation] = useState<ChargingStation | undefined>(undefined);
  const [showLog, setShowLog] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadStations = useCallback(async (lat: number, lng: number) => {
    setFetching(true);
    try {
      const data = await fetchNearbyStations({ latitude: lat, longitude: lng, radiusKm: 15 });
      setStations(data);
    } catch {
      Alert.alert('Error', 'Could not load charging stations. Check your API key.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (location) loadStations(location.latitude, location.longitude);
  }, [location, loadStations]);

  function handleLogExpense(station: ChargingStation) {
    setSelectedStation(null);
    setLogStation(station);
    setShowLog(true);
  }

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  if (locationError || !location) {
    return (
      <View style={styles.center}>
        <Ionicons name="location-outline" size={48} color="#ccc" />
        <Text style={styles.errorText}>{locationError ?? 'Location unavailable'}</Text>
      </View>
    );
  }

  if (Platform.OS !== 'web' || !MapComponent) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Map is only available on web.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapComponent
        center={[location.latitude, location.longitude]}
        stations={stations}
        onSelectStation={setSelectedStation}
      />

      {fetching && (
        <View style={styles.fetchingBadge}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.fetchingText}>Loading stations…</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={() => loadStations(location.latitude, location.longitude)}
      >
        <Ionicons name="refresh-outline" size={16} color="#6366f1" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      <View style={styles.legend}>
        <LegendDot color="#22c55e" label="Available" />
        <LegendDot color="#f59e0b" label="Unknown" />
        <LegendDot color="#ef4444" label="Offline" />
      </View>

      <StationDetailSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onLogExpense={handleLogExpense}
      />

      <LogExpenseModal
        visible={showLog}
        station={logStation}
        onClose={() => setShowLog(false)}
        onSaved={() => setShowLog(false)}
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorText: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  fetchingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  fetchingText: { fontSize: 13, color: '#6366f1' },
  refreshBtn: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  refreshText: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 10,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#555' },
});
