import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { KnowledgeObjectRow } from '../../services/storage';
import { TagList } from './TagList';
import type { Priority } from '../../types/knowledgeObject';

interface KnowledgeCardProps {
  row: KnowledgeObjectRow;
}

export function KnowledgeCard({ row }: KnowledgeCardProps) {
  const topics = row.tags_topics ? row.tags_topics.split(',').filter(Boolean) : [];
  const date = formatDate(row.captured_at);

  return (
    <Link href={`/item/${row.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {row.title}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {row.source_domain ? (
          <Text style={styles.domain}>{row.source_domain}</Text>
        ) : null}

        <TagList topics={topics} priority={row.priority as Priority} />
      </TouchableOpacity>
    </Link>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: '#111',
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
});
