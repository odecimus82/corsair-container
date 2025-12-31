
import { ContainerDetails, TrackingEvent } from '../types';

/**
 * Corsair Logistics - FindTEU API Real-time Integration
 * 严格按照 FindTEU 官方文档 (Header 授权模式) 进行重构
 */

// 基础配置
const API_URL = "https://api.findteu.com/v1/tracking/get_tracking";
const FINDTEU_API_KEY = "dOEIqUbaAG-13928-TxI3bedIUC-EqmCdXPbuS";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  const cleanId = containerId.trim().toUpperCase();

  try {
    console.log(`[Corsair] 发起实时追踪请求: ${cleanId}`);
    
    // 构建请求 URL
    const url = new URL(API_URL);
    url.searchParams.append('number', cleanId);
    // 虽然文档要求 Header，但通常为了兼容性，URL 也可以带上 key 参数
    url.searchParams.append('key', FINDTEU_API_KEY);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        // 关键修复：截图明确要求在网页端调用时必须发送此 Header
        'X-Authorization-ApiKey': FINDTEU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("API Key 授权无效或受限，请检查 FindTEU 账户权限。");
      }
      throw new Error(`网络请求失败: ${response.status}`);
    }

    const json = await response.json();
    
    // 解析 FindTEU 响应
    if (json.status === 'success' && json.data) {
      const track = json.data.tracking || json.data;
      console.log(`[Corsair] 实时数据同步成功: ${cleanId}`);
      
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
      console.warn(`[Corsair] FindTEU 未找到匹配数据: ${json.message || 'Unknown'}`);
      throw new Error(json.message || "未找到该柜号的实时物流信息。");
    }

  } catch (err: any) {
    console.error(`[Corsair] 实时接口异常:`, err.message);
    // 返回模拟数据并标记 isRealTime: false，确保应用不崩溃
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
    carrier: "CORSAIR VIRTUAL",
    vessel: "SYSTEM SIMULATOR",
    voyage: "OFFLINE-2025",
    origin: "SHANGHAI, CN",
    destination: "LOS ANGELES, US",
    status: 'IN_TRANSIT',
    percentage: 50,
    eta: "Checking API...",
    isRealTime: false,
    lastSync: "CONNECTION ERROR",
    events: [
      {
        status: 'Connection Interrupted',
        location: 'API GATEWAY',
        timestamp: new Date().toISOString().split('T')[0],
        description: '未能建立实时连接。请检查 API Key 或 CORS 权限。',
        type: 'PORT'
      }
    ]
  };
}
