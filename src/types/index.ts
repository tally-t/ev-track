export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connections: Connection[];
  statusType?: StatusType;
  usageCost?: string;
  operatorName?: string;
}

export interface Connection {
  id: string;
  connectionType: string;
  powerKW?: number;
  quantity?: number;
  statusType?: StatusType;
}

export interface StatusType {
  id: number;
  title: string;
  isOperational: boolean;
}

export interface ExpenseLog {
  id: number;
  stationId?: string;
  stationName?: string;
  date: string;
  kwhCharged: number;
  costPerKwh: number;
  totalCost: number;
  durationMinutes?: number;
  notes?: string;
}
