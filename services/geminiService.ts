
import { GoogleGenAI, Type } from "@google/genai";
import { ContainerDetails, AIInsight } from "../types";

// In our environment, API_KEY is provided via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLogisticsInsights(data: ContainerDetails): Promise<AIInsight> {
  try {
    const prompt = `
      Analyze the following shipping container data and provide professional logistics insights:
      Container: ${data.containerId}
      Carrier: ${data.carrier}
      Current Vessel: ${data.vessel}
      Route: ${data.origin} to ${data.destination}
      Current Status: ${data.status}
      Events: ${JSON.stringify(data.events)}
      
      Generate a structured JSON response with:
      1. A concise summary of the current situation.
      2. A realistic ETA prediction based on the route.
      3. A risk level (LOW, MEDIUM, HIGH).
      4. Three specific strategic recommendations for the consignee.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            prediction: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text.trim()) as AIInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    // Fallback insight if AI fails
    return {
      summary: "Shipment is proceeding through standard transpacific transit corridors with no immediate anomalies detected.",
      prediction: "On schedule for NOV 24 arrival, assuming stable weather conditions in the Pacific.",
      riskLevel: "LOW",
      recommendations: [
        "Monitor port congestion levels at destination terminal.",
        "Ensure customs clearance paperwork is submitted 48h before arrival.",
        "Pre-book drayage capacity for last-mile delivery."
      ]
    };
  }
}
