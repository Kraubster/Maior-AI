// services/groqService.ts

import Groq from "groq-sdk";
import { Message, Sender, AppMode } from "../types";
import { PROFESSOR_MAIOR_SYSTEM_INSTRUCTION } from "../constants";

// Define os parâmetros (deve ser igual ao do router)
interface GenerateParams {
  prompt: string;
  imageBase64?: string;
  mode: AppMode;
  previousMessages: Message[];
}

// Modelos recomendados da Groq (rápidos e potentes)
// const MODEL_LLAMA_3 = "llama3-8b-8192";
const MODEL_MISTRAL = "mixtral-8x7b-32768";

/**
 * Gera uma resposta usando a API da Groq.
 * NOTA: A Groq (atualmente) não suporta multimodalidade (imagens).
 */
export const generateResponse = async ({
  prompt,
  imageBase64,
  mode,
  previousMessages
}: GenerateParams): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {

  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (!API_KEY) {
    console.error("❌ Chave API da Groq não encontrada!");
    throw new Error("API Key da Groq não configurada.");
  }

  // IMPORTANTE: Groq não suporta imagens.
  // O router (aiServiceRouter) deve ser responsável por nunca chamar este
  // serviço se houver uma imagem. Esta é uma segunda verificação.
  if (imageBase64) {
    console.warn("GroqService foi chamado com uma imagem, o que não é suportado. A cancelar.");
    throw new Error("Groq não suporta análise de imagens.");
  }

  // A Groq API é compatível com o formato da OpenAI (messages)
  const groq = new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true, // Necessário para chamadas do lado do cliente (Vite)
  });

  // 1. Adicionar a Instrução de Sistema
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: PROFESSOR_MAIOR_SYSTEM_INSTRUCTION,
    },
  ];

  // 2. Adicionar Histórico da Conversa
  previousMessages.slice(-5).forEach(msg => {
    messages.push({
      role: msg.sender === Sender.USER ? "user" : "assistant",
      content: msg.text,
    });
  });

  // 3. Adicionar o Prompt Atual do Utilizador
  messages.push({
    role: "user",
    content: "Pergunta do Aluno: " + prompt,
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: MODEL_MISTRAL, // Usar o Mistral como um backup potente
      temperature: 0.7,
      max_tokens: 4096,
    });

    const text = chatCompletion.choices[0]?.message?.content || "Peço desculpa, mas não consegui processar a resposta via Groq.";
    
    // Groq não faz grounding, por isso devolvemos 'sources' vazio
    return { text, sources: [] };

  } catch (error) {
    console.error("Erro na API da Groq:", error);
    throw new Error("Falha ao comunicar com o serviço de IA secundário (Groq).");
  }
};