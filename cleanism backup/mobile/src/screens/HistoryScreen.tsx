import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useChoreStore } from "../state/choreStore";
import { useThemeColors } from "../state/themeStore";
import { format } from "date-fns";
import { AreaTag } from "../types/chore";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const AREA_ICONS: Record<AreaTag, keyof typeof Ionicons.glyphMap> = {
  Kitchen: "restaurant-outline",
  Bathroom: "water-outline",
  Bedroom: "bed-outline",
  "Living Room": "tv-outline",
  Garage: "car-outline",
  Outdoor: "leaf-outline",
  Other: "ellipsis-horizontal",
};

export default function HistoryScreen() {
  const colors = useThemeColors();

  const getCompletedChores = useChoreStore((s) => s.getCompletedChores);
  const getPendingChores = useChoreStore((s) => s.getPendingChores);
  const completedChores = getCompletedChores();
  const pendingChores = getPendingChores();

  const totalCompleted = completedChores.length;
  const totalPending = pendingChores.length;
  const completionRate = totalCompleted + totalPending > 0
    ? Math.round((totalCompleted / (totalCompleted + totalPending)) * 100)
    : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 pt-6 pb-4">
        <Text style={{ color: colors.text }} className="text-3xl font-bold">
          History
        </Text>
        <Text style={{ color: colors.secondaryText }} className="text-base mt-1">
          Track your cleaning progress
        </Text>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 mb-5">
        <View className="flex-row gap-3">
          <View
            style={{ backgroundColor: colors.accents[2] + "15" }}
            className="flex-1 rounded-2xl p-4"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.accents[2] + "30" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="checkmark-done" size={20} color={colors.accents[2]} />
              </View>
              <View className="ml-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-bold"
                >
                  {totalCompleted}
                </Text>
                <Text
                  style={{ color: colors.secondaryText }}
                  className="text-xs"
                >
                  Completed
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{ backgroundColor: colors.accents[0] + "15" }}
            className="flex-1 rounded-2xl p-4"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.accents[0] + "30" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="hourglass-outline" size={20} color={colors.accents[0]} />
              </View>
              <View className="ml-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-bold"
                >
                  {totalPending}
                </Text>
                <Text
                  style={{ color: colors.secondaryText }}
                  className="text-xs"
                >
                  Pending
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      {(totalCompleted + totalPending) > 0 && (
        <Animated.View entering={FadeInDown.delay(250).duration(500)} className="px-6 mb-5">
          <View
            style={{ backgroundColor: colors.secondaryText + "10" }}
            className="rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className="font-semibold">
                Completion Rate
              </Text>
              <Text style={{ color: colors.accents[2] }} className="font-bold text-lg">
                {completionRate}%
              </Text>
            </View>
            <View
              style={{ backgroundColor: colors.secondaryText + "20" }}
              className="h-3 rounded-full overflow-hidden"
            >
              <LinearGradient
                colors={[colors.accents[2], colors.accents[1] || colors.accents[2]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: `${completionRate}%`,
                  height: "100%",
                  borderRadius: 999,
                }}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Section Label */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-6 mb-3">
        <Text style={{ color: colors.text }} className="text-lg font-bold">
          Completed Tasks
        </Text>
      </Animated.View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {completedChores.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(350).duration(500)}
            style={{ backgroundColor: colors.secondaryText + "10" }}
            className="rounded-3xl p-8 items-center"
          >
            <View
              style={{ backgroundColor: colors.accents[2] + "20" }}
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
            >
              <Ionicons
                name="sparkles"
                size={40}
                color={colors.accents[2]}
              />
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-semibold"
            >
              No completed tasks yet
            </Text>
            <Text
              style={{ color: colors.secondaryText }}
              className="text-center mt-2"
            >
              Complete some tasks to see them here
            </Text>
          </Animated.View>
        ) : (
          <View className="pb-6 gap-3">
            {completedChores.map((chore, index) => (
              <Animated.View
                key={chore.id}
                entering={FadeInDown.delay(350 + index * 60).duration(400)}
              >
                <View
                  style={{ backgroundColor: colors.secondaryText + "08" }}
                  className="rounded-2xl overflow-hidden"
                >
                  <View className="flex-row">
                    {/* Thumbnail */}
                    <Image
                      source={{ uri: chore.beforeImageUri }}
                      className="w-24 h-24"
                      resizeMode="cover"
                    />

                    {/* Content */}
                    <View className="flex-1 p-3 justify-center">
                      <View className="flex-row items-center mb-1">
                        <View
                          style={{ backgroundColor: colors.accents[2] }}
                          className="w-5 h-5 rounded-full items-center justify-center mr-2"
                        >
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text
                          style={{ color: colors.text }}
                          className="font-bold text-base flex-1"
                          numberOfLines={1}
                        >
                          {chore.name}
                        </Text>
                      </View>

                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name={AREA_ICONS[chore.areaTag]}
                          size={12}
                          color={colors.secondaryText}
                        />
                        <Text
                          style={{ color: colors.secondaryText }}
                          className="text-xs ml-1"
                        >
                          {chore.areaTag}
                        </Text>
                      </View>

                      {chore.completedAt && (
                        <Text
                          style={{ color: colors.secondaryText }}
                          className="text-xs mt-1.5"
                        >
                          {format(chore.completedAt, "MMM d, h:mm a")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
