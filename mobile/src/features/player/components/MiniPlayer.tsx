import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { Play, Pause, X } from "lucide-react-native";
import { usePlayer } from "@/context/PlayerContext";

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayer();

  if (!currentTrack) return null;

  return (
    <Pressable
      className="absolute bottom-[95px] left-2 right-2 h-16 flex-row items-center px-3 rounded-2xl border overflow-hidden shadow-2xl"
      style={{
        backgroundColor: "#121212",
        borderColor: "#222",
        elevation: 10
      }}
    >
      <Image
        source={{ uri: currentTrack.imageUrl }}
        className="w-10 h-10 rounded-lg mr-3"
      />

      <View className="flex-1">
        <Text
          className="text-white text-sm font-bold"
          numberOfLines={1}
        >
          {currentTrack.title}
        </Text>
        <Text className="text-gray-400 text-xs" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      <View className="flex-row items-center gap-x-4 px-2">
        <TouchableOpacity
          onPress={togglePlay}
          className="w-10 h-10 items-center justify-center rounded-full bg-white"
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={20} color="black" fill="black" />
          ) : (
            <Play size={20} color="black" fill="black" className="ml-1" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => playTrack(null as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full" />
      <View className="absolute bottom-0 left-0 h-[2px] bg-white w-[35%]" />
    </Pressable>
  );
};
