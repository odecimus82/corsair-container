
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Real-time Integration
 * 核心修复：
 * 1. 域名切换至 api.findteu.com (Swagger 官方 host)
 * 2. 严格执行 Header 鉴权: X-Authorization-ApiKey
 * 3. 冗余参数 key 同时在 URL 发送
 */

const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";
const BASE_URL = "https://api.findteu.com/v1/tracking/get_tracking";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] 发起 FindTEU 实时链路追踪: ${cleanId}`);
    
    // 构建标准的 URL 查询参数
    const queryParams = new URLSearchParams({
      number: cleanId,
      key: FINDTEU_API_KEY
    });

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      mode: 'cors', // 明确要求跨域模式
      headers: { 
        'Accept': 'application/json',
        // 关键：这是截图和 Swagger 文档要求的授权头
        'X-Authorization-ApiKey': FINDTEU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // 检查 HTTP 状态码
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Corsair] API 响应错误 (${response.status}):`, errorText);
      throw new Error(`FindTEU 服务器返回错误: ${response.status}`);
    }

    const json = await response.json();
    console.log("[Corsair] FindTEU 原始数据:", json);
    
    // 根据 FindTEU 结构解析
    // 成功状态通常为 'success'，数据在 data.tracking 内部
    if (json.status === 'success' && json.data) {
      const track = json.data.tracking || json.data;
      
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
          status: e.status_description || e.status || "Status Update",
          location: e.location || "In Transit",
          timestamp: e.event_date || e.timestamp || "N/A",
          description: e.details || "",
          type: determineEventType(e.status || '')
        }))
      };
    } else {
      console.warn(`[Corsair] FindTEU 查询成功但无有效数据包:`, json.message);
      throw new Error(json.message || "该柜号在 FindTEU 网络中暂无实时记录。");
    }

  } catch (err: any) {
    console.warn(`[Corsair] 实时接口尝试失败，切换至智能模拟模式:`, err.message);
    // 返回模拟数据并标记 isRealTime: false，避免用户体验中断
    return getVirtualData(cleanId);
  }
}

function calculatePercentage(status: string = ''): number {
  const s = status.toLowerCase();
  if (s.includes('delivered') || s.includes('arrived')) return 100;
  if (s.includes('discharged')) return 90;
  if (s.includes('transit')) return 60;
  if (s.includes('sailed')) return 30;
  return 15;
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
  if (status.includes('ARRIV') || status.includes('DISCH')) return 'ARRIVED';
  return 'IN_TRANSIT';
}

function getVirtualData(id: string): ContainerDetails {
  return {
    containerId: id,
    carrier: "CORSAIR SYSTEM",
    vessel: "SIMULATED-FEEDER",
    voyage: "SIM-2025",
    origin: "SCANNING NETWORK...",
    destination: "OFFLINE DESTINATION",
    status: 'IN_TRANSIT',
    percentage: 30,
    eta: "Checking API Settings",
    isRealTime: false,
    lastSync: "LOCAL FALLBACK",
    events: [
      {
        status: 'API Connection Refused',
        location: 'WEB BROWSER',
        timestamp: new Date().toISOString().split('T')[0],
        description: '未能通过实时接口获取数据。可能原因：CORS 跨域限制或 API Key 未激活。',
        type: 'PORT'
      }
    ]
  };
}
