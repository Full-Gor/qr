export type ContentType = 'url' | 'wifi' | 'contact' | 'email' | 'phone' | 'sms' | 'geo' | 'text';

export interface ScanResult {
  id: string;
  data: string;
  type: string;
  contentType: ContentType;
  timestamp: number;
  parsedData?: ParsedData;
}

export interface ParsedData {
  type: ContentType;
  raw: string;
  // URL
  url?: string;
  // WiFi
  ssid?: string;
  password?: string;
  encryption?: string;
  // Contact (vCard)
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
  // Email
  emailTo?: string;
  subject?: string;
  body?: string;
  // Phone/SMS
  phoneNumber?: string;
  message?: string;
  // Geo
  latitude?: number;
  longitude?: number;
}

export interface HistoryItem extends ScanResult {
  dateString: string;
}
