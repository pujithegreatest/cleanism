import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore, useThemeColors, themes } from "../state/themeStore";
import { useChoreStore } from "../state/choreStore";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const themeId = useThemeStore((s) => s.themeId);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  const colors = useThemeColors();

  const getPendingChores = useChoreStore((s) => s.getPendingChores);
  const getCompletedChores = useChoreStore((s) => s.getCompletedChores);
  const pendingChores = getPendingChores();
  const completedChores = getCompletedChores();

  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  // Calculate stats
  const totalTasks = pendingChores.length + completedChores.length;
  const completionRate = totalTasks > 0 ? Math.round((completedChores.length / totalTasks) * 100) : 0;

  // Calculate most cleaned area
  const areaStats = completedChores.reduce((acc, chore) => {
    acc[chore.areaTag] = (acc[chore.areaTag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topArea = Object.entries(areaStats).sort((a, b) => b[1] - a[1])[0];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 pt-6 pb-4">
        <Text style={{ color: colors.text }} className="text-3xl font-bold">
          Settings
        </Text>
        <Text style={{ color: colors.secondaryText }} className="text-base mt-1">
          Customize your experience
        </Text>
      </Animated.View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mb-6">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={[colors.accents[0], colors.accents[1] || colors.accents[0]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <Text className="text-white/80 text-sm font-medium mb-2">
                Your Cleaning Stats
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text className="text-white text-3xl font-bold">
                    {completedChores.length}
                  </Text>
                  <Text className="text-white/70 text-xs">Completed</Text>
                </View>
                <View className="h-12 w-px bg-white/30" />
                <View className="items-center">
                  <Text className="text-white text-3xl font-bold">
                    {completionRate}%
                  </Text>
                  <Text className="text-white/70 text-xs">Success Rate</Text>
                </View>
                <View className="h-12 w-px bg-white/30" />
                <View className="items-center">
                  <Text className="text-white text-3xl font-bold">
                    {topArea ? topArea[1] : 0}
                  </Text>
                  <Text className="text-white/70 text-xs">
                    {topArea ? topArea[0].split(" ")[0] : "Tasks"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Dark Mode Toggle */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View
            style={{ backgroundColor: colors.secondaryText + "10" }}
            className="rounded-2xl p-4 mb-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: colors.accents[0] + "20" }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name={isDarkMode ? "moon" : "sunny"}
                    size={22}
                    color={colors.accents[0]}
                  />
                </View>
                <View className="ml-4">
                  <Text
                    style={{ color: colors.text }}
                    className="text-base font-semibold"
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={{ color: colors.secondaryText }}
                    className="text-sm mt-0.5"
                  >
                    {isDarkMode ? "On" : "Off"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleDarkMode();
                }}
                trackColor={{
                  false: colors.secondaryText + "40",
                  true: colors.accents[0],
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Theme Selection */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-bold mb-4"
          >
            Theme
          </Text>
        </Animated.View>

        <View className="gap-3 mb-6">
          {themes.map((theme, index) => {
            const isSelected = themeId === theme.id;
            const previewColors = isDarkMode ? theme.dark : theme.light;

            return (
              <Animated.View
                key={theme.id}
                entering={FadeInDown.delay(300 + index * 50).duration(400)}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTheme(theme.id);
                  }}
                  style={{
                    backgroundColor: colors.secondaryText + "10",
                    borderColor: isSelected ? colors.accents[0] : "transparent",
                    borderWidth: 2,
                  }}
                  className="rounded-2xl p-4 active:scale-[0.98]"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {/* Color Preview */}
                      <View className="flex-row mr-4">
                        {previewColors.accents.map((color, idx) => (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: color,
                              marginLeft: idx > 0 ? -8 : 0,
                              zIndex: 4 - idx,
                            }}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                        ))}
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: colors.text }}
                          className="text-base font-semibold"
                        >
                          {theme.name}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View
                        style={{ backgroundColor: colors.accents[0] }}
                        className="w-6 h-6 rounded-full items-center justify-center"
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Quick Tips Section */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-bold mb-4"
          >
            Quick Tips
          </Text>
          <View
            style={{ backgroundColor: colors.accents[2] + "15" }}
            className="rounded-2xl p-4 mb-6"
          >
            <View className="flex-row items-start">
              <View
                style={{ backgroundColor: colors.accents[2] + "30" }}
                className="w-10 h-10 rounded-full items-center justify-center mt-0.5"
              >
                <Ionicons name="bulb" size={20} color={colors.accents[2]} />
              </View>
              <View className="ml-3 flex-1">
                <Text style={{ color: colors.text }} className="font-semibold mb-1">
                  Pro Cleaning Tip
                </Text>
                <Text style={{ color: colors.secondaryText }} className="text-sm leading-5">
                  Clean from top to bottom and left to right. This ensures dust and debris fall onto uncleaned areas, making your cleaning more efficient!
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Achievements Section */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-bold mb-4"
          >
            Achievements
          </Text>
          <View className="flex-row gap-3 mb-6">
            <View
              style={{ backgroundColor: completedChores.length >= 1 ? colors.accents[3] + "20" || colors.accents[0] + "20" : colors.secondaryText + "10" }}
              className="flex-1 rounded-2xl p-4 items-center"
            >
              <View
                style={{ backgroundColor: completedChores.length >= 1 ? colors.accents[3] || colors.accents[0] : colors.secondaryText + "40" }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
              >
                <Ionicons name="sparkles" size={24} color={completedChores.length >= 1 ? "#FFFFFF" : colors.secondaryText} />
              </View>
              <Text style={{ color: completedChores.length >= 1 ? colors.text : colors.secondaryText }} className="text-xs font-semibold text-center">
                First Clean
              </Text>
            </View>
            <View
              style={{ backgroundColor: completedChores.length >= 10 ? colors.accents[2] + "20" : colors.secondaryText + "10" }}
              className="flex-1 rounded-2xl p-4 items-center"
            >
              <View
                style={{ backgroundColor: completedChores.length >= 10 ? colors.accents[2] : colors.secondaryText + "40" }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
              >
                <Ionicons name="star" size={24} color={completedChores.length >= 10 ? "#FFFFFF" : colors.secondaryText} />
              </View>
              <Text style={{ color: completedChores.length >= 10 ? colors.text : colors.secondaryText }} className="text-xs font-semibold text-center">
                10 Tasks
              </Text>
            </View>
            <View
              style={{ backgroundColor: completedChores.length >= 50 ? colors.accents[0] + "20" : colors.secondaryText + "10" }}
              className="flex-1 rounded-2xl p-4 items-center"
            >
              <View
                style={{ backgroundColor: completedChores.length >= 50 ? colors.accents[0] : colors.secondaryText + "40" }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
              >
                <Ionicons name="trophy" size={24} color={completedChores.length >= 50 ? "#FFFFFF" : colors.secondaryText} />
              </View>
              <Text style={{ color: completedChores.length >= 50 ? colors.text : colors.secondaryText }} className="text-xs font-semibold text-center">
                50 Tasks
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(650).duration(400)}>
          <View
            style={{ backgroundColor: colors.secondaryText + "10" }}
            className="rounded-2xl p-4 mb-8"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: colors.accents[0] + "20" }}
                className="w-12 h-12 rounded-2xl items-center justify-center"
              >
                <Ionicons name="sparkles" size={24} color={colors.accents[0]} />
              </View>
              <View className="ml-3">
                <Text
                  style={{ color: colors.text }}
                  className="text-lg font-bold"
                >
                  Cleanism
                </Text>
                <Text style={{ color: colors.secondaryText }} className="text-sm">
                  Your AI-powered cleaning assistant
                </Text>
              </View>
            </View>
            <View
              style={{ backgroundColor: colors.secondaryText + "10" }}
              className="rounded-xl p-3"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text style={{ color: colors.secondaryText }} className="text-xs">
                  Version
                </Text>
                <Text style={{ color: colors.text }} className="text-xs font-medium">
                  1.0.0
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.secondaryText }} className="text-xs">
                  Made with
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={12} color="#EF4444" />
                  <Text style={{ color: colors.text }} className="text-xs font-medium ml-1">
                    for clean spaces
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
