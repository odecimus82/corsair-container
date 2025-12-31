
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Real-time Integration
 * This service communicates with the FindTEU tracking engine.
 */

// If you have a different API Key, please update it here or in Vercel Env
const API_BASE_URL = "https://www.findteu.com/api/v1";
const FINDTEU_API_KEY = "Jc2TW3qiXa-13928-SVQeQplQ2o-gmjkAFIzZl";

const CARRIER_MAP: Record<string, { scac: string, name: string }> = {
  'HLBU': { scac: 'HLCU', name: 'Hapag-Lloyd' },
  'HLCU': { scac: 'HLCU', name: 'Hapag-Lloyd' },
  'MEDU': { scac: 'MSCU', name: 'MSC' },
  'MSKU': { scac: 'MAEU', name: 'Maersk' },
  'COSU': { scac: 'COSU', name: 'COSCO' },
  'ONEU': { scac: 'ONEY', name: 'ONE' },
  'CMAU': { scac: 'CMDU', name: 'CMA CGM' },
  'SUDU': { scac: 'SUDU', name: 'Hamburg Sud' },
  'ZIMU': { scac: 'ZIMU', name: 'ZIM' },
};

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();
  const prefix = cleanId.substring(0, 4);
  const carrierInfo = CARRIER_MAP[prefix] || { scac: '', name: 'Global Alliance' };

  try {
    console.log(`[Corsair] Requesting live data for ${cleanId} via FindTEU...`);
    
    // Increased timeout for better reliability on slow API responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); 

    const url = `${API_BASE_URL}/tracking?number=${cleanId}&key=${FINDTEU_API_KEY}${carrierInfo.scac ? `&scac=${carrierInfo.scac}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      
      // Check for FindTEU success structure
      if (json.status === 'success' && json.data) {
        const raw = json.data;
        console.log(`[Corsair] Live data received for ${cleanId}`);
        
        return {
          containerId: raw.container_number || cleanId,
          carrier: raw.carrier_name || carrierInfo.name,
          vessel: raw.vessel_name || "Vessel Assigned",
          voyage: raw.voyage_number || "Voyage TBD",
          origin: raw.pol_name || "Origin Loading",
          destination: raw.pod_name || "Destination Discharging",
          status: mapStatus(raw.status),
          percentage: raw.progress_percentage || 50,
          eta: raw.eta || "Checking...",
          isRealTime: true,
          lastSync: new Date().toLocaleTimeString(),
          events: (raw.events || []).map((e: any) => ({
            status: e.status_description || e.status || "Status Update",
            location: e.location || "Transit Point",
            timestamp: e.event_date || e.timestamp || "N/A",
            description: e.details || "",
            type: determineEventType(e.status || '')
          }))
        };
      } else {
        console.warn(`[Corsair] API returned success:false or empty data: ${json.message || 'Unknown'}`);
      }
    } else {
      console.error(`[Corsair] API HTTP Error: ${response.status}`);
    }

    // If we reach here, API call happened but failed to get data
    throw new Error("No live record found in FindTEU network.");

  } catch (err: any) {
    console.error(`[Corsair] Real-time tracking error for ${cleanId}:`, err.message);
    
    // Return virtual data but CLEARLY MARKED as isRealTime: false
    // This allows the user to see SOMETHING while knowing it's not live.
    return getVirtualData(cleanId, carrierInfo.name);
  }
}

function determineEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('at sea') || s.includes('sailed')) return 'SEA';
  if (s.includes('gate') || s.includes('truck') || s.includes('rail')) return 'LAND';
  return 'PORT';
}

function getVirtualData(id: string, carrier: string): ContainerDetails {
  const now = new Date();
  const ago = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };

  return {
    containerId: id,
    carrier: carrier,
    vessel: "CORSAIR ENTERPRISE (VIRTUAL)",
    voyage: "CE-900W",
    origin: "SHANGHAI, CN",
    destination: "LOS ANGELES, US",
    status: 'IN_TRANSIT',
    percentage: 75,
    eta: "2025-01-15",
    isRealTime: false, // EXPLICITLY FALSE
    lastSync: "VIRTUAL MODE",
    events: [
      {
        status: 'Simulation Mode Active',
        location: 'SYSTEM FALLBACK',
        timestamp: new Date().toISOString().slice(0, 10),
        description: 'Live API connection unavailable. Displaying historical routing pattern.',
        type: 'PORT'
      },
      {
        status: 'Departed Port',
        location: 'SHANGHAI, CN',
        timestamp: ago(5),
        description: 'Vessel sailed from Yangshan Terminal.',
        type: 'SEA'
      }
    ]
  };
}

function mapStatus(s: string = ''): any {
  const status = s.toUpperCase();
  if (status.includes('TRANSIT') || status.includes('ON BOARD')) return 'IN_TRANSIT';
  if (status.includes('GATE') || status.includes('LAND')) return 'GATE_IN';
  if (status.includes('ARRIV')) return 'ARRIVED';
  return 'IN_TRANSIT';
}
