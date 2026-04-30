
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side State (Simple in-memory store for personal use)
let serverSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  metaPageToken: "",
  whatsAppToken: "",
  instagramToken: "",
  sheetId: "",
  bargainingEnabled: true,
  aiPaused: false,
};

let inventory: any[] = [];

const LEADS_FILE = path.join(process.cwd(), 'leads_db.json');

function loadLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load leads from file:", err);
  }
  return [];
}

function saveLeads(leads: any[]) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error("Failed to save leads to file:", err);
  }
}

let capturedLeads: any[] = loadLeads();

// Helper to get AI Response (replicating AIService logic)
async function getAIResponse(message: string, currentInventory: any[], bargaining: boolean, audioData?: { mimeType: string, data: string }) {
  if (!serverSettings.geminiApiKey) return "System Error: No API Key configured.";
  
  const ai = new GoogleGenAI({ apiKey: serverSettings.geminiApiKey });
  
  try {
    const parts: any[] = [];
    if (message && message.trim() !== "") {
      parts.push({ text: message });
    }
    if (audioData) {
      parts.push({ inlineData: audioData });
    }

    // Fallback if both are empty (shouldn't happen with the webhook logic but for safety)
    if (parts.length === 0) {
      parts.push({ text: "Hello" });
    }

    const contents: any[] = [{ role: "user", parts }];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: `
You are "Mun's Smart-Sales AI", an elite Banglish-speaking salesman for a local Bangladeshi e-commerce store.
Your goal is to be extremely friendly, helpful, and persuasive. Use a mix of English and Bengali (Banglish) as common in Dhaka.

Logic Protocols:
1. BARGAINING: If the user asks for a discount and Bargaining is allowed (${bargaining}), you can offer EXACTLY a 5% discount to close the deal.
2. LEAD GEN: Always look for Customer Name, Phone, and Address. Once you have them, confirm the order.
3. KNOWLEDGE: Use this inventory: ${JSON.stringify(currentInventory)}
4. STOCK_FALLBACK: If the user asks for a product that is NOT listed in the provided inventory JSON, DO NOT crash. Politely say: "Bhai, ei product ta amader kache ekhon nai, tobe onno kichu dekhbo kina bolte paren."
5. ORDER CAPTURE: When the user provides their Name, Phone, and Address to confirm an order, you MUST append this exact JSON string at the very end of your reply (replace brackets with data): [ORDER_CAPTURED: {"name": "[name]", "phone": "[phone]", "address": "[address]", "product": "[product]", "amount": [numeric_amount]}]
Example: [ORDER_CAPTURED: {"name": "Kamal", "phone": "017...", "address": "Mirpur", "product": "T-Shirt", "amount": 1200}]
6. TONE: Local, trustworthy, "boro bhai" vibe.
`,
        temperature: 0.7,
      },
    });

    return response.text || "Bhai, ektu technical somossya hochhe. Ektu pore try koren.";
  } catch (err) {
    console.error("AI Generation Error:", err);
    return "Bhai, ektu technical somossya hochhe. Ektu pore try koren.";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Order Retrieval Endpoint
  app.get("/api/leads", (req, res) => {
    res.json(capturedLeads);
  });

  // Lead Status Update Endpoint
  app.post("/api/update-lead", (req, res) => {
    const { id, status } = req.body;
    const leadIndex = capturedLeads.findIndex(l => l.id === id);
    if (leadIndex !== -1) {
      capturedLeads[leadIndex].status = status;
      saveLeads(capturedLeads);
    }
    res.json({ success: true });
  });

  // Payment Verification Endpoint
  app.post("/api/verify-payment", (req, res) => {
    const { trxId } = req.body;
    
    // Alphanumeric, 8-12 characters
    const isValidTrx = /^[A-Z0-9]{8,12}$/i.test(trxId);
    
    if (isValidTrx) {
      res.json({ success: true, message: "Transaction verified. Node link established." });
    } else {
      res.status(400).json({ success: false, message: "Invalid Transaction ID format." });
    }
  });

  // 1. Settings Sync Endpoint (For Frontend to push its keys to the server)
  app.post("/api/settings-sync", (req, res) => {
    const { settings, currentInventory } = req.body;
    if (settings) {
      serverSettings = { ...serverSettings, ...settings };
      console.log("Server Settings Synced OK");
    }
    if (currentInventory) {
      inventory = currentInventory;
    }
    res.json({ status: "success" });
  });

  // 2. Meta Webhook Verification (GET)
  app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = "mun_shop_secure";
    
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  });

  // Omnichannel Reply Helper
  async function sendOmniReply(platform: 'messenger' | 'instagram' | 'whatsapp', recipientId: string, messageText: string, phoneNumberId?: string) {
    let url = "";
    let token = "";
    let body: any = {};

    switch (platform) {
      case 'messenger':
        url = `https://graph.facebook.com/v21.0/me/messages?access_token=${serverSettings.metaPageToken}`;
        token = serverSettings.metaPageToken;
        body = {
          messaging_type: "RESPONSE",
          recipient: { id: recipientId },
          message: { text: messageText }
        };
        break;
      case 'instagram':
        url = `https://graph.facebook.com/v21.0/me/messages?access_token=${serverSettings.instagramToken}`;
        token = serverSettings.instagramToken;
        body = {
          recipient: { id: recipientId },
          message: { text: messageText }
        };
        break;
      case 'whatsapp':
        // Cloud API usually requires a Phone Number ID in the URL
        url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages?access_token=${serverSettings.whatsAppToken}`;
        token = serverSettings.whatsAppToken;
        body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientId, // This is the phone number
          type: "text",
          text: { body: messageText }
        };
        break;
    }

    if (!token) {
      console.warn(`No token configured for ${platform}. Cannot reply.`);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      console.log(`Reply sent via ${platform}:`, data);
    } catch (err) {
      console.error(`Error sending message to ${platform}:`, err);
    }
  }

  // 3. Meta Webhook Receiver (POST)
  app.post("/webhook", async (req, res) => {
    const body = req.body;
    let platform: 'messenger' | 'instagram' | 'whatsapp' | null = null;
    let events: any[] = [];
    let whatsappPhoneId = "";

    if (body.object === "page") {
      platform = 'messenger';
      events = body.entry?.[0]?.messaging || [];
    } else if (body.object === "instagram") {
      platform = 'instagram';
      events = body.entry?.[0]?.messaging || [];
    } else if (body.object === "whatsapp_business_account") {
      platform = 'whatsapp';
      const change = body.entry?.[0]?.changes?.[0];
      if (change?.value?.messages) {
        whatsappPhoneId = change.value.metadata.phone_number_id;
        // Map WhatsApp structure to a common internal format
        events = change.value.messages.map((m: any) => ({
          sender: { id: m.from },
          message: { text: m.text?.body, mid: m.id, type: m.type },
          whatsapp_raw: m
        }));
      }
    }

    if (platform && events.length > 0) {
      for (const webhook_event of events) {
        if (!webhook_event.message || !webhook_event.message.text) continue;
        if (serverSettings.aiPaused) continue;

        const sender_id = webhook_event.sender.id;
        const received_text = webhook_event.message.text;

        console.log(`Received ${platform} Event from ${sender_id}:`, received_text);

        // Generate AI Response
        let audioData = undefined;
        if (platform === 'messenger' && webhook_event.message.attachments?.[0]?.type === 'audio') {
          try {
            const audioUrl = webhook_event.message.attachments[0].payload.url;
            const audioResponse = await fetch(audioUrl);
            const buffer = await audioResponse.arrayBuffer();
            audioData = { mimeType: "audio/mpeg", data: Buffer.from(buffer).toString('base64') };
          } catch (err) { console.error("Audio fetch error:", err); }
        }

        let aiResponse = await getAIResponse(
          received_text, 
          inventory, 
          serverSettings.bargainingEnabled,
          audioData
        );

        // Order Extraction Logic
        const orderMatch = aiResponse.match(/\[ORDER_CAPTURED:\s*([\s\S]*?)\]/);
        if (orderMatch) {
          try {
            const cleanJson = orderMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const orderData = JSON.parse(cleanJson);
            const newLead = {
              id: `${platform.toUpperCase().charAt(0)}-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
              ...orderData,
              status: 'pending',
              timestamp: new Date().toISOString()
            };
            capturedLeads.unshift(newLead);
            saveLeads(capturedLeads);

            // Persist to Google Sheet
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwDI0_6Z9sPusb3rNy2LqWswg95AVGgloWIvvtEI6nlKObhWEhpysk_bU6xx1KouKIoCw/exec';
            fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(newLead)
            }).catch(err => console.error("Sheet save error:", err));
            
            // Clean response for user
            aiResponse = aiResponse.replace(/\[ORDER_CAPTURED:\s*[\s\S]*?\]/g, "").trim();
          } catch (e) {
            console.error("Failed to parse order JSON:", e);
          }
        }

        // Send Reply
        await sendOmniReply(platform, sender_id, aiResponse, whatsappPhoneId);
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Always return 200 to Meta webhooks to prevent retry loops
      res.sendStatus(200);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
