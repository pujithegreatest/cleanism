import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "./types";
import { useThemeColors } from "../state/themeStore";

// Screens
import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AddChoreScreen from "../screens/AddChoreScreen";
import ChoreDetailScreen from "../screens/ChoreDetailScreen";
import AfterCameraScreen from "../screens/AfterCameraScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AddChore"
        component={AddChoreScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="ChoreDetail"
        component={ChoreDetailScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AfterCamera"
        component={AfterCameraScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accents[0],
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.secondaryText + "20",
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Chores",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
