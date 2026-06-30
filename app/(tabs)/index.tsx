import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding">
        <Text className="text-lg text-blue-500">Onboarding</Text>
      </Link>
      <Link href="/(auth)/sign-in">
        <Text className="text-lg text-blue-500">Sign-In</Text>
      </Link>
      <Link href="/(auth)/sign-up">
        <Text className="text-lg text-blue-500">Sign-Up</Text>
      </Link>
       <Link href="/subscriptions/spotify">
        Spotify Subscription
      </Link>
      <Link href={{pathname: '/subscriptions/[id]', params: { id: 'claude' }}}>
        Claude Subscription
      </Link>
    </View>
  );
}