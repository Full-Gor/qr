import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { COLORS } from './src/constants';

type Screen = 'scanner' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('scanner');

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'scanner' ? (
        <ScannerScreen onHistoryPress={() => setCurrentScreen('history')} />
      ) : (
        <HistoryScreen onBack={() => setCurrentScreen('scanner')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
