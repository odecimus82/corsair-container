
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Advanced Integration
 */

const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";
const BASE_URL = "https://api.findteu.com/v1/tracking/get_tracking";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] 发起 FindTEU 实时链路追踪: ${cleanId}`);
    
    const queryParams = new URLSearchParams({
      number: cleanId,
      key: FINDTEU_API_KEY
    });

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'X-Authorization-ApiKey': FINDTEU_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`FindTEU Gateway Error: ${response.status}`);
    }

    const json = await response.json();
    console.log("[Corsair] FindTEU 原始响应:", json);
    
    // 灵活解析: 支持 data 直接包含、data.tracking 包含、或 data.data 包含
    const dataRoot = json.data || {};
    const track = dataRoot.tracking || dataRoot.data || (dataRoot.container_number ? dataRoot : null);
    
    if (json.status === 'success' && track) {
      console.log("[Corsair] 成功定位到有效数据载荷:", track);
      
      const rawEvents = track.events || [];
      const events: TrackingEvent[] = rawEvents.map((e: any) => ({
        status: e.status_description || e.status || "EVENT DETECTED",
        location: e.location || e.place || "IN TRANSIT",
        timestamp: e.event_date || e.timestamp || e.date || "N/A",
        description: e.details || e.description || "",
        type: determineEventType(e.status || '')
      }));

      return {
        containerId: track.container_number || cleanId,
        carrier: track.carrier_name || track.carrier || "Global Carrier",
        vessel: track.vessel_name || track.vessel || "Pending Assignment",
        voyage: track.voyage_number || track.voyage || "TBD",
        origin: track.pol_name || track.pol || "Origin Port",
        destination: track.pod_name || track.pod || "Destination Port",
        status: mapStatus(track.status || (events.length > 0 ? events[0].status : '')),
        percentage: track.progress_percentage || calculatePercentage(track.status || ''),
        eta: track.eta || track.eta_date || "Checking...",
        isRealTime: true,
        lastSync: new Date().toLocaleTimeString(),
        events: events
      };
    } else {
      console.warn(`[Corsair] FindTEU 响应中未包含预期的集装箱结构:`, json);
      throw new Error("该柜号暂无实时动态，或 API 权限受限。");
    }

  } catch (err: any) {
    console.warn(`[Corsair] 实时接口异常，启动 CORS 安全降级模式:`, err.message);
    return getVirtualData(cleanId, err.message);
  }
}

function calculatePercentage(status: string = ''): number {
  const s = status.toLowerCase();
  if (s.includes('delivered') || s.includes('arrived')) return 100;
  if (s.includes('discharged')) return 90;
  if (s.includes('transit') || s.includes('sea')) return 60;
  if (s.includes('sailed') || s.includes('loaded')) return 35;
  return 15;
}

function determineEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('sea') || s.includes('sailed')) return 'SEA';
  if (s.includes('gate') || s.includes('truck') || s.includes('rail')) return 'LAND';
  return 'PORT';
}

function mapStatus(s: string = ''): any {
  const status = s.toUpperCase();
  if (status.includes('TRANSIT') || status.includes('BOARD') || status.includes('SAILED')) return 'IN_TRANSIT';
  if (status.includes('GATE') || status.includes('LAND')) return 'GATE_IN';
  if (status.includes('ARRIV') || status.includes('DISCH')) return 'ARRIVED';
  return 'IN_TRANSIT';
}

function getVirtualData(id: string, reason: string): ContainerDetails {
  return {
    containerId: id,
    carrier: "CORSAIR VIRTUAL NETWORK",
    vessel: "ANALYZING...",
    voyage: "OFFLINE",
    origin: "SCANNING PORTS...",
    destination: "PENDING API",
    status: 'IN_TRANSIT',
    percentage: 10,
    eta: "Syncing...",
    isRealTime: false,
    lastSync: "CONNECTION ERROR",
    events: [
      {
        status: 'Interface Error',
        location: 'SYSTEM GATEWAY',
        timestamp: new Date().toISOString().split('T')[0],
        description: `API 响应解析失败: ${reason}。请确认 FindTEU 后台已允许当前域名的跨域访问。`,
        type: 'PORT'
      }
    ]
  };
}
