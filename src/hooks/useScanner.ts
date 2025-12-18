import { useState, useCallback, useRef } from 'react';
import { BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { ScanResult } from '../types';
import { parseQRContent } from '../utils/parser';
import { saveToHistory } from '../utils/storage';

export function useScanner() {
  const [scanned, setScanned] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = useCallback(async () => {
    try {
      // Try to play beep sound if available
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/buttons/beep-01a.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Fallback: just vibrate (already handled separately)
      console.log('Sound not available, using haptics only');
    }
  }, []);

  const handleBarCodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (scanned || isProcessing) return;

    setIsProcessing(true);
    setScanned(true);

    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Play sound
    playSound();

    // Parse content
    const parsedData = parseQRContent(result.data);

    // Create scan result
    const scanResult: ScanResult = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: result.data,
      type: result.type,
      contentType: parsedData.type,
      timestamp: Date.now(),
      parsedData,
    };

    // Save to history
    await saveToHistory(scanResult);

    setLastResult(scanResult);
    setIsProcessing(false);
  }, [scanned, isProcessing, playSound]);

  const resetScanner = useCallback(() => {
    setScanned(false);
    setLastResult(null);
  }, []);

  const closeResult = useCallback(() => {
    setLastResult(null);
    // Small delay before allowing new scan
    setTimeout(() => setScanned(false), 500);
  }, []);

  return {
    scanned,
    lastResult,
    isProcessing,
    handleBarCodeScanned,
    resetScanner,
    closeResult,
  };
}
