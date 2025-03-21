import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export function SymptomChecker() {
  const theme = useTheme();
  const [started, setStarted] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickButtons, setShowQuickButtons] = useState(false);

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
        body: JSON.stringify({ userInput: userInput.toLowerCase() }),
      });
      const data = await res.json();
      setResponse(data.message || 'No response');

      // Check if the response expects yes/no input
      const lowerResp = (data.message || '').toLowerCase();
      if (
        lowerResp.includes('are you experiencing') ||
        lowerResp.includes('do you have') ||
        lowerResp.includes('(yes/no)')
      ) {
        setShowQuickButtons(true);
      } else {
        setShowQuickButtons(false);
      }

    } catch (err) {
      console.error('Send error:', err);
      setResponse('Something went wrong.');
      setShowQuickButtons(false);
    }
    setLoading(false);
    setUserInput('');
  };


  const handleQuickResponse = async (answer: 'yes' | 'no') => {
    setUserInput(answer);
    await sendInput();
  };
  

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setStarted(false);
    setUserInput('');
    setResponse('');
    await startDiagnosis();
    setRefreshing(false);
  }, []);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {!started ? (
            <>
              <Text style={[styles.introText, { color: theme.colors.text }]}>
                Get diagnosed by a trained AI using your symptoms
              </Text>
              <LinearGradient
                colors={['#8a5fff', '#0077ffea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <TouchableOpacity onPress={startDiagnosis} style={styles.touchable}>
                  <Text style={styles.buttonText}>Start Diagnosis</Text>
                </TouchableOpacity>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.diagnosisContainer}>
              <Text style={[styles.message, { color: theme.colors.text }]}>
                {response}
              </Text>
              <TextInput
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your symptom"
                placeholderTextColor="#aaa"
                style={[styles.input, { color: theme.colors.text, borderColor: '#aaa' }]}
              />
              <LinearGradient
                colors={['#8a5fff', '#0077ffea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <TouchableOpacity onPress={() => sendInput()} disabled={loading} style={styles.touchable}>
                  <Text style={styles.buttonText}>{loading ? '...' : 'Send'}</Text>
                </TouchableOpacity>
              </LinearGradient>
  
              {showQuickButtons && (
                <View style={styles.quickButtonsContainer}>
                  <TouchableOpacity onPress={() => handleQuickResponse('yes')} style={styles.quickButton}>
                    <Text style={styles.quickButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleQuickResponse('no')} style={styles.quickButton}>
                    <Text style={styles.quickButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 500,
  },
  introText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  diagnosisContainer: {
    marginTop: 40,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  gradientButton: {
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    width: '80%',
  },
  touchable: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  quickButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
