import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScanResult } from '../types';
import { COLORS } from '../constants';
import { getContentTypeIcon, getContentTypeLabel } from '../utils/parser';

interface HistoryItemProps {
  item: ScanResult;
  onPress: () => void;
  onDelete: () => void;
}

export function HistoryItem({ item, onPress, onDelete }: HistoryItemProps) {
  const date = new Date(item.timestamp);
  const dateString = date.toLocaleDateString('fr-FR');
  const timeString = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const truncateData = (data: string, maxLength: number = 50) => {
    if (data.length <= maxLength) return data;
    return data.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getContentTypeIcon(item.contentType)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.type}>{getContentTypeLabel(item.contentType)}</Text>
        <Text style={styles.data} numberOfLines={2}>
          {truncateData(item.data)}
        </Text>
        <Text style={styles.date}>{dateString} à {timeString}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
