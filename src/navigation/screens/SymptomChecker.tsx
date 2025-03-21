import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export function SymptomChecker() {
  const theme = useTheme();
  const [started, setStarted] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const startDiagnosis = async () => {
    try {
      const res = await fetch('http://192.168.0.84:3000/start-diagnosis', {
        method: 'POST',
      });
      const data = await res.json();
      setResponse(data.message || 'Session started');
      setStarted(true);
    } catch (err) {
      console.error('Start error:', err);
      setResponse('Failed to start diagnosis.');
    }
  };

  const sendInput = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://192.168.0.84:3000/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      setResponse(data.message || 'No response');
    } catch (err) {
      console.error('Send error:', err);
      setResponse('Something went wrong.');
    }
    setLoading(false);
    setUserInput('');
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {!started ? (
        <TouchableOpacity onPress={startDiagnosis} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Diagnosis</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={[styles.message, { color: theme.colors.text }]}>{response}</Text>
          <TextInput
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your symptom"
            placeholderTextColor="#aaa"
            style={[styles.input, { color: theme.colors.text, borderColor: '#aaa' }]}
          />
          <TouchableOpacity onPress={sendInput} disabled={loading} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
});
