import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface LocationState {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        setError('Geolocation not supported by this browser.');
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          // Fall back to Bangkok if permission denied
          setLocation({ latitude: 13.7563, longitude: 100.5018 });
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      (async () => {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLoading(false);
      })();
    }
  }, []);

  return { location, error, loading };
}
