import React from "react";
import { Animated, useWindowDimensions, View } from "react-native";

/**
 * Paginator : Indicateur de progression visuel (en petits points).
 * @param data : Liste des slides pour déterminer le nombre de points.
 * @param scrollX : Valeur animée provenant de la FlatList parente.
 */
export default function Paginator({ data, scrollX }: any) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row h-10 items-center justify-center">
      {data.map((_: any, i: number) => {
        /**
         * Calcul des paliers d'entrée pour l'animation :
         * [Slide précédente, Slide actuelle, Slide suivante]
         */
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        // Effet pilule pour le point actif : il s'élargit et devient plus opaque
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: "clamp", // Empêche le point de rétrécir ou grandir au-delà des limites
        });

        // Gestion de l'opacité pour mettre en avant la page courante
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i.toString()}
            style={{ 
              width: dotWidth, 
              opacity, 
              backgroundColor: "white"
            }}
            className="h-1.5 rounded-full mx-1"
          />
        );
      })}
    </View>
  );
}