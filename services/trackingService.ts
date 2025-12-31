
import { ContainerDetails } from '../types';

/**
 * Note: Since we are in a sandbox environment and cannot reach a private 3rd party API directly,
 * this service simulates the data structure we would expect from FindTEU based on the provided API key.
 * 
 * API Key provided: Jc2TW3qiXa-13928-SVQeQplQ2o-gmjkAFIzZl
 * In a real scenario, this would be passed in headers: 'Authorization: Bearer Jc2...'
 */

const API_KEY = "Jc2TW3qiXa-13928-SVQeQplQ2o-gmjkAFIzZl";

export async function fetchTrackingData(containerId: string): Promise<ContainerDetails> {
  console.log(`Executing global lookup for ${containerId} using Corsair Key...`);
  
  // Artificial delay for realism
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulating a response for different carrier prefixes
  const prefix = containerId.substring(0, 4).toUpperCase();
  const carriers: Record<string, string> = {
    'MEDU': 'MSC Mediterranean Shipping',
    'MSKU': 'Maersk Line',
    'HLCU': 'Hapag-Lloyd',
    'COSU': 'COSCO Shipping',
    'ONEU': 'Ocean Network Express',
    'CMAU': 'CMA CGM',
  };

  const carrier = carriers[prefix] || 'Global Alliance Carrier';

  // Mocked response
  return {
    containerId,
    carrier,
    vessel: 'CORSAIR VOYAGER',
    voyage: 'CX-409',
    origin: 'SHANGHAI, CN (CNSHG)',
    destination: 'LOS ANGELES, US (USLAX)',
    status: 'IN_TRANSIT',
    percentage: 65,
    eta: 'NOV 24, 2024',
    events: [
      {
        status: 'Departed from Port',
        location: 'SHANGHAI, CN',
        timestamp: '2024-11-02 14:30',
        description: 'Vessel sailed from terminal 3.',
        type: 'SEA'
      },
      {
        status: 'Loaded on Vessel',
        location: 'SHANGHAI, CN',
        timestamp: '2024-11-01 09:15',
        description: 'Container stowed in bay 42, deck 2.',
        type: 'PORT'
      },
      {
        status: 'Gate-in Full',
        location: 'SHANGHAI, CN',
        timestamp: '2024-10-31 18:45',
        description: 'Full container received at export gate.',
        type: 'LAND'
      },
      {
        status: 'Released from Factory',
        location: 'SUZHOU, CN',
        timestamp: '2024-10-31 08:00',
        description: 'Trucking started from factory premises.',
        type: 'LAND'
      }
    ]
  };
}
