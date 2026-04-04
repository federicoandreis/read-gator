import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSearch } from '../../hooks/useSearch';
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { results, isSearching } = useSearch(query);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search your library…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <KnowledgeCard item={{ kind: 'complete', data: item }} />}
        ListEmptyComponent={
          query.length > 0 ? (
            <Text style={styles.empty}>
              {isSearching ? 'Searching…' : 'No results found.'}
            </Text>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
