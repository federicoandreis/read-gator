import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSearch } from '../../hooks/useSearch';
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { results, isSearching } = useSearch(query);
  const trimmed = query.trim();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search titles, tags, domains…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      {trimmed.length > 0 && !isSearching && (
        <Text style={styles.count}>
          {results.length === 0
            ? 'No results'
            : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </Text>
      )}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <KnowledgeCard item={{ kind: 'complete', data: item }} />}
        ListEmptyComponent={
          trimmed.length === 0 ? (
            <Text style={styles.idle}>
              Search across titles, tags, and domains.
            </Text>
          ) : isSearching ? (
            <Text style={styles.empty}>Searching…</Text>
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
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  count: {
    fontSize: 12,
    color: '#aaa',
    marginHorizontal: 20,
    marginTop: 8,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  idle: {
    textAlign: 'center',
    marginTop: 60,
    color: '#bbb',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 15,
  },
});
