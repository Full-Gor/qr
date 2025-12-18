import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface ControlBarProps {
  flashOn: boolean;
  onFlashToggle: () => void;
  onGalleryPress: () => void;
  onHistoryPress: () => void;
}

export function ControlBar({
  flashOn,
  onFlashToggle,
  onGalleryPress,
  onHistoryPress,
}: ControlBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, flashOn && styles.buttonActive]}
        onPress={onFlashToggle}
      >
        <Text style={styles.buttonIcon}>{flashOn ? '🔦' : '💡'}</Text>
        <Text style={[styles.buttonText, flashOn && styles.buttonTextActive]}>
          {flashOn ? 'ON' : 'Flash'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onGalleryPress}>
        <Text style={styles.buttonIcon}>🖼️</Text>
        <Text style={styles.buttonText}>Galerie</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onHistoryPress}>
        <Text style={styles.buttonIcon}>📜</Text>
        <Text style={styles.buttonText}>Historique</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: COLORS.text,
  },
});
