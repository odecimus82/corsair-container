
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Integration (Refined)
 * 核心配置：
 * 1. 使用截图中的 API Key
 * 2. 严格遵循 Header: X-Authorization-ApiKey 要求
 */

const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";
const BASE_URL = "https://api.findteu.com/v1/tracking/get_tracking";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] 正在调取 FindTEU 全球数据库: ${cleanId}`);
    
    // 构建请求参数
    const queryParams = new URLSearchParams({
      number: cleanId,
      key: FINDTEU_API_KEY // 冗余发送 key 以确保最高兼容性
    });

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        // 关键：这是截图明确要求的 Header 字段
        'X-Authorization-ApiKey': FINDTEU_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`FindTEU 接口响应异常: ${response.status}`);
    }

    const json = await response.json();
    console.log("[Corsair] FindTEU 实时原始数据:", json);
    
    /**
     * 智能数据探测：
     * 有些版本数据在 json.data 内部，有些在 json.data.tracking，
     * 甚至在 json.data 的数组第一个元素。
     */
    let track = null;
    if (json.data) {
      if (json.data.tracking) track = json.data.tracking;
      else if (Array.isArray(json.data) && json.data.length > 0) track = json.data[0];
      else if (json.data.container_number || json.data.carrier_name) track = json.data;
    }

    if (json.status === 'success' && track) {
      console.log("[Corsair] 成功提取数据轨迹:", track);
      
      const rawEvents = track.events || [];
      const events: TrackingEvent[] = rawEvents.map((e: any) => ({
        status: e.status_description || e.status || "STATUS UPDATED",
        location: e.location || e.place || "IN TRANSIT",
        timestamp: e.event_date || e.timestamp || "N/A",
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
      console.warn("[Corsair] FindTEU 返回了成功状态，但未找到匹配的柜号信息:", json);
      throw new Error(json.message || "该集装箱在 FindTEU 网络中暂无最新轨迹。");
    }

  } catch (err: any) {
    console.warn(`[Corsair] 实时接口失败:`, err.message);
    // 回退到模拟数据展示，防止 UI 崩溃
    return getVirtualData(cleanId, err.message);
  }
}

function calculatePercentage(status: string = ''): number {
  const s = status.toLowerCase();
  if (s.includes('delivered') || s.includes('arrived')) return 100;
  if (s.includes('discharged')) return 90;
  if (s.includes('transit')) return 60;
  return 20;
}

function determineEventType(status: string): 'SEA' | 'LAND' | 'PORT' {
  const s = status.toLowerCase();
  if (s.includes('vessel') || s.includes('sea') || s.includes('sailed')) return 'SEA';
  if (s.includes('gate') || s.includes('truck')) return 'LAND';
  return 'PORT';
}

function mapStatus(s: string = ''): any {
  const status = s.toUpperCase();
  if (status.includes('TRANSIT') || status.includes('BOARD')) return 'IN_TRANSIT';
  if (status.includes('ARRIV') || status.includes('DISCH')) return 'ARRIVED';
  return 'IN_TRANSIT';
}

function getVirtualData(id: string, reason: string): ContainerDetails {
  return {
    containerId: id,
    carrier: "CORSAIR SYSTEM",
    vessel: "ANALYZING...",
    voyage: "OFFLINE",
    origin: "SCANNING...",
    destination: "PENDING",
    status: 'IN_TRANSIT',
    percentage: 5,
    eta: "Syncing...",
    isRealTime: false,
    lastSync: "CONNECTION ERROR",
    events: [
      {
        status: 'API 解析受阻',
        location: 'BROWSER GATEWAY',
        timestamp: new Date().toISOString().split('T')[0],
        description: `原因: ${reason}。建议: 检查浏览器 CORS 限制或联系 FindTEU 客服。`,
        type: 'PORT'
      }
    ]
  };
}
