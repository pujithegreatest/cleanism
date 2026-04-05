import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useChoreStore } from "../state/choreStore";
import { useThemeColors } from "../state/themeStore";
import { format, isToday, isTomorrow, isPast, startOfDay, differenceInDays } from "date-fns";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { AreaTag, Chore } from "../types/chore";
import { ThemeColors } from "../types/chore";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AREA_TAGS: AreaTag[] = [
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living Room",
  "Garage",
  "Outdoor",
  "Other",
];

const AREA_ICONS: Record<AreaTag, keyof typeof Ionicons.glyphMap> = {
  Kitchen: "restaurant-outline",
  Bathroom: "water-outline",
  Bedroom: "bed-outline",
  "Living Room": "tv-outline",
  Garage: "car-outline",
  Outdoor: "leaf-outline",
  Other: "ellipsis-horizontal",
};

const MOTIVATIONAL_MESSAGES = [
  "A clean space is a clear mind",
  "Small steps lead to big results",
  "You are doing amazing",
  "Every task completed is a win",
  "Your future self will thank you",
];

export default function HomeScreen({ navigation }: Props) {
  const colors = useThemeColors();

  const getPendingChores = useChoreStore((s) => s.getPendingChores);
  const getCompletedChores = useChoreStore((s) => s.getCompletedChores);
  const pendingChores = getPendingChores();
  const completedChores = getCompletedChores();

  const [selectedFilter, setSelectedFilter] = useState<AreaTag | "All">("All");
  const [motivationalMessage, setMotivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredChores =
    selectedFilter === "All"
      ? pendingChores
      : pendingChores.filter((c) => c.areaTag === selectedFilter);

  // Calculate streak (consecutive days with completed chores)
  const calculateStreak = () => {
    const completedDates = completedChores
      .filter((c) => c.completedAt)
      .map((c) => startOfDay(c.completedAt!).getTime())
      .sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    const uniqueDates = [...new Set(completedDates)];
    let streak = 0;
    const today = startOfDay(new Date()).getTime();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = today - i * 86400000;
      if (uniqueDates.includes(expectedDate)) {
        streak++;
      } else if (i === 0 && uniqueDates[0] === today - 86400000) {
        // Allow starting from yesterday
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefreshing(true);
    setMotivationalMessage(
      MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    );
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const getDueDateLabel = (dueDate?: number) => {
    if (!dueDate) return null;
    if (isToday(dueDate)) return "Today";
    if (isTomorrow(dueDate)) return "Tomorrow";
    if (isPast(dueDate)) return "Overdue";
    return format(dueDate, "MMM d");
  };

  const getDueDateColor = (dueDate?: number) => {
    if (!dueDate) return colors.secondaryText;
    if (isPast(dueDate) && !isToday(dueDate)) return "#EF4444";
    if (isToday(dueDate)) return colors.accents[0];
    return colors.secondaryText;
  };

  const handleFilterPress = (filter: AreaTag | "All") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filter);
  };

  const handleAddChore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("AddChore");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with gradient accent */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 pt-6 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: colors.text }} className="text-3xl font-bold">
                Cleanism
              </Text>
              <Text
                style={{ color: colors.secondaryText }}
                className="text-base mt-1"
              >
                {pendingChores.length} task{pendingChores.length !== 1 ? "s" : ""} remaining
              </Text>
            </View>

            <View className="flex-row items-center">
              {/* Refresh Button */}
              <Pressable
                onPress={handleRefresh}
                style={{ backgroundColor: colors.secondaryText + "15" }}
                className="p-2.5 rounded-full mr-2 active:scale-95"
              >
                <Animated.View
                  style={{
                    transform: [{ rotate: isRefreshing ? "360deg" : "0deg" }],
                  }}
                >
                  <Ionicons name="refresh" size={20} color={colors.accents[0]} />
                </Animated.View>
              </Pressable>

              {/* Streak Badge */}
              {streak > 0 && (
                <Animated.View
                  entering={FadeInRight.delay(300).duration(400)}
                  style={{ backgroundColor: colors.accents[2] + "20" }}
                  className="px-4 py-2 rounded-2xl flex-row items-center"
                >
                  <Ionicons name="flame" size={20} color={colors.accents[2]} />
                  <Text
                    style={{ color: colors.accents[2] }}
                    className="ml-1.5 font-bold text-base"
                  >
                    {streak}
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 pb-4">
          <Text
            style={{ color: colors.secondaryText, fontStyle: "italic" }}
            className="text-sm"
          >
            {`"${motivationalMessage}"`}
          </Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} className="px-6 mb-5">
          <View className="flex-row gap-3">
            <View
              style={{ backgroundColor: colors.accents[0] + "15" }}
              className="flex-1 rounded-2xl p-4"
            >
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: colors.accents[0] + "30" }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="list" size={20} color={colors.accents[0]} />
                </View>
                <View className="ml-3">
                  <Text
                    style={{ color: colors.text }}
                    className="text-xl font-bold"
                  >
                    {pendingChores.length}
                  </Text>
                  <Text
                    style={{ color: colors.secondaryText }}
                    className="text-xs"
                  >
                    To Do
                  </Text>
                </View>
              </View>
            </View>

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
                    {completedChores.length}
                  </Text>
                  <Text
                    style={{ color: colors.secondaryText }}
                    className="text-xs"
                  >
                    Done
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Add Chore Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-6 mb-5">
          <Pressable
            onPress={handleAddChore}
            className="rounded-2xl overflow-hidden active:scale-[0.98]"
          >
            <LinearGradient
              colors={[colors.accents[0], colors.accents[1] || colors.accents[0]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
            >
              <View
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={24} color="white" />
              </View>
              <Text className="text-white text-lg font-semibold ml-3">
                Add New Task
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Filter Pills */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6 mb-4"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            <Pressable
              onPress={() => handleFilterPress("All")}
              style={{
                backgroundColor:
                  selectedFilter === "All"
                    ? colors.accents[0]
                    : colors.secondaryText + "15",
              }}
              className="px-4 py-2.5 rounded-full mr-2 active:scale-95"
            >
              <Text
                style={{
                  color: selectedFilter === "All" ? "#FFFFFF" : colors.text,
                }}
                className="font-semibold"
              >
                All
              </Text>
            </Pressable>
            {AREA_TAGS.map((tag) => {
              const count = pendingChores.filter((c) => c.areaTag === tag).length;
              if (count === 0) return null;
              return (
                <Pressable
                  key={tag}
                  onPress={() => handleFilterPress(tag)}
                  style={{
                    backgroundColor:
                      selectedFilter === tag
                        ? colors.accents[0]
                        : colors.secondaryText + "15",
                  }}
                  className="flex-row items-center px-4 py-2.5 rounded-full mr-2 active:scale-95"
                >
                  <Ionicons
                    name={AREA_ICONS[tag]}
                    size={16}
                    color={selectedFilter === tag ? "#FFFFFF" : colors.text}
                  />
                  <Text
                    style={{
                      color: selectedFilter === tag ? "#FFFFFF" : colors.text,
                    }}
                    className="font-semibold ml-1.5"
                  >
                    {tag} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Section Label */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-6 mb-3">
          <Text style={{ color: colors.text }} className="text-lg font-bold">
            {selectedFilter === "All" ? "All Tasks" : selectedFilter}
          </Text>
        </Animated.View>

        {/* Chores List */}
        <View className="px-6 mb-8">
          {filteredChores.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(450).duration(500)}
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
                className="text-center text-xl font-bold"
              >
                All Clean!
              </Text>
              <Text
                style={{ color: colors.secondaryText }}
                className="text-center mt-2 text-base"
              >
                Add a new task to keep your space sparkling
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-4">
              {filteredChores.map((chore, index) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  colors={colors}
                  index={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("ChoreDetail", { choreId: chore.id });
                  }}
                  getDueDateLabel={getDueDateLabel}
                  getDueDateColor={getDueDateColor}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ChoreCardProps {
  chore: Chore;
  colors: ThemeColors;
  index: number;
  onPress: () => void;
  getDueDateLabel: (dueDate?: number) => string | null;
  getDueDateColor: (dueDate?: number) => string;
}

function ChoreCard({
  chore,
  colors,
  index,
  onPress,
  getDueDateLabel,
  getDueDateColor,
}: ChoreCardProps) {
  const dueDateLabel = getDueDateLabel(chore.dueDate);
  const scale = useSharedValue(1);
  const hasImage = Boolean(chore.beforeImageUri);

  const priorityColors: Record<string, string> = {
    low: "#22C55E",
    medium: "#F59E0B",
    high: "#EF4444",
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(450 + index * 80).duration(400)}
      style={animatedStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ backgroundColor: colors.secondaryText + "08" }}
        className="rounded-3xl overflow-hidden"
      >
        {/* Image with gradient overlay or placeholder */}
        {hasImage ? (
          <View className="relative">
            <Image
              source={{ uri: chore.beforeImageUri }}
              className="w-full h-44"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
              }}
            />
            {/* Area Tag on image */}
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: "rgba(0,0,0,0.5)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={AREA_ICONS[chore.areaTag]}
                size={14}
                color="#FFFFFF"
              />
              <Text className="text-white text-xs font-medium ml-1.5">
                {chore.areaTag}
              </Text>
            </View>
            {/* Due date badge */}
            {dueDateLabel && (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: getDueDateColor(chore.dueDate),
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text className="text-white text-xs font-bold">
                  {dueDateLabel}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="p-4 pb-2">
            <View className="flex-row items-center justify-between">
              {/* Area Tag */}
              <View
                style={{ backgroundColor: colors.accents[1] + "20" }}
                className="flex-row items-center px-3 py-1.5 rounded-full"
              >
                <Ionicons
                  name={AREA_ICONS[chore.areaTag]}
                  size={14}
                  color={colors.accents[1]}
                />
                <Text
                  style={{ color: colors.accents[1] }}
                  className="text-xs font-medium ml-1.5"
                >
                  {chore.areaTag}
                </Text>
              </View>
              <View className="flex-row items-center">
                {/* Priority indicator */}
                {chore.priority && (
                  <View
                    style={{ backgroundColor: priorityColors[chore.priority] }}
                    className="w-2.5 h-2.5 rounded-full mr-2"
                  />
                )}
                {/* Time estimate */}
                {chore.estimatedMinutes && (
                  <View className="flex-row items-center mr-2">
                    <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                    <Text style={{ color: colors.secondaryText }} className="text-xs ml-1">
                      {chore.estimatedMinutes < 60 ? `${chore.estimatedMinutes}m` : "1h"}
                    </Text>
                  </View>
                )}
                {/* Due date badge */}
                {dueDateLabel && (
                  <View
                    style={{ backgroundColor: getDueDateColor(chore.dueDate) + "20" }}
                    className="px-2.5 py-1 rounded-full"
                  >
                    <Text
                      style={{ color: getDueDateColor(chore.dueDate) }}
                      className="text-xs font-semibold"
                    >
                      {dueDateLabel}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        <View className={hasImage ? "p-4" : "px-4 pb-4"}>
          {/* Title */}
          <Text
            style={{ color: colors.text }}
            className="text-lg font-bold mb-2"
            numberOfLines={1}
          >
            {chore.name}
          </Text>

          {/* AI Tip */}
          <View
            style={{ backgroundColor: colors.accents[0] + "12" }}
            className="p-3 rounded-2xl flex-row items-start"
          >
            <Ionicons
              name="bulb"
              size={16}
              color={colors.accents[0]}
              style={{ marginTop: 2 }}
            />
            <Text
              style={{ color: colors.text }}
              className="text-sm leading-5 ml-2 flex-1"
              numberOfLines={2}
            >
              {chore.aiTip}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
