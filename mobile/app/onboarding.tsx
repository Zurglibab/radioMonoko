import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Animated, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import OnboardingItem from "@/features/onboarding/components/OnboardingItem";
import Paginator from "@/features/onboarding/components/Paginator";
import { ONBOARDING_SLIDES } from "@/features/onboarding/data/slides";
import { setOnboardingSeen } from "@/services/onboarding/storage/onboarding.storage";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollToNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await setOnboardingSeen();
      router.replace("/welcome");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <FlatList
        data={ONBOARDING_SLIDES}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={slidesRef}
      />

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-8">
        <View className="items-center mb-4">
          <Paginator data={ONBOARDING_SLIDES} scrollX={scrollX} />
        </View>

        <TouchableOpacity
          onPress={scrollToNext}
          activeOpacity={0.7}
          className="flex-row items-center justify-center h-16 rounded-2xl border-2 border-black"
          style={{ backgroundColor: theme.light.colors.background }}
        >
          <Text className="text-black font-bold text-lg mr-2 tracking-widest uppercase">
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? t("onboarding.controls.getStarted")
              : t("onboarding.controls.next")}
          </Text>

          {currentIndex === ONBOARDING_SLIDES.length - 1 ? (
            <Check size={22} color="black" strokeWidth={3} />
          ) : (
            <ArrowRight size={22} color="black" strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}