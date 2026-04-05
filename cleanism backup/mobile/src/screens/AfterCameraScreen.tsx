import React, { useState, useRef } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useChoreStore } from "../state/choreStore";
import { useThemeColors } from "../state/themeStore";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

type Props = NativeStackScreenProps<RootStackParamList, "AfterCamera">;

export default function AfterCameraScreen({ navigation, route }: Props) {
  const { choreId } = route.params;
  const colors = useThemeColors();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const updateChore = useChoreStore((s) => s.updateChore);

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }} className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.accents[0]} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center px-6">
        <Ionicons name="camera-outline" size={80} color={colors.secondaryText} />
        <Text style={{ color: colors.text }} className="text-xl font-bold mt-6 text-center">
          Camera Permission Required
        </Text>
        <Text style={{ color: colors.secondaryText }} className="text-base mt-2 text-center">
          We need camera access to capture your after photo
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ backgroundColor: colors.accents[0] }}
          className="rounded-2xl px-8 py-4 mt-6 active:opacity-80"
        >
          <Text className="text-white text-lg font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch {
      // ignore
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateChore(choreId, { afterImageUri: capturedImage });
    navigation.goBack();
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Preview screen after capture
  if (capturedImage) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Image source={{ uri: capturedImage }} style={{ flex: 1 }} resizeMode="cover" />

        {/* Dark overlay at top */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
        />

        {/* Dark overlay at bottom */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200 }}
        />

        {/* Header */}
        <View style={{ position: "absolute", top: 60, left: 0, right: 0, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 15 }}>After Photo</Text>
            </View>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={{ position: "absolute", bottom: 50, left: 24, right: 24 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 20, fontSize: 15 }}>
            Looking good! Save this as your after photo?
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={handleRetake}
              style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 18, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 16 }}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={isSaving}
              style={{ flex: 1, borderRadius: 18, overflow: "hidden" }}
            >
              <LinearGradient
                colors={[colors.accents[2] || "#22C55E", colors.accents[1] || colors.accents[0]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 16 }}>Save</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {/* Overlay */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 }}
            >
              <Ionicons name="close" size={26} color="white" />
            </Pressable>
            <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="sparkles" size={14} color="#FFD700" />
              <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 6 }}>After Photo</Text>
            </View>
            <Pressable
              onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
              style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 }}
            >
              <Ionicons name="camera-reverse" size={26} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Center guide */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 260, height: 260, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)", borderRadius: 24 }} />
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 16, fontSize: 14, fontWeight: "500" }}>
            Show the cleaned area
          </Text>
        </View>

        {/* Bottom controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={{ paddingTop: 24, paddingBottom: 48, paddingHorizontal: 24, alignItems: "center" }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: 24, fontSize: 15, textAlign: "center" }}>
            Capture the result you are proud of
          </Text>
          <Pressable
            onPress={takePicture}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}
          >
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles" size={28} color={colors.accents[0]} />
            </View>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
}
