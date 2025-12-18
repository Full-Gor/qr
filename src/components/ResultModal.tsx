import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import * as Contacts from 'expo-contacts';
import { ScanResult } from '../types';
import { COLORS } from '../constants';
import { getContentTypeLabel, getContentTypeIcon } from '../utils/parser';

interface ResultModalProps {
  result: ScanResult | null;
  visible: boolean;
  onClose: () => void;
}

export function ResultModal({ result, visible, onClose }: ResultModalProps) {
  if (!result) return null;

  const { parsedData, contentType, data, type, timestamp } = result;
  const date = new Date(timestamp);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(data);
    Alert.alert('Copié !', 'Le contenu a été copié dans le presse-papier');
  };

  const openURL = async () => {
    if (parsedData?.url) {
      try {
        await WebBrowser.openBrowserAsync(parsedData.url);
      } catch {
        Linking.openURL(parsedData.url);
      }
    }
  };

  const connectToWifi = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Wi-Fi',
        `Pour vous connecter à "${parsedData?.ssid}":\n\nMot de passe: ${parsedData?.password}\n\n(Copié dans le presse-papier)`,
        [
          { text: 'Copier le mot de passe', onPress: () => Clipboard.setStringAsync(parsedData?.password || '') },
          { text: 'OK' },
        ]
      );
    } else {
      Alert.alert(
        'Wi-Fi',
        `Réseau: ${parsedData?.ssid}\nMot de passe: ${parsedData?.password}\nType: ${parsedData?.encryption}`,
        [
          { text: 'Copier le mot de passe', onPress: () => Clipboard.setStringAsync(parsedData?.password || '') },
          { text: 'OK' },
        ]
      );
    }
  };

  const addContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès aux contacts');
        return;
      }

      const contact: Contacts.Contact = {
        contactType: Contacts.ContactTypes.Person,
        name: parsedData?.name || 'Contact',
        firstName: parsedData?.name?.split(' ')[0] || '',
        lastName: parsedData?.name?.split(' ').slice(1).join(' ') || '',
        phoneNumbers: parsedData?.phone
          ? [{ label: 'mobile', number: parsedData.phone }]
          : undefined,
        emails: parsedData?.email
          ? [{ label: 'email', email: parsedData.email }]
          : undefined,
        company: parsedData?.organization || undefined,
      };

      await Contacts.addContactAsync(contact);
      Alert.alert('Succès', 'Contact ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le contact');
    }
  };

  const callPhone = () => {
    if (parsedData?.phoneNumber) {
      Linking.openURL(`tel:${parsedData.phoneNumber}`);
    }
  };

  const sendSMS = () => {
    if (parsedData?.phoneNumber) {
      const body = parsedData.message ? `?body=${encodeURIComponent(parsedData.message)}` : '';
      Linking.openURL(`sms:${parsedData.phoneNumber}${body}`);
    }
  };

  const sendEmail = () => {
    if (parsedData?.emailTo) {
      const params = [];
      if (parsedData.subject) params.push(`subject=${encodeURIComponent(parsedData.subject)}`);
      if (parsedData.body) params.push(`body=${encodeURIComponent(parsedData.body)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      Linking.openURL(`mailto:${parsedData.emailTo}${query}`);
    }
  };

  const openMap = () => {
    if (parsedData?.latitude && parsedData?.longitude) {
      const url = Platform.select({
        ios: `maps:${parsedData.latitude},${parsedData.longitude}`,
        android: `geo:${parsedData.latitude},${parsedData.longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const renderActions = () => {
    const actions: React.ReactElement[] = [];

    switch (contentType) {
      case 'url':
        actions.push(
          <TouchableOpacity key="open" style={styles.actionButton} onPress={openURL}>
            <Text style={styles.actionIcon}>🌐</Text>
            <Text style={styles.actionText}>Ouvrir le lien</Text>
          </TouchableOpacity>
        );
        break;

      case 'wifi':
        actions.push(
          <TouchableOpacity key="wifi" style={styles.actionButton} onPress={connectToWifi}>
            <Text style={styles.actionIcon}>📶</Text>
            <Text style={styles.actionText}>Voir les infos Wi-Fi</Text>
          </TouchableOpacity>
        );
        break;

      case 'contact':
        actions.push(
          <TouchableOpacity key="contact" style={styles.actionButton} onPress={addContact}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Ajouter aux contacts</Text>
          </TouchableOpacity>
        );
        if (parsedData?.phone) {
          actions.push(
            <TouchableOpacity key="call" style={styles.actionButton} onPress={callPhone}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
          );
        }
        break;

      case 'email':
        actions.push(
          <TouchableOpacity key="email" style={styles.actionButton} onPress={sendEmail}>
            <Text style={styles.actionIcon}>✉️</Text>
            <Text style={styles.actionText}>Envoyer un email</Text>
          </TouchableOpacity>
        );
        break;

      case 'phone':
        actions.push(
          <TouchableOpacity key="call" style={styles.actionButton} onPress={callPhone}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>
        );
        break;

      case 'sms':
        actions.push(
          <TouchableOpacity key="sms" style={styles.actionButton} onPress={sendSMS}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Envoyer un SMS</Text>
          </TouchableOpacity>
        );
        break;

      case 'geo':
        actions.push(
          <TouchableOpacity key="map" style={styles.actionButton} onPress={openMap}>
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>Ouvrir dans Maps</Text>
          </TouchableOpacity>
        );
        break;
    }

    // Always add copy button
    actions.push(
      <TouchableOpacity key="copy" style={[styles.actionButton, styles.secondaryButton]} onPress={copyToClipboard}>
        <Text style={styles.actionIcon}>📋</Text>
        <Text style={styles.actionText}>Copier le contenu</Text>
      </TouchableOpacity>
    );

    return actions;
  };

  const renderDetails = () => {
    switch (contentType) {
      case 'wifi':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Réseau:</Text>
            <Text style={styles.detailValue}>{parsedData?.ssid}</Text>
            <Text style={styles.detailLabel}>Mot de passe:</Text>
            <Text style={styles.detailValue}>{parsedData?.password || '(aucun)'}</Text>
            <Text style={styles.detailLabel}>Sécurité:</Text>
            <Text style={styles.detailValue}>{parsedData?.encryption || 'Open'}</Text>
          </View>
        );

      case 'contact':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Nom:</Text>
            <Text style={styles.detailValue}>{parsedData?.name || '(non spécifié)'}</Text>
            {parsedData?.phone && (
              <>
                <Text style={styles.detailLabel}>Téléphone:</Text>
                <Text style={styles.detailValue}>{parsedData.phone}</Text>
              </>
            )}
            {parsedData?.email && (
              <>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{parsedData.email}</Text>
              </>
            )}
            {parsedData?.organization && (
              <>
                <Text style={styles.detailLabel}>Organisation:</Text>
                <Text style={styles.detailValue}>{parsedData.organization}</Text>
              </>
            )}
          </View>
        );

      case 'geo':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Latitude:</Text>
            <Text style={styles.detailValue}>{parsedData?.latitude}</Text>
            <Text style={styles.detailLabel}>Longitude:</Text>
            <Text style={styles.detailValue}>{parsedData?.longitude}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.handle} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.typeIcon}>{getContentTypeIcon(contentType)}</Text>
              <Text style={styles.typeLabel}>{getContentTypeLabel(contentType)}</Text>
              <Text style={styles.barcodeType}>{type}</Text>
            </View>

            <View style={styles.dataContainer}>
              <Text style={styles.dataText} selectable>{data}</Text>
            </View>

            {renderDetails()}

            <Text style={styles.timestamp}>
              {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR')}
            </Text>

            <View style={styles.actions}>
              {renderActions()}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  barcodeType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dataContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dataText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceLight,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    marginHorizontal: 24,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
