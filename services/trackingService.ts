
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Advanced Proxy Integration
 * 解决方案：使用 CORS Proxy 绕过浏览器同源策略限制。
 */

const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";
const BASE_URL = "https://api.findteu.com/v1/tracking/get_tracking";
// 使用可靠的 CORS 代理服务器
const CORS_PROXY = "https://corsproxy.io/?";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] 正在通过安全通道穿透 FindTEU 接口: ${cleanId}`);
    
    const queryParams = new URLSearchParams({
      number: cleanId,
      key: FINDTEU_API_KEY
    });

    const targetUrl = `${BASE_URL}?${queryParams.toString()}`;
    // 将目标 URL 编码并拼接到代理地址后
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

    console.log(`[Corsair] 代理请求路径: ${proxiedUrl}`);

    const response = await fetch(proxiedUrl, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        // 关键：FindTEU 要求在 Header 中携带此字段
        'X-Authorization-ApiKey': FINDTEU_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`代理服务器响应异常: ${response.status}`);
    }

    const json = await response.json();
    console.log("[Corsair] FindTEU 穿透响应结果:", json);
    
    // 灵活解析: FindTEU 的数据可能位于 json.data 或 json.data.tracking
    const dataRoot = json.data || {};
    const track = dataRoot.tracking || dataRoot.data || (dataRoot.container_number ? dataRoot : null);
    
    if (json.status === 'success' && track) {
      console.log("[Corsair] 成功解析轨迹载荷:", track);
      
      const rawEvents = track.events || [];
      const events: TrackingEvent[] = rawEvents.map((e: any) => ({
        status: e.status_description || e.status || "STATUS UPDATED",
        location: e.location || e.place || "IN TRANSIT",
        timestamp: e.event_date || e.timestamp || e.date || "N/A",
        description: e.details || e.description || "",
        type: determineEventType(e.status || '')
      }));

      return {
        containerId: track.container_number || cleanId,
        carrier: track.carrier_name || track.carrier || "Global Carrier",
        vessel: track.vessel_name || track.vessel || "In Analysis",
        voyage: track.voyage_number || track.voyage || "N/A",
        origin: track.pol_name || track.pol || "Scanning Origin...",
        destination: track.pod_name || track.pod || "Scanning Destination...",
        status: mapStatus(track.status || (events.length > 0 ? events[0].status : '')),
        percentage: track.progress_percentage || calculatePercentage(track.status || ''),
        eta: track.eta || track.eta_date || "Calculating...",
        isRealTime: true,
        lastSync: new Date().toLocaleTimeString(),
        events: events
      };
    } else {
      throw new Error(json.message || "该柜号在 FindTEU 网络中暂无活跃数据。");
    }

  } catch (err: any) {
    console.error(`[Corsair] 全球数据同步失败:`, err.message);
    // 失败时返回带有错误信息的模拟对象，确保 UI 不黑屏
    return getVirtualData(cleanId, err.message);
  }
}

function calculatePercentage(status: string = ''): number {
  const s = status.toLowerCase();
  if (s.includes('delivered') || s.includes('arrived')) return 100;
  if (s.includes('discharged')) return 85;
  if (s.includes('transit')) return 50;
  return 10;
}

function determineEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('sea')) return 'SEA';
  if (s.includes('gate') || s.includes('truck')) return 'LAND';
  return 'PORT';
}

function mapStatus(s: string = ''): any {
  const status = s.toUpperCase();
  if (status.includes('TRANSIT') || status.includes('BOARD')) return 'IN_TRANSIT';
  if (status.includes('GATE') || status.includes('LAND')) return 'GATE_IN';
  if (status.includes('ARRIV') || status.includes('DISCH')) return 'ARRIVED';
  return 'IN_TRANSIT';
}

function getVirtualData(id: string, reason: string): ContainerDetails {
  return {
    containerId: id,
    carrier: "SYSTEM OFFLINE",
    vessel: "CONNECTION FAILED",
    voyage: "RETRYING...",
    origin: "ERR",
    destination: "ERR",
    status: 'IN_TRANSIT',
    percentage: 0,
    eta: "Unavailable",
    isRealTime: false,
    lastSync: "N/A",
    events: [
      {
        status: '网络通讯受阻',
        location: 'GATEWAY',
        timestamp: new Date().toLocaleTimeString(),
        description: `无法直连 FindTEU API (原因: ${reason})。如果问题持续，请确保您的域名已通过 FindTEU 审核或联系 Rhodes 协助配置后端转发。`,
        type: 'PORT'
      }
    ]
  };
}
