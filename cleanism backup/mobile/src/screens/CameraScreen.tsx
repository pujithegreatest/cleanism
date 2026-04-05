import React, { useState, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useChoreStore } from "../state/choreStore";
import { useThemeColors } from "../state/themeStore";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

type Props = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation, route }: Props) {
  const { contextDescription, areaTag, dueDate, priority, estimatedMinutes } = route.params;

  const colors = useThemeColors();

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const addChore = useChoreStore((s) => s.addChore);

  if (!permission) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        className="items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.accents[0]} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        className="items-center justify-center px-6"
      >
        <Ionicons name="camera-outline" size={80} color={colors.secondaryText} />
        <Text style={{ color: colors.text }} className="text-xl font-bold mt-6 text-center">
          Camera Permission Required
        </Text>
        <Text style={{ color: colors.secondaryText }} className="text-base mt-2 text-center">
          We need camera access to take photos of your chores
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

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Step 1: just capture — no state changes before takePictureAsync to avoid Android surface crash
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      if (!photo?.uri) {
        setError("Failed to capture photo. Try again.");
        return;
      }
      setCapturedImage(photo.uri);
    } catch {
      setError("Failed to capture photo. Try again.");
    }
  };

  // Step 2: user-triggered analysis
  const analyzeImage = async () => {
    if (!capturedImage) return;
    try {
      setIsAnalyzing(true);
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const base64 = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const backendUrl = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64, contextDescription }),
      });

      if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);

      const analysis = (await res.json()) as { taskName: string; tip: string };

      addChore({
        name: analysis.taskName || "New Chore",
        beforeImageUri: capturedImage,
        contextDescription,
        aiTip: analysis.tip || "Keep your space clean and organized. daily smart!",
        areaTag,
        dueDate,
        priority,
        estimatedMinutes,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.popToTop();
    } catch {
      setIsAnalyzing(false);
      setError("Analysis failed. Please try again.");
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setError(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Camera always mounted to avoid Android surface crash */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {/* ── PREVIEW STATE ── */}
      {capturedImage && !isAnalyzing && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Image
            source={{ uri: capturedImage }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            resizeMode="cover"
          />

          {/* Top gradient */}
          <LinearGradient
            colors={["rgba(0,0,0,0.65)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130 }}
          />

          {/* Bottom gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 260 }}
          />

          {/* Header */}
          <View style={{ position: "absolute", top: 56, left: 24, right: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Pressable
                onPress={retake}
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 10 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="image-outline" size={15} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 14 }}>Preview</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>
          </View>

          {/* Bottom actions */}
          <View style={{ position: "absolute", bottom: 48, left: 24, right: 24 }}>
            {error && (
              <View style={{ backgroundColor: "rgba(239,68,68,0.85)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: "#fff", textAlign: "center", fontSize: 14 }}>{error}</Text>
              </View>
            )}

            <Text style={{ color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: 20, fontSize: 15, lineHeight: 22 }}>
              Happy with the photo? Let AI analyze it to create your task.
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Retake */}
              <Pressable
                onPress={retake}
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 18, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 16 }}>Retake</Text>
              </Pressable>

              {/* Analyze */}
              <Pressable
                onPress={analyzeImage}
                style={{ flex: 1.6, borderRadius: 18, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={[colors.accents[0], colors.accents[1] || colors.accents[0]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 16 }}>Analyze with AI</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ── ANALYZING STATE ── */}
      {isAnalyzing && capturedImage && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Image
            source={{ uri: capturedImage }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 24, padding: 32, alignItems: "center", marginHorizontal: 24 }}>
              <ActivityIndicator size="large" color={colors.accents[0]} />
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 16 }}>
                Analyzing your photo...
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 14, marginTop: 8, textAlign: "center" }}>
                Getting smart cleaning tips
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ── CAMERA UI ── hidden once a photo is taken */}
      {!capturedImage && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Header */}
          <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24, backgroundColor: "rgba(0,0,0,0.4)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 }}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>Take Photo</Text>
              <Pressable
                onPress={toggleCameraFacing}
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 }}
              >
                <Ionicons name="camera-reverse" size={28} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Context pill */}
          <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, padding: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", marginBottom: 3 }}>
                WHAT YOU DESCRIBED
              </Text>
              <Text style={{ color: "#fff", fontSize: 14 }} numberOfLines={2}>
                {contextDescription}
              </Text>
            </View>
          </View>

          {/* Viewfinder */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 280, height: 280, borderWidth: 3, borderColor: "rgba(255,255,255,0.7)", borderRadius: 24 }} />
          </View>

          {/* Error */}
          {error && (
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
              <View style={{ backgroundColor: "rgba(239,68,68,0.8)", borderRadius: 12, padding: 12 }}>
                <Text style={{ color: "#fff", textAlign: "center", fontSize: 14 }}>{error}</Text>
              </View>
            </View>
          )}

          {/* Shutter */}
          <View style={{ paddingBottom: 48, paddingHorizontal: 24, backgroundColor: "rgba(0,0,0,0.4)", paddingTop: 16, alignItems: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, marginBottom: 24, textAlign: "center" }}>
              Center the area that needs cleaning
            </Text>
            <Pressable
              onPress={takePicture}
              style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}
            >
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="camera" size={32} color={colors.accents[0]} />
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
