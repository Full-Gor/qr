export const COLORS = {
  primary: '#6C5CE7',
  primaryDark: '#5B4BD5',
  secondary: '#00CEC9',
  background: '#0F0F23',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',
  border: '#3D3D5C',
};

export const STORAGE_KEYS = {
  HISTORY: '@qr_scanner_history',
};

export const BARCODE_TYPES = [
  'aztec',
  'codabar',
  'code39',
  'code93',
  'code128',
  'code39mod43',
  'datamatrix',
  'ean13',
  'ean8',
  'interleaved2of5',
  'itf14',
  'maxicode',
  'pdf417',
  'rss14',
  'rssexpanded',
  'upc_a',
  'upc_e',
  'upc_ean',
  'qr',
] as const;
