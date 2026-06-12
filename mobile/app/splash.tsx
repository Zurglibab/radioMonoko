import React, { useEffect } from "react";
import { Animated, Image, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { preloadAppAssets } from "@/features/onboarding/data/slides"; 

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    async function prepareAssets() {
      try {
        await Promise.all([
          preloadAppAssets(),
          new Promise(resolve => setTimeout(resolve, 2500)),
        ]);
      } catch {
      } finally {
        router.replace("/onboarding");
      }
    }

    prepareAssets();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <StatusBar style="light" />

      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require("@/assets/images/logo/logo.png")}
          style={{ width: 250, height: 120 }}
          resizeMode="contain"
        />
      </Animated.View>

      <View className="absolute bottom-16">
        <View className="h-[2px] w-12 bg-white/20 overflow-hidden">
          <Animated.View
            className="h-full bg-white w-full"
            style={{
              transform: [{
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}