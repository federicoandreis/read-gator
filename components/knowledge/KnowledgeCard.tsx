import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { LibraryItem } from '../../types/libraryItem';
import { TagList } from './TagList';
import type { Priority } from '../../types/knowledgeObject';
import { useLibraryContext } from '../../providers/LibraryProvider';

interface KnowledgeCardProps {
  item: LibraryItem;
}

export function KnowledgeCard({ item }: KnowledgeCardProps) {
  if (item.kind === 'processing') return <ProcessingCard item={item} />;
  if (item.kind === 'failed') return <FailedCard item={item} />;
  return <CompleteCard item={item} />;
}

function CompleteCard({ item }: { item: Extract<LibraryItem, { kind: 'complete' }> }) {
  const { data: row } = item;
  const topics = row.tags_topics ? row.tags_topics.split(',').filter(Boolean) : [];
  const date = formatDate(row.captured_at);

  return (
    <Link href={`/item/${row.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{row.title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        {row.source_domain ? <Text style={styles.domain}>{row.source_domain}</Text> : null}
        <TagList topics={topics} priority={row.priority as Priority} />
      </TouchableOpacity>
    </Link>
  );
}

function ProcessingCard({ item }: { item: Extract<LibraryItem, { kind: 'processing' }> }) {
  const preview = item.input.length > 60 ? item.input.slice(0, 60) + '…' : item.input;

  return (
    <View style={[styles.card, styles.processingCard]}>
      <View style={styles.header}>
        <Text style={[styles.title, styles.mutedText]} numberOfLines={1}>{preview}</Text>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
      <Text style={styles.statusText}>Processing…</Text>
    </View>
  );
}

function FailedCard({ item }: { item: Extract<LibraryItem, { kind: 'failed' }> }) {
  const { dispatch } = useLibraryContext();
  const preview = item.input.length > 60 ? item.input.slice(0, 60) + '…' : item.input;

  return (
    <View style={[styles.card, styles.failedCard]}>
      <View style={styles.header}>
        <Text style={[styles.title, styles.mutedText]} numberOfLines={1}>{preview}</Text>
        <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE', id: item.id })}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.errorText} numberOfLines={2}>{item.error}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  processingCard: {
    borderColor: '#d0e8ff',
    backgroundColor: '#f5faff',
  },
  failedCard: {
    borderColor: '#ffd0d0',
    backgroundColor: '#fff5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: '#111',
  },
  mutedText: {
    color: '#888',
    fontWeight: '400',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    flexShrink: 0,
  },
  domain: {
    fontSize: 12,
    color: '#007AFF',
  },
  statusText: {
    fontSize: 13,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
  },
  dismissText: {
    fontSize: 13,
    color: '#888',
  },
});
