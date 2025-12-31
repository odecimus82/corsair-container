
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * FindTEU API Integration Service
 * API Key: Jc2TW3qiXa-13928-SVQeQplQ2o-gmjkAFIzZl
 * Documentation: https://www.findteu.com/api-docs
 */

const API_BASE_URL = "https://www.findteu.com/api/v1";
const API_KEY = "Jc2TW3qiXa-13928-SVQeQplQ2o-gmjkAFIzZl";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();
  console.log(`[FindTEU] Initiating live tracking for: ${cleanId}`);

  try {
    // Attempting to fetch from the FindTEU tracking endpoint
    // Standard params: number (container), key (api key)
    const response = await fetch(`${API_BASE_URL}/tracking?number=${cleanId}&key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("API Key Invalid or Expired (401)");
      if (response.status === 404) throw new Error("Container not found or Carrier not supported (404)");
      throw new Error(`FindTEU Service Error: ${response.status}`);
    }

    const json = await response.json();

    // Handle case where API returns 200 but with an error status inside the payload
    if (json.status === 'error' || !json.data) {
      throw new Error(json.message || "No tracking data found for this container.");
    }

    const raw = json.data;

    // Mapping FindTEU API response to our high-tech ContainerDetails interface
    // Note: Adjusting field names based on typical FindTEU API structure
    return {
      containerId: raw.container_number || cleanId,
      carrier: raw.carrier_name || "Unknown Carrier",
      vessel: raw.vessel_name || "In Transit",
      voyage: raw.voyage_number || "N/A",
      origin: raw.pol_name || raw.origin_port || "Origin Unknown",
      destination: raw.pod_name || raw.destination_port || "Destination Unknown",
      status: mapStatus(raw.status),
      percentage: raw.progress_percentage || calculateProgress(raw.events),
      eta: raw.eta || "TBD",
      events: (raw.events || []).map((e: any): TrackingEvent => ({
        status: e.status_description || e.status,
        location: e.location || "N/A",
        timestamp: e.event_date || e.timestamp,
        description: e.details || "",
        type: detectEventType(e.status_description || e.status)
      }))
    };

  } catch (error: any) {
    console.error("[FindTEU] Request Failed:", error);
    
    // If we are in a dev environment and the real API is blocked by CORS 
    // or the key is not yet fully active, we provide a structured error
    throw new Error(error.message || "Failed to connect to FindTEU global network.");
  }
}

/**
 * Utility to map various carrier statuses to our internal enum
 */
function mapStatus(status: string): any {
  const s = (status || "").toUpperCase();
  if (s.includes("TRANSIT") || s.includes("ON_BOARD")) return 'IN_TRANSIT';
  if (s.includes("ARRIV")) return 'ARRIVED';
  if (s.includes("DELAY")) return 'DELAYED';
  if (s.includes("DISCHARGE")) return 'DISCHARGED';
  if (s.includes("GATE")) return 'GATE_IN';
  return 'IN_TRANSIT';
}

/**
 * Guess the transport type based on status text for icon assignment
 */
function detectEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('sailing') || s.includes('sea')) return 'SEA';
  if (s.includes('truck') || s.includes('gate') || s.includes('rail')) return 'LAND';
  return 'PORT';
}

/**
 * Calculate simple progress if not provided by API
 */
function calculateProgress(events: any[]): number {
  if (!events || events.length === 0) return 0;
  const latestStatus = events[0].status_description || "";
  if (latestStatus.toLowerCase().includes('delivered') || latestStatus.toLowerCase().includes('arrived')) return 100;
  return Math.min(95, Math.max(10, events.length * 20));
}
