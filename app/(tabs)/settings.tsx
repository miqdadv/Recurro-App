import { ActivityIndicator, Pressable, Text } from "react-native";
import { useState } from "react";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { reset, track } from "@/lib/analytics/analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut();
      track(AnalyticsEvents.Logout);
      reset();
      router.replace("/(auth)/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

      <Pressable
        className={`mt-8 items-center rounded-2xl bg-destructive py-4 ${isSigningOut ? "opacity-50" : ""}`}
        onPress={handleSignOut}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        {isSigningOut ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-base font-sans-bold text-white">Log out</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
