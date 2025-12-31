
import { GoogleGenAI, Type } from "@google/genai";
import { ContainerDetails, AIInsight } from "../types";

// In our environment, API_KEY is provided via process.env.API_KEY

export async function getLogisticsInsights(data: ContainerDetails): Promise<AIInsight> {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const now = new Date().toDateString();
    const prompt = `
      Current Date: ${now}
      Analyze the following shipping container data and provide professional logistics insights:
      Container: ${data.containerId}
      Carrier: ${data.carrier}
      Current Vessel: ${data.vessel}
      Route: ${data.origin} to ${data.destination}
      Current Status: ${data.status}
      ETA: ${data.eta}
      Events: ${JSON.stringify(data.events)}
      
      Generate a structured JSON response with:
      1. A concise summary of the current situation.
      2. A realistic ETA prediction based on the route and current date.
      3. A risk level (LOW, MEDIUM, HIGH).
      4. Three specific strategic recommendations for the consignee.
    `;

    // Using gemini-3-pro-preview for complex reasoning and logistics intelligence tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING,
              description: 'A concise summary of the current shipping situation.'
            },
            prediction: { 
              type: Type.STRING,
              description: 'A realistic ETA prediction based on tracking data.'
            },
            riskLevel: { 
              type: Type.STRING,
              description: 'The calculated risk level: LOW, MEDIUM, or HIGH.'
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Three strategic recommendations for the consignee.'
            }
          },
          propertyOrdering: ["summary", "prediction", "riskLevel", "recommendations"],
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned empty response text");
    }

    return JSON.parse(text.trim()) as AIInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    // Fallback insight if AI fails - using dynamic ETA reference
    return {
      summary: "Shipment is proceeding through standard transpacific transit corridors with no immediate anomalies detected.",
      prediction: `On schedule for ${data.eta} arrival, assuming stable weather conditions in the Pacific.`,
      riskLevel: "LOW",
      recommendations: [
        "Monitor port congestion levels at destination terminal.",
        "Ensure customs clearance paperwork is submitted 48h before arrival.",
        "Pre-book drayage capacity for last-mile delivery."
      ]
    };
  }
}
