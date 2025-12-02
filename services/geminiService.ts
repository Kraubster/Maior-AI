import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PROFESSOR_MAIOR_SYSTEM_INSTRUCTION } from "../constants";
import { Message, Sender, AppMode } from "../types";

// Definição dos Modelos
const MODEL_FLASH = 'gemini-2.5-flash';
// Mapeando "Pro" para o modelo mais avançado disponível recomendado para tarefas complexas
const MODEL_PRO = 'gemini-2.5-pro'; 

interface GenerateParams {
  prompt: string;
  imageBase64?: string;
  mode: AppMode;
  previousMessages: Message[];
}

export const generateResponse = async ({
  prompt,
  imageBase64,
  mode,
  previousMessages
}: GenerateParams): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {
  
  // ✅ CORRIGIDO: Usar import.meta.env para Vite
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ API Key não encontrada! Verifica as Environment Variables no Netlify.');
    return { text: "⚠️ Erro de configuração: API Key não encontrada. Por favor, contacta o administrador." };
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let config: any = {
    systemInstruction: PROFESSOR_MAIOR_SYSTEM_INSTRUCTION,
  };

  let selectedModel = MODEL_FLASH;

  // Lógica de Seleção de Modelo
  if (mode === 'giga') {
    // Modo Giga: Usa o modelo Pro para raciocínio complexo
    selectedModel = MODEL_PRO;
    
    // Configuração de Pensamento Profundo para o modelo Pro
    config.thinkingConfig = { thinkingBudget: 32768 }; 
  } else {
    // Modo Standard: Usa o modelo Flash (rápido)
    selectedModel = MODEL_FLASH;
    
    // Ferramentas (Search Grounding) apenas se não for imagem
    // (Multimodal geralmente processa melhor sem tools de search misturadas no flash atual)
    if (!imageBase64) {
      config.tools = [{ googleSearch: {} }];
    }
  }

  // Construção do payload
  const contentsPayload: any = {};
  const parts: any[] = [];
  
  if (imageBase64) {
    // Extrair mimeType e base64
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    
    if (matches && matches.length === 3) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      });
    } else {
      // Fallback genérico
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
        }
      });
    }
  }
  
  // Histórico da conversa
  let contextStr = "";
  if (previousMessages.length > 0) {
      const recent = previousMessages.slice(-5);
      contextStr = "Histórico da conversa:\n" + recent.map(m => `${m.sender === Sender.USER ? 'Aluno' : 'Professor'}: ${m.text}`).join("\n") + "\n\n";
  }

  parts.push({
    text: contextStr + "Pergunta do Aluno: " + prompt
  });
  
  contentsPayload.parts = parts;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: selectedModel,
      contents: contentsPayload,
      config: config,
    });

    const text = response.text || "Peço desculpa, mas não consegui processar a resposta.";
    
    // Extrair fontes do Google Search (Grounding)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { uri: string; title: string }[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Ocorreu um erro técnico ao consultar o Professor Tozé 2.0. Por favor, tenta novamente." };
  }
};