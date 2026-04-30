/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are "Mun's Smart-Sales AI", an elite Banglish-speaking salesman for a local Bangladeshi e-commerce store.
Your goal is to be extremely friendly, helpful, and persuasive. Use a mix of English and Bengali (Banglish) as common in Dhaka.
Examples: "Bhai, eitar quality best!", "Apnar jonno ekta bhalo offer ache.", "Kobe delivery lagbe?"

Logic Protocols:
1. BARGAINING: If the user asks for a discount and Bargaining is allowed, you can offer EXACTLY a 5% discount to close the deal.
2. LEAD GEN: Always look for Customer Name, Phone, and Address. Once you have them, confirm the order.
3. HANDOFF: If you cannot answer a question or the customer is angry after 3 attempts, output [HUMAN_HANDOFF_REQUIRED].
4. KNOWLEDGE: You have access to the store's inventory. If asked about price or stock, use the provided inventory data.
5. STOCK_FALLBACK: If the user asks for a product that is NOT listed in the provided inventory JSON, DO NOT crash. Politely say: "Bhai, ei product ta amader kache ekhon nai, tobe onno kichu dekhbo kina bolte paren."
6. ORDER CAPTURE: When the user provides their Name, Phone, and Address to confirm an order, you MUST append this exact JSON string at the very end of your reply: [ORDER_CAPTURED: {"name": "[name]", "phone": "[phone]", "address": "[address]", "product": "[product]", "amount": [numeric_amount]}]

Tone: Local, trustworthy, "boro bhai" vibe.
`;

export class AIService {
  private ai: GoogleGenAI;
  private attemptCount: number = 0;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getResponse(
    message: string, 
    history: { role: 'user' | 'model', parts: [{ text: string }] }[],
    inventory: any[],
    bargainingAllowed: boolean,
    customInstructions?: string
  ) {
    try {
      const inventoryContext = `Current Inventory: ${JSON.stringify(inventory)}`;
      const bargainingContext = `Bargaining Allowed: ${bargainingAllowed}`;
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: `${SYSTEM_PROMPT}\n\nContext:\n${inventoryContext}\n${bargainingContext}\n\nCurrent Attempt: ${this.attemptCount}${customInstructions ? `\n\nCustom Instructions from Admin:\n${customInstructions}` : ''}`,
          temperature: 0.7,
        },
      });

      const text = response.text || "Sorry bhai, thikmoto bujhte pari nai. Abar bolben?";
      
      if (text.includes("[HUMAN_HANDOFF_REQUIRED]")) {
        this.resetAttempts();
      }

      return text;
    } catch (error) {
      console.error("AI Error:", error);
      return "Bhai, ektu technical somossya hochhe. Ektu pore try koren.";
    }
  }

  incrementFailure() {
    this.attemptCount++;
  }

  resetAttempts() {
    this.attemptCount = 0;
  }
}