import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useThemeColors } from "../state/themeStore";
import { useChoreStore } from "../state/choreStore";
import { AreaTag, Priority } from "../types/chore";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { getOpenAITextResponse } from "../api/chat-service";

type Props = NativeStackScreenProps<RootStackParamList, "AddChore">;

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

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#22C55E" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#EF4444" },
];

const TIME_ESTIMATES = [5, 10, 15, 30, 45, 60];

export default function AddChoreScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const addChore = useChoreStore((s) => s.addChore);
  const inputRef = useRef<TextInput>(null);

  const [contextDescription, setContextDescription] = useState("");
  const [selectedArea, setSelectedArea] = useState<AreaTag>("Kitchen");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const handleTakePhoto = () => {
    if (!contextDescription.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    navigation.navigate("Camera", {
      contextDescription: contextDescription.trim(),
      areaTag: selectedArea,
      dueDate: dueDate?.getTime(),
      priority,
      estimatedMinutes,
    });
  };

  const handleSkipPhoto = async () => {
    if (!contextDescription.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCreating(true);

    try {
      // Get AI tip without image
      const response = await getOpenAITextResponse(
        [
          {
            role: "user",
            content: `You are a helpful cleaning assistant. The user needs to clean: "${contextDescription.trim()}" in the ${selectedArea}.

Provide:
1. A short task name (2-4 words, like "Clean Dishes", "Sweep Floor", "Fold Clothes")
2. A cleaning tip that is EXACTLY 110 characters or less. Make it actionable and specific. End with "daily smart!"

Example tip format: "Rinse as you go, soak tough pans early, use hot water, and load efficiently to wash dishes fast. daily smart!"

Respond in this exact JSON format:
{"taskName": "short name here", "tip": "your 110 char max tip here ending with daily smart!"}`,
          },
        ],
        { temperature: 0.7 }
      );

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);

        addChore({
          name: analysis.taskName || "New Task",
          contextDescription: contextDescription.trim(),
          aiTip: analysis.tip || "Keep your space clean and organized. daily smart!",
          areaTag: selectedArea,
          dueDate: dueDate?.getTime(),
          priority,
          estimatedMinutes,
        });

        navigation.popToTop();
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.log("Error creating task:", error);
      // Create with default tip if AI fails
      addChore({
        name: contextDescription.trim().slice(0, 30),
        contextDescription: contextDescription.trim(),
        aiTip: "Keep your space clean and organized. daily smart!",
        areaTag: selectedArea,
        dueDate: dueDate?.getTime(),
        priority,
        estimatedMinutes,
      });
      navigation.popToTop();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 active:opacity-60"
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text }} className="text-lg font-semibold">
            New Task
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Description label — plain View, no animation, so it never eats touches */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
              What needs cleaning?
            </Text>
            <Text style={{ color: colors.secondaryText, fontSize: 15 }}>
              Be specific so the AI can give you the best tips
            </Text>
          </View>

          {/* TextInput — plain collapsable={false} View, no Pressable wrapper */}
          <View collapsable={false}>
            <TextInput
              ref={inputRef}
              style={{
                backgroundColor: colors.secondaryText + "15",
                color: colors.text,
                borderRadius: 16,
                padding: 16,
                fontSize: 16,
                minHeight: 110,
                textAlignVertical: "top",
                marginBottom: 4,
              }}
              placeholder="e.g., bathtub with toys, dishes in the sink..."
              placeholderTextColor={colors.secondaryText + "80"}
              value={contextDescription}
              onChangeText={setContextDescription}
              multiline
              autoCorrect={false}
              blurOnSubmit={false}
              scrollEnabled={false}
            />
          </View>

          {/* Area Selection */}
          <Animated.View entering={FadeIn.delay(150).duration(400)}>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-6 mb-3"
            >
              Select area
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {AREA_TAGS.map((area) => {
                const isSelected = selectedArea === area;
                return (
                  <Pressable
                    key={area}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedArea(area);
                    }}
                    style={{
                      backgroundColor: isSelected
                        ? colors.accents[0]
                        : colors.secondaryText + "10",
                    }}
                    className="flex-row items-center px-3 py-2.5 rounded-full active:scale-95"
                  >
                    <Ionicons
                      name={AREA_ICONS[area]}
                      size={16}
                      color={isSelected ? "#FFFFFF" : colors.text}
                    />
                    <Text
                      style={{ color: isSelected ? "#FFFFFF" : colors.text }}
                      className="ml-1.5 font-medium text-sm"
                    >
                      {area}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Priority Selection */}
          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-6 mb-3"
            >
              Priority
            </Text>

            <View className="flex-row gap-3">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <Pressable
                    key={p.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPriority(p.value);
                    }}
                    style={{
                      backgroundColor: isSelected ? p.color + "20" : colors.secondaryText + "10",
                      borderColor: isSelected ? p.color : "transparent",
                      borderWidth: 2,
                    }}
                    className="flex-1 py-3 rounded-xl items-center active:scale-95"
                  >
                    <View
                      style={{ backgroundColor: p.color }}
                      className="w-3 h-3 rounded-full mb-1"
                    />
                    <Text
                      style={{ color: isSelected ? p.color : colors.text }}
                      className="font-semibold text-sm"
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Time Estimate */}
          <Animated.View entering={FadeIn.delay(250).duration(400)}>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-6 mb-3"
            >
              Estimated time (optional)
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {TIME_ESTIMATES.map((mins) => {
                  const isSelected = estimatedMinutes === mins;
                  return (
                    <Pressable
                      key={mins}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEstimatedMinutes(isSelected ? undefined : mins);
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? colors.accents[1] || colors.accents[0]
                          : colors.secondaryText + "10",
                      }}
                      className="px-4 py-2.5 rounded-full active:scale-95"
                    >
                      <Text
                        style={{ color: isSelected ? "#FFFFFF" : colors.text }}
                        className="font-medium"
                      >
                        {mins < 60 ? `${mins} min` : "1 hr"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Due Date */}
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-6 mb-3"
            >
              Due date (optional)
            </Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{ backgroundColor: colors.secondaryText + "10" }}
              className="flex-row items-center justify-between rounded-2xl p-4 active:opacity-80"
            >
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: colors.accents[0] + "20" }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={colors.accents[0]}
                  />
                </View>
                <Text style={{ color: colors.text }} className="ml-3 text-base font-medium">
                  {dueDate
                    ? dueDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "No due date"}
                </Text>
              </View>
              {dueDate && (
                <Pressable
                  onPress={() => setDueDate(undefined)}
                  className="p-1 active:opacity-60"
                >
                  <Ionicons name="close-circle" size={24} color={colors.secondaryText} />
                </Pressable>
              )}
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
          </Animated.View>

          <View className="h-40" />
        </ScrollView>

        {/* Bottom Buttons */}
        <Animated.View entering={FadeIn.delay(350).duration(400)} className="px-5 pb-6">
          {/* Take Photo Button */}
          <Pressable
            onPress={handleTakePhoto}
            disabled={!contextDescription.trim() || isCreating}
            className="rounded-2xl overflow-hidden mb-3"
          >
            <LinearGradient
              colors={
                contextDescription.trim() && !isCreating
                  ? [colors.accents[0], colors.accents[1] || colors.accents[0]]
                  : [colors.secondaryText + "40", colors.secondaryText + "40"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="camera" size={22} color="#FFFFFF" />
              <Text className="text-white text-lg font-semibold ml-2">
                Take Photo
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Skip Photo Button */}
          <Pressable
            onPress={handleSkipPhoto}
            disabled={!contextDescription.trim() || isCreating}
            style={{
              backgroundColor: contextDescription.trim() && !isCreating
                ? colors.secondaryText + "15"
                : colors.secondaryText + "10",
            }}
            className="rounded-2xl py-4 items-center active:opacity-80"
          >
            {isCreating ? (
              <View className="flex-row items-center">
                <Text style={{ color: colors.text }} className="text-base font-medium">
                  Creating task...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="flash" size={20} color={colors.accents[0]} />
                <Text style={{ color: colors.text }} className="text-base font-medium ml-2">
                  Quick Add (No Photo)
                </Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
