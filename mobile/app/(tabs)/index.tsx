import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-6">

      <Text className="text-4xl font-bold text-white mb-4">
        Tailwind Test
      </Text>

      <View className="bg-red-500 w-full h-32 rounded-xl justify-center items-center shadow-lg mb-8">
        <Text className="text-white font-semibold text-lg">
          Je crée une carte rouge pour vérifier que Tailwind fonctionne
        </Text>
      </View>

      <Link href="/explore" asChild>
        <Pressable className="bg-blue-600 px-6 py-3 rounded-full active:bg-blue-700">
          <Text className="text-white font-medium">
            Aller vers Explore
          </Text>
        </Pressable>
      </Link>

    </View>
  );
}