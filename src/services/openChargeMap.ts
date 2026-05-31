import { ChargingStation } from '../types';

const BASE_URL = 'https://api.openchargemap.io/v3';
// Free API key - register at https://openchargemap.org/site/develop/api for higher limits
const API_KEY = 'a490a648-807c-4dc4-beaf-899dc9667f93';

interface FetchStationsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  maxResults?: number;
}

export async function fetchNearbyStations({
  latitude,
  longitude,
  radiusKm = 40,
  maxResults = 100,
}: FetchStationsParams): Promise<ChargingStation[]> {
  const params = new URLSearchParams({
    key: API_KEY,
    output: 'json',
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    distance: radiusKm.toString(),
    distanceunit: 'km',
    maxresults: maxResults.toString(),
    compact: 'false',
    verbose: 'false',
    includecomments: 'false',
  });

  const url = `${BASE_URL}/poi/?${params}`;
  console.log('[OCM] Fetching:', url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OpenChargeMap error: ${response.status}`);

  const data = await response.json();
  console.log('[OCM] Stations received:', data.length);
  return data.map(mapToStation);
}

function mapToStation(raw: any): ChargingStation {
  return {
    id: raw.ID?.toString() ?? '',
    name: raw.AddressInfo?.Title ?? 'Unknown Station',
    address: [
      raw.AddressInfo?.AddressLine1,
      raw.AddressInfo?.Town,
      raw.AddressInfo?.StateOrProvince,
    ]
      .filter(Boolean)
      .join(', '),
    latitude: raw.AddressInfo?.Latitude ?? 0,
    longitude: raw.AddressInfo?.Longitude ?? 0,
    operatorName: raw.OperatorInfo?.Title,
    usageCost: raw.UsageCost,
    statusType: raw.StatusType
      ? {
          id: raw.StatusType.ID,
          title: raw.StatusType.Title,
          isOperational: raw.StatusType.IsOperational ?? false,
        }
      : undefined,
    connections: (raw.Connections ?? []).map((c: any) => ({
      id: c.ID?.toString() ?? '',
      connectionType: c.ConnectionType?.Title ?? 'Unknown',
      powerKW: c.PowerKW,
      quantity: c.Quantity,
      statusType: c.StatusType
        ? {
            id: c.StatusType.ID,
            title: c.StatusType.Title,
            isOperational: c.StatusType.IsOperational ?? false,
          }
        : undefined,
    })),
  };
}
