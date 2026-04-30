/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 🟢 এখানে আপনার নতুন ANALYTICS এবং HISTORY স্ক্রিন অ্যাড করা আছে
export enum Screen {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CRM = 'CRM',
  VAULT = 'VAULT',
  PRICING = 'PRICING',
  ANALYTICS = 'ANALYTICS',
  HISTORY = 'HISTORY'
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | string;
  timestamp: string;
}

export interface AppConfig {
  Admin_Name?: string;
  Store_Name?: string;
  Start_Message?: string;
  [key: string]: any;
}

export interface AppSettings {
  geminiApiKey: string;
  sheetId: string;
  metaPageToken: string;
  whatsAppToken?: string;
  instagramToken?: string;
  bargainingEnabled: boolean;
  aiPaused: boolean;
  subscriptionTier: string;
  theme: string;
  config?: AppConfig;
  settingsVersion?: number;
  customInstructions?: string;
  removeWatermark?: boolean;
  priorityQueue?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: string;
}