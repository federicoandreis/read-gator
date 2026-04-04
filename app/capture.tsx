import { useState } from 'react';
import {
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
  const { enqueueCapture } = useCapture();

  function dismiss() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as never);
    }
  }

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const isUrl = looksLikeUrl(trimmed);

    if (!isUrl && trimmed.includes('http')) {
      Alert.alert(
        'Process as URL?',
        'This looks like it contains a URL. Shall I fetch and process the page?',
        [
          { text: 'Use as text', onPress: () => submit(trimmed, false) },
          { text: 'Fetch URL', onPress: () => submit(trimmed, true), style: 'default' },
        ],
      );
      return;
    }

    submit(trimmed, isUrl);
  }

  function submit(text: string, asUrl: boolean) {
    enqueueCapture(text, asUrl);
    dismiss();
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

        <TouchableOpacity
          style={[styles.button, !input.trim() && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={dismiss}>
          <Text style={styles.cancelText}>Cancel</Text>
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
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    fontSize: 15,
    color: '#888',
  },
});
