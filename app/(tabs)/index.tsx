import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useLibrary } from '../../hooks/useLibrary';
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard';
import { TagFilterBar } from '../../components/knowledge/TagFilterBar';
import type { LibraryItem } from '../../types/libraryItem';
import { itemId } from '../../types/libraryItem';

export default function LibraryScreen() {
  const { items, isLoading } = useLibrary();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (item.kind !== 'complete') continue;
      const topics = item.data.tags_topics
        ? item.data.tags_topics.split(',').filter(Boolean)
        : [];
      for (const t of topics) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [items]);

  const visibleItems = useMemo<LibraryItem[]>(() => {
    if (!selectedTag) return items;
    return items.filter((item) => {
      if (item.kind !== 'complete') return true; // always show in-progress cards
      const topics = item.data.tags_topics
        ? item.data.tags_topics.split(',').filter(Boolean)
        : [];
      return topics.includes(selectedTag);
    });
  }, [items, selectedTag]);

  return (
    <View style={styles.container}>
      <TagFilterBar
        tags={allTags}
        selected={selectedTag}
        onSelect={setSelectedTag}
      />
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => itemId(item)}
        renderItem={({ item }) => <KnowledgeCard item={item} />}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : selectedTag ? (
            <Text style={styles.empty}>No items tagged "{selectedTag}".</Text>
          ) : (
            <Text style={styles.empty}>No items yet. Tap + to add your first.</Text>
          )
        }
        contentContainerStyle={styles.list}
      />
      <Link href="/capture" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: '#999',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
});
