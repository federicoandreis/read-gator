import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCapture } from '../hooks/useCapture';
import { looksLikeUrl } from '../services/extraction/text';

export default function CaptureScreen() {
  const [input, setValue] = useState('');
  const { capture, isCapturing, error } = useCapture();

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const isUrl = looksLikeUrl(trimmed);

    if (!isUrl && trimmed.includes('http')) {
      Alert.alert(
        'Process as URL?',
        'This looks like it contains a URL. Would you like to fetch and process the page?',
        [
          { text: 'Process as text', onPress: () => doCapture(trimmed, false) },
          { text: 'Fetch URL', onPress: () => doCapture(trimmed, true), style: 'default' },
        ],
      );
      return;
    }

    await doCapture(trimmed, isUrl);
  }

  async function doCapture(text: string, asUrl: boolean) {
    try {
      await capture(text, asUrl);
      router.back();
    } catch {
      // Error displayed via hook state
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Paste a URL or text</Text>
        <TextInput
          style={styles.input}
          multiline
          value={input}
          onChangeText={setValue}
          placeholder="https://example.com or paste any text…"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, (!input.trim() || isCapturing) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim() || isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Capture</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    minHeight: 140,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    fontSize: 15,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
