import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanResult } from '../types';
import { STORAGE_KEYS } from '../constants';

export async function saveToHistory(scanResult: ScanResult): Promise<void> {
  try {
    const existing = await getHistory();
    const updated = [scanResult, ...existing].slice(0, 100); // Keep last 100 scans
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

export async function getHistory(): Promise<ScanResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const existing = await getHistory();
    const updated = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}
