import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Share, TextInput, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useThemeColors } from "../state/themeStore";
import { useChoreStore } from "../state/choreStore";
import { format } from "date-fns";
import { AreaTag } from "../types/chore";
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Props = NativeStackScreenProps<RootStackParamList, "ChoreDetail">;

const AREA_ICONS: Record<AreaTag, keyof typeof Ionicons.glyphMap> = {
  Kitchen: "restaurant-outline",
  Bathroom: "water-outline",
  Bedroom: "bed-outline",
  "Living Room": "tv-outline",
  Garage: "car-outline",
  Outdoor: "leaf-outline",
  Other: "ellipsis-horizontal",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
};

export default function ChoreDetailScreen({ navigation, route }: Props) {
  const { choreId } = route.params;
  const colors = useThemeColors();

  const getChoreById = useChoreStore((s) => s.getChoreById);
  const completeChore = useChoreStore((s) => s.completeChore);
  const uncompleteChore = useChoreStore((s) => s.uncompleteChore);
  const deleteChore = useChoreStore((s) => s.deleteChore);
  const addNote = useChoreStore((s) => s.addNote);

  const chore = getChoreById(choreId);
  const buttonScale = useSharedValue(1);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(chore?.notes || "");

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!chore) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color={colors.secondaryText} />
          <Text style={{ color: colors.text }} className="text-xl font-bold mt-4">
            Task not found
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: colors.accents[0] }}
            className="mt-6 px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasBeforeImage = Boolean(chore.beforeImageUri);
  const hasAfterImage = Boolean(chore.afterImageUri);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const shareOptions: { message: string; url?: string } = {
        message: `${chore.name}\n\n${chore.aiTip}\n\nShared from Cleanism`,
      };
      if (chore.afterImageUri) {
        shareOptions.url = chore.afterImageUri;
      } else if (chore.beforeImageUri) {
        shareOptions.url = chore.beforeImageUri;
      }
      await Share.share(shareOptions);
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleToggleComplete = () => {
    Haptics.notificationAsync(
      chore.isCompleted
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    if (chore.isCompleted) {
      uncompleteChore(choreId);
    } else {
      completeChore(choreId);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.goBack();
    setTimeout(() => {
      deleteChore(choreId);
    }, 100);
  };

  const handleSaveNotes = () => {
    addNote(choreId, notesText);
    setIsEditingNotes(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} className="flex-row items-center justify-between px-5 py-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            className="p-2 -ml-2 active:opacity-60"
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <View className="flex-row">
            <Pressable
              onPress={handleShare}
              style={{ backgroundColor: colors.accents[0] + "15" }}
              className="p-2.5 rounded-full mr-2 active:opacity-60"
            >
              <Ionicons name="share-outline" size={22} color={colors.accents[0]} />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={{ backgroundColor: "#EF444415" }}
              className="p-2.5 rounded-full active:opacity-60"
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Before/After Section (shown when there is at least a before image) */}
          {hasBeforeImage && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)} className="mx-5 mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.text }} className="text-lg font-bold">
                  Before & After
                </Text>
                {hasAfterImage && (
                  <View style={{ backgroundColor: colors.accents[2] + "20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="trophy" size={13} color={colors.accents[2]} />
                    <Text style={{ color: colors.accents[2], fontSize: 12, fontWeight: "700", marginLeft: 4 }}>
                      Completed!
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Before image */}
                <View style={{ flex: 1, borderRadius: 20, overflow: "hidden" }}>
                  <Image
                    source={{ uri: chore.beforeImageUri }}
                    style={{ height: 170 }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.65)"]}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70 }}
                  />
                  <View style={{ position: "absolute", bottom: 10, left: 12 }}>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>BEFORE</Text>
                    </View>
                  </View>
                </View>

                {/* After image or add button */}
                {hasAfterImage ? (
                  <Pressable
                    onPress={() => navigation.navigate("AfterCamera", { choreId })}
                    style={{ flex: 1, borderRadius: 20, overflow: "hidden" }}
                  >
                    <Image
                      source={{ uri: chore.afterImageUri }}
                      style={{ height: 170 }}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.65)"]}
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70 }}
                    />
                    <View style={{ position: "absolute", bottom: 10, left: 12 }}>
                      <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>AFTER</Text>
                      </View>
                    </View>
                    {/* Trophy badge */}
                    <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: colors.accents[2], borderRadius: 14, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="trophy" size={14} color="#fff" />
                    </View>
                    {/* Retake hint */}
                    <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 }}>
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>Tap to retake</Text>
                    </View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => navigation.navigate("AfterCamera", { choreId })}
                    style={{
                      flex: 1,
                      height: 170,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: colors.accents[0] + "50",
                      borderStyle: "dashed",
                      backgroundColor: colors.accents[0] + "08",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinearGradient
                      colors={[colors.accents[0] + "20", colors.accents[1] ? colors.accents[1] + "10" : colors.accents[0] + "05"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 18 }}
                    />
                    <View style={{ backgroundColor: colors.accents[0] + "20", borderRadius: 24, padding: 12, marginBottom: 8 }}>
                      <Ionicons name="camera" size={26} color={colors.accents[0]} />
                    </View>
                    <Text style={{ color: colors.accents[0], fontSize: 13, fontWeight: "700", textAlign: "center" }}>
                      Add After{"\n"}Photo
                    </Text>
                    <Text style={{ color: colors.secondaryText, fontSize: 11, marginTop: 4, textAlign: "center" }}>
                      Show your work!
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Pride message when both photos exist */}
              {hasAfterImage && (
                <LinearGradient
                  colors={[colors.accents[2] + "18", colors.accents[1] ? colors.accents[1] + "10" : colors.accents[0] + "10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 14, padding: 14, marginTop: 10, flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 22 }}>🎉</Text>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                      Great work!
                    </Text>
                    <Text style={{ color: colors.secondaryText, fontSize: 12, marginTop: 2 }}>
                      You should be proud of what you accomplished.
                    </Text>
                  </View>
                </LinearGradient>
              )}
            </Animated.View>
          )}

          {/* Image header card (when no before image) */}
          {!hasBeforeImage && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mx-5 mb-5">
              <View
                style={{ backgroundColor: colors.secondaryText + "10" }}
                className="rounded-3xl p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View
                    style={{ backgroundColor: colors.accents[1] + "20" }}
                    className="flex-row items-center px-4 py-2 rounded-full"
                  >
                    <Ionicons
                      name={AREA_ICONS[chore.areaTag]}
                      size={18}
                      color={colors.accents[1]}
                    />
                    <Text
                      style={{ color: colors.accents[1] }}
                      className="text-sm font-semibold ml-2"
                    >
                      {chore.areaTag}
                    </Text>
                  </View>
                  {chore.isCompleted && (
                    <View
                      style={{ backgroundColor: colors.accents[2] }}
                      className="flex-row items-center px-3 py-1.5 rounded-full"
                    >
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs font-bold ml-1">Done</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mt-4">
                  {chore.priority && (
                    <View
                      style={{ backgroundColor: PRIORITY_COLORS[chore.priority] + "20" }}
                      className="flex-row items-center px-3 py-1.5 rounded-full mr-2"
                    >
                      <View
                        style={{ backgroundColor: PRIORITY_COLORS[chore.priority] }}
                        className="w-2 h-2 rounded-full mr-1.5"
                      />
                      <Text
                        style={{ color: PRIORITY_COLORS[chore.priority] }}
                        className="text-xs font-semibold"
                      >
                        {PRIORITY_LABELS[chore.priority]}
                      </Text>
                    </View>
                  )}
                  {chore.estimatedMinutes && (
                    <View
                      style={{ backgroundColor: colors.secondaryText + "15" }}
                      className="flex-row items-center px-3 py-1.5 rounded-full"
                    >
                      <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                      <Text style={{ color: colors.secondaryText }} className="text-xs font-medium ml-1">
                        {chore.estimatedMinutes < 60 ? `${chore.estimatedMinutes} min` : "1 hour"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Add after photo section even without a before photo */}
              <Pressable
                onPress={() => navigation.navigate("AfterCamera", { choreId })}
                style={{
                  marginTop: 10,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1.5,
                  borderColor: hasAfterImage ? colors.accents[2] + "60" : colors.accents[0] + "40",
                  borderStyle: hasAfterImage ? "solid" : "dashed",
                }}
              >
                {hasAfterImage ? (
                  <View>
                    <Image source={{ uri: chore.afterImageUri }} style={{ height: 160, borderRadius: 14 }} resizeMode="cover" />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.6)"]}
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, borderRadius: 14 }}
                    />
                    <View style={{ position: "absolute", bottom: 10, left: 12, flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="trophy" size={14} color="#FFD700" />
                      <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 5, fontSize: 13 }}>After Photo</Text>
                    </View>
                    <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>Tap to retake</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ backgroundColor: colors.accents[0] + "08", padding: 16, flexDirection: "row", alignItems: "center" }}>
                    <View style={{ backgroundColor: colors.accents[0] + "20", borderRadius: 12, padding: 10, marginRight: 12 }}>
                      <Ionicons name="camera" size={22} color={colors.accents[0]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.accents[0], fontWeight: "700", fontSize: 14 }}>Add After Photo</Text>
                      <Text style={{ color: colors.secondaryText, fontSize: 12, marginTop: 2 }}>Capture your results and feel proud</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.accents[0]} />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          )}

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-5 mb-4">
            <Text
              style={{ color: colors.text }}
              className="text-2xl font-bold"
            >
              {chore.name}
            </Text>
          </Animated.View>

          {/* Priority and Time (for tasks with before image) */}
          {hasBeforeImage && (chore.priority || chore.estimatedMinutes) && (
            <Animated.View entering={FadeInDown.delay(220).duration(400)} className="px-5 mb-4">
              <View className="flex-row items-center">
                {chore.priority && (
                  <View
                    style={{ backgroundColor: PRIORITY_COLORS[chore.priority] + "20" }}
                    className="flex-row items-center px-3 py-1.5 rounded-full mr-2"
                  >
                    <View
                      style={{ backgroundColor: PRIORITY_COLORS[chore.priority] }}
                      className="w-2 h-2 rounded-full mr-1.5"
                    />
                    <Text
                      style={{ color: PRIORITY_COLORS[chore.priority] }}
                      className="text-xs font-semibold"
                    >
                      {PRIORITY_LABELS[chore.priority]}
                    </Text>
                  </View>
                )}
                {chore.estimatedMinutes && (
                  <View
                    style={{ backgroundColor: colors.secondaryText + "15" }}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                  >
                    <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                    <Text style={{ color: colors.secondaryText }} className="text-xs font-medium ml-1">
                      {chore.estimatedMinutes < 60 ? `${chore.estimatedMinutes} min` : "1 hour"}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Due Date */}
          {chore.dueDate && (
            <Animated.View entering={FadeInDown.delay(250).duration(400)} className="px-5 mb-4">
              <View
                style={{ backgroundColor: colors.secondaryText + "10" }}
                className="flex-row items-center p-4 rounded-2xl"
              >
                <View
                  style={{ backgroundColor: colors.accents[0] + "20" }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="calendar" size={20} color={colors.accents[0]} />
                </View>
                <View className="ml-3">
                  <Text style={{ color: colors.secondaryText }} className="text-xs font-medium">
                    Due Date
                  </Text>
                  <Text style={{ color: colors.text }} className="text-base font-semibold">
                    {format(chore.dueDate, "EEEE, MMMM d")}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* AI Tip */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-5 mb-4">
            <View className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={[colors.accents[0] + "20", (colors.accents[1] || colors.accents[0]) + "15"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16 }}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    style={{ backgroundColor: colors.accents[0] + "30" }}
                    className="w-8 h-8 rounded-full items-center justify-center"
                  >
                    <Ionicons name="bulb" size={18} color={colors.accents[0]} />
                  </View>
                  <Text style={{ color: colors.accents[0] }} className="ml-2 font-bold text-base">
                    Smart Tip
                  </Text>
                </View>
                <Text style={{ color: colors.text }} className="text-base leading-6">
                  {chore.aiTip}
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Context Description */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)} className="px-5 mb-4">
            <View
              style={{ backgroundColor: colors.secondaryText + "10" }}
              className="p-4 rounded-2xl"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text-outline" size={18} color={colors.secondaryText} />
                <Text style={{ color: colors.secondaryText }} className="text-sm font-semibold ml-2">
                  Your Description
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="text-base leading-6">
                {chore.contextDescription}
              </Text>
            </View>
          </Animated.View>

          {/* Notes Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="px-5 mb-6">
            <View
              style={{ backgroundColor: colors.accents[3] ? colors.accents[3] + "15" : colors.secondaryText + "08" }}
              className="p-4 rounded-2xl"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={18} color={colors.accents[3] || colors.accents[0]} />
                  <Text style={{ color: colors.accents[3] || colors.accents[0] }} className="text-sm font-semibold ml-2">
                    Personal Notes
                  </Text>
                </View>
                {!isEditingNotes && (
                  <Pressable
                    onPress={() => {
                      setNotesText(chore.notes || "");
                      setIsEditingNotes(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ backgroundColor: colors.accents[0] + "20" }}
                    className="px-3 py-1.5 rounded-full active:opacity-70"
                  >
                    <Text style={{ color: colors.accents[0] }} className="text-xs font-semibold">
                      {chore.notes ? "Edit" : "Add"}
                    </Text>
                  </Pressable>
                )}
              </View>

              {isEditingNotes ? (
                <View>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.accents[0] + "40",
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                    placeholder="Add your notes here..."
                    placeholderTextColor={colors.secondaryText + "80"}
                    value={notesText}
                    onChangeText={setNotesText}
                    multiline
                    autoFocus
                  />
                  <View className="flex-row justify-end mt-3 gap-2">
                    <Pressable
                      onPress={() => {
                        setIsEditingNotes(false);
                        setNotesText(chore.notes || "");
                      }}
                      style={{ backgroundColor: colors.secondaryText + "20" }}
                      className="px-4 py-2 rounded-xl active:opacity-70"
                    >
                      <Text style={{ color: colors.text }} className="font-medium">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveNotes}
                      style={{ backgroundColor: colors.accents[0] }}
                      className="px-4 py-2 rounded-xl active:opacity-70"
                    >
                      <Text className="text-white font-medium">Save</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text style={{ color: chore.notes ? colors.text : colors.secondaryText }} className="text-base leading-6">
                  {chore.notes || "No notes added yet. Tap \"Add\" to add personal notes."}
                </Text>
              )}
            </View>
          </Animated.View>

          <View className="h-28" />
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(400)}
          style={animatedButtonStyle}
          className="px-5 pb-6 absolute bottom-0 left-0 right-0"
        >
          <View
            style={{ backgroundColor: colors.background }}
            className="pt-4"
          >
            <Pressable
              onPress={handleToggleComplete}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              className="rounded-2xl overflow-hidden"
            >
              {chore.isCompleted ? (
                <View
                  style={{ backgroundColor: colors.secondaryText + "20" }}
                  className="py-4 flex-row items-center justify-center"
                >
                  <Ionicons name="refresh" size={24} color={colors.text} />
                  <Text style={{ color: colors.text }} className="text-lg font-semibold ml-2">
                    Mark as Incomplete
                  </Text>
                </View>
              ) : (
                <LinearGradient
                  colors={[colors.accents[2], colors.accents[1] || colors.accents[2]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text className="text-white text-lg font-semibold ml-2">Mark as Done</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
