
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Real-time Integration
 * Updated for latest FindTEU API documentation specifications.
 */

const API_BASE_URL = "https://www.findteu.com/api/v1/tracking/get_tracking";
const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] Connecting to FindTEU for ${cleanId}...`);
    
    // API Call following documentation: GET with number and key
    const url = `${API_BASE_URL}?number=${cleanId}&key=${FINDTEU_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    
    // FindTEU response structure parsing
    if (json.status === 'success' && json.data) {
      const track = json.data.tracking || json.data;
      console.log(`[Corsair] Live data confirmed for ${cleanId}`);
      
      return {
        containerId: track.container_number || cleanId,
        carrier: track.carrier_name || track.carrier || "Global Carrier",
        vessel: track.vessel_name || track.vessel || "Pending Assignment",
        voyage: track.voyage_number || track.voyage || "TBD",
        origin: track.pol_name || track.pol || "Origin Port",
        destination: track.pod_name || track.pod || "Destination Port",
        status: mapStatus(track.status),
        percentage: track.progress_percentage || calculatePercentage(track.status),
        eta: track.eta || "Scheduled",
        isRealTime: true,
        lastSync: new Date().toLocaleTimeString(),
        events: (track.events || []).map((e: any) => ({
          status: e.status_description || e.status || "Update",
          location: e.location || "Transit Point",
          timestamp: e.event_date || e.timestamp || "N/A",
          description: e.details || "",
          type: determineEventType(e.status || '')
        }))
      };
    } else {
      console.warn(`[Corsair] No live record for ${cleanId} in FindTEU network. Status: ${json.status}`);
      throw new Error("No live tracking information available for this container ID.");
    }

  } catch (err: any) {
    console.error(`[Corsair] API Connection Failed:`, err.message);
    // Fallback to simulation mode but mark isRealTime as FALSE
    return getVirtualData(cleanId);
  }
}

function calculatePercentage(status: string = ''): number {
  const s = status.toLowerCase();
  if (s.includes('delivered') || s.includes('arrived')) return 100;
  if (s.includes('discharged')) return 90;
  if (s.includes('transit')) return 60;
  if (s.includes('sailed')) return 30;
  return 10;
}

function determineEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('at sea') || s.includes('sailed')) return 'SEA';
  if (s.includes('gate') || s.includes('truck') || s.includes('rail')) return 'LAND';
  return 'PORT';
}

function mapStatus(s: string = ''): any {
  const status = s.toUpperCase();
  if (status.includes('TRANSIT') || status.includes('ON BOARD')) return 'IN_TRANSIT';
  if (status.includes('GATE') || status.includes('LAND')) return 'GATE_IN';
  if (status.includes('ARRIV')) return 'ARRIVED';
  return 'IN_TRANSIT';
}

function getVirtualData(id: string): ContainerDetails {
  return {
    containerId: id,
    carrier: "CORSAIR GLOBAL",
    vessel: "VIRTUAL CARRIER 01",
    voyage: "SIM-2025",
    origin: "SHANGHAI, CN",
    destination: "LOS ANGELES, US",
    status: 'IN_TRANSIT',
    percentage: 45,
    eta: "2025-02-12",
    isRealTime: false,
    lastSync: "OFFLINE MODE",
    events: [
      {
        status: 'Data Simulation Active',
        location: 'SYSTEM LOCAL',
        timestamp: new Date().toISOString().split('T')[0],
        description: 'Unable to fetch live data from FindTEU. Showing simulated trajectory.',
        type: 'PORT'
      }
    ]
  };
}
