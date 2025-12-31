
export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  type: 'SEA' | 'LAND' | 'PORT';
}

export interface ContainerDetails {
  containerId: string;
  carrier: string;
  vessel: string;
  voyage: string;
  origin: string;
  destination: string;
  status: 'IN_TRANSIT' | 'ARRIVED' | 'DELAYED' | 'DISCHARGED' | 'GATE_IN';
  events: TrackingEvent[];
  eta: string;
  percentage: number;
  isRealTime: boolean;
  lastSync: string;
}

export interface SavedContainer {
  id: string;
  carrier: string;
  status: string;
  lastUpdated: string;
}

export interface AIInsight {
  summary: string;
  prediction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}
