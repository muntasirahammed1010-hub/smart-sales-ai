/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, Lead } from '../types';

export async function fetchSheetData(sheetId: string, range: string) {
  try {
    // Note: In a production app, you'd use the Google Sheets API with an API Key or OAuth token.
    // For this build, we retrieve public CSV data or JSON if the sheet is published.
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${range}`;
    const response = await fetch(url);
    const text = await response.text();
    
    // Clean up the Google Visualization API response
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonStr);
    
    return data.table.rows;
  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    return [];
  }
}

export function parseProducts(rows: any[]): InventoryItem[] {
  return rows.map((row: any, index: number) => ({
    id: String(index + 1),
    name: row.c[0]?.v || 'Unknown Product',
    price: Number(row.c[1]?.v) || 0,
    stock: Number(row.c[2]?.v) || 0,
    category: row.c[3]?.v || 'General'
  }));
}

export function parseLeads(rows: any[]): Lead[] {
  return rows
    .filter((row: any) => 
      row.c && 
      row.c[0]?.v && 
      row.c[0]?.v !== 'Parameter' && 
      row.c[0]?.v !== 'A1' && 
      row.c[1]?.v
    )
    .map((row: any, index: number) => ({
      id: `SHEET-${index}-${Date.now()}`,
      name: String(row.c[0]?.v || 'Anonymous'),
      phone: String(row.c[1]?.v || ''),
      address: String(row.c[2]?.v || ''),
      product: String(row.c[3]?.v || 'Unknown'),
      status: (row.c[4]?.v || 'pending') as 'pending' | 'shipped' | 'delivered',
      timestamp: String(row.c[5]?.v || new Date().toISOString()),
      amount: Number(row.c[6]?.v) || 0
    }));
}

export function parseConfig(rows: any[]) {
  const config: any = {};
  rows.forEach((row: any) => {
    const key = row.c[0]?.v;
    const value = row.c[1]?.v;
    if (key) config[key] = value;
  });
  return config;
}
