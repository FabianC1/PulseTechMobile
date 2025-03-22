import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';

type CustomAlertProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
};

export default function CustomAlerts({ visible, onClose, title = 'Alert', message }: CustomAlertProps) {
  const theme = useTheme();

  const backgroundColor = Array.isArray(theme.colors.background)
    ? theme.colors.background[0]
    : theme.colors.background;

  const accentColor = Array.isArray(theme.colors.background)
    ? theme.colors.background[1]
    : theme.colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: theme.colors.text }]}>{message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={[styles.modalButtonText, { color: accentColor }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0084ff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
