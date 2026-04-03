import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Priority } from '../../types/knowledgeObject';

interface TagListProps {
  topics: string[];
  priority?: Priority;
}

const PRIORITY_COLOURS: Record<Priority, string> = {
  high: '#e74c3c',
  medium: '#f39c12',
  low: '#27ae60',
};

export function TagList({ topics, priority }: TagListProps) {
  if (topics.length === 0 && !priority) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {priority ? (
        <View style={[styles.badge, { backgroundColor: PRIORITY_COLOURS[priority] + '22' }]}>
          <Text style={[styles.badgeText, { color: PRIORITY_COLOURS[priority] }]}>
            {priority}
          </Text>
        </View>
      ) : null}
      {topics.map((topic) => (
        <View key={topic} style={styles.badge}>
          <Text style={styles.badgeText}>{topic}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'nowrap',
  },
  badge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
  },
});
