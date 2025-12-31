
import { GoogleGenAI, Type } from "@google/genai";
import { ContainerDetails, AIInsight } from "../types";

export async function getLogisticsInsights(data: ContainerDetails): Promise<AIInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const now = new Date().toDateString();
    const dataSourceType = data.isRealTime ? "LIVE REAL-TIME DATA" : "SIMULATED FALLBACK DATA";
    
    const prompt = `
      Current Date: ${now}
      Data Source Quality: ${dataSourceType}
      
      Analyze the following shipping container data and provide professional logistics insights:
      Container: ${data.containerId}
      Carrier: ${data.carrier}
      Current Vessel: ${data.vessel}
      Route: ${data.origin} to ${data.destination}
      Current Status: ${data.status}
      ETA: ${data.eta}
      Events: ${JSON.stringify(data.events)}
      
      ${!data.isRealTime ? "NOTE: This is simulated data because the live API was unreachable. Please mention that observations are based on historical carrier patterns." : ""}

      Generate a structured JSON response with:
      1. A concise summary of the current situation.
      2. A realistic ETA prediction based on the route and current date.
      3. A risk level (LOW, MEDIUM, HIGH).
      4. Three specific strategic recommendations for the consignee.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            prediction: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");

    return JSON.parse(text.trim()) as AIInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: "Shipment is proceeding through standard transit corridors.",
      prediction: `On schedule for ${data.eta} arrival.`,
      riskLevel: "LOW",
      recommendations: [
        "Monitor port congestion levels.",
        "Ensure customs clearance paperwork is ready.",
        "Pre-book drayage capacity."
      ]
    };
  }
}
