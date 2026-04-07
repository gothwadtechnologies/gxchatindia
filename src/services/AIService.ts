import { GoogleGenAI } from "@google/genai";
import { storage } from "./StorageService.ts";

const AI_STORAGE_KEY = 'gxchat_ai_messages';

export interface AIMessage {
  id: string;
  text: string;
  senderId: 'user' | 'ai';
  timestamp: number;
}

class AIService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  getMessages(): AIMessage[] {
    const stored = storage.getItem(AI_STORAGE_KEY);
    if (!stored) {
      const initialMessage: AIMessage = {
        id: 'initial',
        text: 'Hello! I am GxChat AI. How can I help you today?',
        senderId: 'ai',
        timestamp: Date.now()
      };
      this.saveMessages([initialMessage]);
      return [initialMessage];
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse AI messages:", e);
      return [];
    }
  }

  saveMessages(messages: AIMessage[]) {
    storage.setItem(AI_STORAGE_KEY, JSON.stringify(messages));
  }

  async sendMessage(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: "You are GxChat AI, a helpful and friendly assistant for GxChat India users. Keep your responses concise and helpful.",
        }
      });
      return response.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
      console.error("AI Error:", error);
      return "I'm having some trouble connecting right now. Please try again later.";
    }
  }

  clearMessages() {
    storage.removeItem(AI_STORAGE_KEY);
  }
}

export const aiService = new AIService();
