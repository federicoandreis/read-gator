import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { KnowledgeObject } from '../../types/knowledgeObject';
import { loadKnowledgeObject } from '../../services/storage';
import { TagList } from '../../components/knowledge/TagList';

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<KnowledgeObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadKnowledgeObject(id)
      .then(setItem)
      .catch(() => setError('Could not load this knowledge object.'));
  }, [id]);

  if (error) {
    return (
      <View style={styles.centre}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.title}</Text>

      {item.source.url ? (
        <Text style={styles.url} numberOfLines={1}>
          {item.source.url}
        </Text>
      ) : null}

      <TagList topics={item.tags.topics} priority={item.tags.priority} />

      <Section heading="Summary">
        <Text style={styles.body}>{item.summary}</Text>
      </Section>

      <Section heading="Key points">
        {item.key_points.map((p, i) => (
          <Text key={i} style={styles.bullet}>
            • {p}
          </Text>
        ))}
      </Section>

      <Section heading="Why this matters">
        <Text style={styles.body}>{item.why_it_matters}</Text>
      </Section>

      {item.follow_up ? (
        <Section heading="Follow-up">
          <Text style={styles.body}>{item.follow_up}</Text>
        </Section>
      ) : null}

      {item.entities.length > 0 ? (
        <Section heading="Entities">
          {item.entities.map((e, i) => (
            <Text key={i} style={styles.bullet}>
              <Text style={styles.entityName}>{e.name}</Text>
              <Text style={styles.entityType}> ({e.type})</Text>
              {e.relevance ? `: ${e.relevance}` : ''}
            </Text>
          ))}
        </Section>
      ) : null}

      <Text style={styles.meta}>
        {item.processing.model} · Prompt {item.processing.prompt_version} ·{' '}
        {item.confidence.extraction_quality} confidence
      </Text>
    </ScrollView>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  url: {
    fontSize: 13,
    color: '#007AFF',
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  entityName: {
    fontWeight: '600',
  },
  entityType: {
    color: '#888',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
  },
});
