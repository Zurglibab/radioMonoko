import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Radio, ChevronRight, UserCircle } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

/**
 * WelcomeScreen : Point d'entrée de RadioMonoko.
 * Gère l'onboarding visuel et les trois flux d'accès : Login, Register et Guest mode.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Background Image */}
      <Image 
        source={require("@/assets/images/welcome.jpg")}
        className="absolute w-full h-full opacity-60"
        resizeMode="cover"
      />

      {/* Dégradé */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'black']}
        locations={[0, 0.4, 0.8]}
        className="absolute w-full h-full"
      />

      <View className="flex-1 justify-end px-8 pb-16">
        <View className="mb-12">
            <View className="flex-row items-center mb-6">
                <View className="bg-white/10 p-2 rounded-full mr-3 border border-white/20">
                    <Radio size={20} color="white" />
                </View>
                <Text className="text-white font-bold text-sm tracking-[4px] uppercase opacity-70">
                    RadioMonoko
                </Text>
            </View>
            
            {/* Accroche principale */}
            <Text className="text-white font-bold text-6xl mb-4 tracking-tighter leading-[55px]">
                L'onde{"\n"}<Text className="text-white/50">partagée.</Text>
            </Text>
            
            <Text className="text-gray-400 text-lg font-light leading-7">
                Découvrez des podcasts, critiquez les ondes et rejoignez la plus grande communauté de curateurs audio.
            </Text>
        </View>

        {/* Bloc d'actions */}
        <View className="gap-y-4">
            
            {/* CTA Primaire : Priorité à la connexion (connexion) */}
            <TouchableOpacity 
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.8}
                className="bg-white w-full py-5 rounded-2xl items-center flex-row justify-center"
            >
                <Text className="text-black font-bold text-lg">Se connecter</Text>
            </TouchableOpacity>

            {/* CTA Secondaire : Conversion nouveau membre (inscription) */}
            <TouchableOpacity 
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.7}
                className="w-full py-5 rounded-2xl items-center border border-white/30 flex-row justify-center"
            >
                <Text className="text-white font-bold text-lg mr-2">Rejoindre le club</Text>
                <ChevronRight size={18} color="white" />
            </TouchableOpacity>

            {/* Accès Invité */}
            <TouchableOpacity 
                onPress={() => router.replace("/(tabs)/home")} 
                activeOpacity={0.6}
                className="mt-2 py-2 items-center flex-row justify-center"
            >
                <UserCircle size={16} color="#9CA3AF" />
                <Text className="text-gray-400 font-medium text-sm ml-2 underline">
                    Explorer sans compte
                </Text>
            </TouchableOpacity>
        </View>

        {/* Footer de marque */}
        <View className="mt-12 items-center">
             <Text className="text-gray-600 text-[10px] tracking-widest uppercase font-bold">
                Powered by RadioMonoko
             </Text>
        </View>

      </View>
    </View>
  );
}