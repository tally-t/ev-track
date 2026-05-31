import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Text } from 'react-native';
import { ChargingStation } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  station: ChargingStation;
  onPress: (station: ChargingStation) => void;
}

function getMarkerColor(station: ChargingStation): string {
  const isOperational = station.statusType?.isOperational;
  if (isOperational === true) return '#22c55e';
  if (isOperational === false) return '#ef4444';
  return '#f59e0b';
}

export default function StationMarker({ station, onPress }: Props) {
  const color = getMarkerColor(station);

  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      onPress={() => onPress(station)}
    >
      <View style={[styles.pin, { backgroundColor: color }]}>
        <Ionicons name="flash" size={14} color="#fff" />
      </View>
      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle} numberOfLines={1}>
            {station.name}
          </Text>
          <Text style={styles.calloutSub}>{station.address}</Text>
          <Text style={[styles.status, { color }]}>
            {station.statusType?.title ?? 'Status unknown'}
          </Text>
          {station.connections.length > 0 && (
            <Text style={styles.calloutSub}>
              {station.connections.length} connector
              {station.connections.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
    color: '#111',
  },
  calloutSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
