import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { UserPlus, Check, X } from "lucide-react-native";
import { PendingFriendRequest } from "@/types/social";

interface Props {
  requests: PendingFriendRequest[];
  isLoading: boolean;
  respondingId: string | null;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  colors: any;
}

export const PendingRequestsSection = ({ requests, isLoading, respondingId, onAccept, onRefuse, colors }: Props) => {
  const router = useRouter();

  if (!isLoading && requests.length === 0) return null;

  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-6 rounded-[16px] p-4 border">
      <View className="flex-row items-center mb-3">
        <UserPlus size={14} color={colors.primary} />
        <Text style={{ color: colors.text }} className="text-[9px] font-black uppercase tracking-[3px] ml-2">
          Demandes d'amis
        </Text>
        {requests.length > 0 && (
          <View style={{ backgroundColor: colors.primary }} className="ml-2 px-2 py-0.5 rounded-full">
            <Text style={{ color: colors.secondary }} className="text-[9px] font-black">{requests.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        requests.map((req) => (
          <View key={req.id} style={{ borderTopColor: colors.border }} className="flex-row items-center py-3 border-t">
            <TouchableOpacity
              onPress={() => router.push(`/community/user/${req.id}` as any)}
              style={{ backgroundColor: colors.primary + "22", width: 38, height: 38, borderRadius: 11 }}
              className="items-center justify-center mr-3"
            >
              <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 14 }}>
                {req.username[0]?.toUpperCase() ?? "?"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push(`/community/user/${req.id}` as any)}>
              <Text style={{ color: colors.text }} className="font-bold text-sm">{req.username}</Text>
              <Text style={{ color: colors.muted }} className="text-[10px]">Veut vous suivre</Text>
            </TouchableOpacity>

            <View className="flex-row gap-x-2">
              <TouchableOpacity
                onPress={() => onAccept(req.id)}
                disabled={respondingId === req.id}
                style={{ backgroundColor: colors.primary, opacity: respondingId === req.id ? 0.5 : 1 }}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <Check size={14} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onRefuse(req.id)}
                disabled={respondingId === req.id}
                style={{ backgroundColor: colors.surface, borderColor: colors.border, opacity: respondingId === req.id ? 0.5 : 1 }}
                className="w-8 h-8 rounded-full items-center justify-center border"
              >
                <X size={14} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};
