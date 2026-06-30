// app/_layout.tsx
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)/index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)/index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}