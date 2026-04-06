
import { GoogleGenAI } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateSignImage = async (
  prompt: string, 
  base64Image?: string, 
  usePro = false,
  retryCount = 0
): Promise<string | null> => {
  if (!navigator.onLine) throw new Error("NETWORK_OFFLINE");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Usamos flash por defecto para mayor velocidad y menos restricciones de cuota
  const modelToUse = usePro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  try {
    const parts: any[] = [];
    if (base64Image) {
      const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64 } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: { parts: parts },
      config: {
        systemInstruction: `
          ERES UN EXPERTO EN RENDERIZADO 3D ARQUITECTÓNICO PARA ARAM STUDIO.
          TU TAREA ES CREAR IMÁGENES DE ALTA CALIDAD DE LETREROS Y LOGOTIPOS.

          REGLAS DE DISEÑO:
          1. FIDELIDAD: Si el usuario sube un logo, reprodúcelo EXACTAMENTE igual. No cambies la fuente.
          2. ACRÍLICO: Si se pide "Base de Acrílico", asegúrate de que el acrílico transparente se aplique como un contorno alrededor de todo el diseño y las letras, sin modificar la fuente original. Si se pide "Montaje Directo", no pongas placa.
          3. REALISMO: Usa iluminación dramática, reflejos metálicos y texturas de pared realistas.
          4. ESTILO: Lujoso, corporativo, premium.
          
          IMPORTANTE: No añadas marcas de agua ni texto adicional fuera del logo.
        `,
        imageConfig: {
          aspectRatio: "16:9",
          ...(usePro ? { imageSize: "1K" } : {})
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    const message = (error?.message || "").toLowerCase();
    const status = error?.status || error?.code || 0;
    const isQuota = status === 429 || message.includes("429") || message.includes("quota");

    if (isQuota && retryCount < 2) {
      await sleep(2000 * (retryCount + 1));
      return generateSignImage(prompt, base64Image, usePro, retryCount + 1);
    }
    throw error;
  }
};
