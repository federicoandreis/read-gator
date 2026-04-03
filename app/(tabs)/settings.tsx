import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSettings } from '../../hooks/useSettings';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>LLM Configuration</Text>

      <Text style={styles.label}>Ollama base URL</Text>
      <TextInput
        style={styles.input}
        value={settings.ollamaBaseUrl}
        onChangeText={(v) => updateSettings({ ollamaBaseUrl: v })}
        placeholder="http://192.168.x.x:11434"
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Model</Text>
      <TextInput
        style={styles.input}
        value={settings.ollamaModel}
        onChangeText={(v) => updateSettings({ ollamaModel: v })}
        placeholder="llama3.2:3b"
        autoCapitalize="none"
      />

      <Text style={styles.sectionNote}>
        ReadGator uses Ollama for local processing. Point this to your Ollama instance on your local network.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    fontSize: 15,
  },
  sectionNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});
