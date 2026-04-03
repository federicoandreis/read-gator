import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '../providers/LibraryProvider';

export default function RootLayout() {
  return (
    <LibraryProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="capture" options={{ title: 'Add Item', presentation: 'modal' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Knowledge Object' }} />
      </Stack>
    </LibraryProvider>
  );
}
