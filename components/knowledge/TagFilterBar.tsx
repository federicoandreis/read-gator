import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TagFilterBarProps {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

export function TagFilterBar({ tags, selected, onSelect }: TagFilterBarProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tags.map((tag) => {
          const active = tag === selected;
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(active ? null : tag)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  chipActive: {
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  labelActive: {
    color: '#fff',
  },
});
