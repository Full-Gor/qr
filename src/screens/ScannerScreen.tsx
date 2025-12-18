import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult, BarcodeType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';
import { ScanFrame } from '../components/ScanFrame';
import { ControlBar } from '../components/ControlBar';
import { ResultModal } from '../components/ResultModal';
import { useScanner } from '../hooks/useScanner';
import { useFlashlight } from '../hooks/useFlashlight';

const BARCODE_TYPES: BarcodeType[] = [
  'qr',
  'aztec',
  'ean13',
  'ean8',
  'pdf417',
  'upc_e',
  'datamatrix',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'code128',
  'upc_a',
];

interface ScannerScreenProps {
  onHistoryPress: () => void;
}

export function ScannerScreen({ onHistoryPress }: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const { lastResult, handleBarCodeScanned, closeResult, scanned } = useScanner();
  const { isOn: flashOn, toggle: toggleFlash, turnOff: turnOffFlash } = useFlashlight();

  useEffect(() => {
    // Turn off flash when leaving screen
    return () => turnOffFlash();
  }, [turnOffFlash]);

  const handleGalleryPick = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Note: expo-camera doesn't directly support image barcode scanning
        // We'll show an informational message
        Alert.alert(
          'Scan depuis image',
          'Pour scanner un QR code depuis une image, positionnez votre téléphone devant l\'image affichée sur un autre écran.\n\nLe scan direct depuis la galerie nécessite une bibliothèque supplémentaire comme expo-barcode-scanner avec ML Kit.',
          [{ text: 'Compris' }]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, []);

  const onBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (!scanned) {
        handleBarCodeScanned(result);
      }
    },
    [scanned, handleBarCodeScanned]
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            Cette application a besoin de l'accès à la caméra pour scanner les codes QR et codes-barres.
          </Text>
          <View style={styles.permissionButton}>
            <Text style={styles.permissionButtonText} onPress={requestPermission}>
              Autoriser l'accès
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: [...BARCODE_TYPES],
        }}
        onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlaySection}>
            <Text style={styles.title}>Scanner QR Code</Text>
            <Text style={styles.subtitle}>
              Positionnez le code dans le cadre
            </Text>
          </View>

          {/* Scan frame */}
          <ScanFrame isScanning={!scanned} />

          {/* Control bar */}
          <ControlBar
            flashOn={flashOn}
            onFlashToggle={toggleFlash}
            onGalleryPress={handleGalleryPick}
            onHistoryPress={onHistoryPress}
          />
        </View>
      </CameraView>

      <ResultModal
        result={lastResult}
        visible={lastResult !== null}
        onClose={closeResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlaySection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
